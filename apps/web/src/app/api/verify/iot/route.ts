import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeHmacSha256 } from "@/lib/anti-spoof";
import { calculateScore } from "@/lib/scoring-fallback";

const IOT_DEVICE_SECRET = process.env.IOT_DEVICE_SECRET || "sustainx-iot-secret-2024";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const {
      deviceId,
      userId = "usr_deepak_01",
      wasteType = "PET_PLASTIC",
      weightGrams,
      energyKwh = 0,
      timestamp,
      hmacSignature,
    } = payload;

    // Gate 1: Check Minimum Weight Threshold
    if (typeof weightGrams !== "number" || weightGrams < 20.0) {
      return NextResponse.json(
        {
          success: false,
          status: "REJECTED_SPOOF",
          rejectionReason: "ERR_IOT_WEIGHT_UNDERFLOW: Waste deposit delta under minimum 20.0g threshold.",
        },
        { status: 400 }
      );
    }

    // Gate 2: Timestamp Replay Drift (Max 300 seconds allowable tolerance)
    const currentEpoch = Math.floor(Date.now() / 1000);
    const packetEpoch = parseInt(timestamp, 10) || 0;
    if (Math.abs(currentEpoch - packetEpoch) > 300) {
      return NextResponse.json(
        {
          success: false,
          status: "REJECTED_SPOOF",
          rejectionReason: `ERR_IOT_TIMESTAMP_STALE: Packet timestamp drift (${Math.abs(currentEpoch - packetEpoch)}s) exceeds 300s window.`,
        },
        { status: 400 }
      );
    }

    // Gate 3: Cryptographic HMAC-SHA256 Signature Verification
    const rawToSign = `${deviceId}:${userId}:${wasteType}:${weightGrams.toFixed(1)}:${energyKwh.toFixed(3)}:${timestamp}`;
    const expectedSignature = computeHmacSha256(rawToSign, IOT_DEVICE_SECRET);

    if (hmacSignature !== expectedSignature) {
      return NextResponse.json(
        {
          success: false,
          status: "REJECTED_SPOOF",
          rejectionReason: "ERR_IOT_HMAC_MISMATCH: Cryptographic signature forged or invalid device key.",
          debug: { expected: expectedSignature, received: hmacSignature },
        },
        { status: 401 }
      );
    }

    // Fetch user or fallback
    let user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Convert grams to kg for scoring
    const weightKg = weightGrams / 1000.0;
    const scoreResult = calculateScore({
      previousScore: user.compositeScore,
      domain: "WASTE",
      rawValue: weightKg,
      verificationType: "IOT_SIGNED",
      householdSize: user.householdSize,
      aqiLevel: 4,
    });

    const action = await prisma.greenAction.create({
      data: {
        userId: user.id,
        domain: "WASTE",
        verificationType: "IOT_SIGNED",
        rawValue: weightGrams,
        co2EquivalentG: scoreResult.co2SavedGrams,
        confidenceWeight: 1.0,
        iotSignature: hmacSignature,
        status: "VERIFIED",
        txHash: "0xiot" + Math.random().toString(16).substring(2, 10),
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        compositeScore: scoreResult.newCompositeScore,
        tier: scoreResult.tier,
        co2SavedGrams: { increment: scoreResult.co2SavedGrams },
        plasticSavedGrams: { increment: Math.round(weightGrams) },
        rewardBalanceInr: { increment: Math.round(weightGrams * 0.02) },
      },
    });

    return NextResponse.json({
      success: true,
      status: "VERIFIED",
      node: {
        deviceId,
        sensorType: "ESP32-CAM + HX711 + PZEM-004T",
        wasteType,
        weightGrams,
        energyKwh,
      },
      credits: {
        co2SavedGrams: scoreResult.co2SavedGrams,
        plasticGrams: Math.round(weightGrams),
        confidenceMultiplier: 1.0,
      },
      user: {
        newScore: updatedUser.compositeScore,
        tier: updatedUser.tier,
      },
      actionId: action.id,
    });
  } catch (error: any) {
    console.error("IoT Verify Route Error:", error);
    return NextResponse.json({ error: error.message || "IoT verification failure" }, { status: 500 });
  }
}
