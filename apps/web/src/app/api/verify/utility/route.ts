import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateScore } from "@/lib/scoring-fallback";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { billerId, consumerNumber, householdOccupants, userId = "usr_deepak_01" } = body;

    if (!billerId || !consumerNumber) {
      return NextResponse.json({ error: "Missing billerId or consumerNumber" }, { status: 400 });
    }

    // Deterministic simulation based on hash of consumerNumber
    let hash = 0;
    for (let i = 0; i < consumerNumber.length; i++) {
      hash = (hash << 5) - hash + consumerNumber.charCodeAt(i);
      hash |= 0;
    }
    const seed = Math.abs(hash);

    const occupants = parseInt(householdOccupants, 10) || 3;
    let baselineUsage = 180;
    let actualUsage = 120;
    let domain = "ELECTRICITY";
    let unit = "kWh";

    if (billerId === "KMC-WATER") {
      domain = "WATER";
      unit = "Liters";
      baselineUsage = 5000;
      actualUsage = 3800 + (seed % 1000);
    } else {
      // CESC or WBSEDCL
      baselineUsage = 160 + (seed % 60);
      actualUsage = 100 + (seed % 40);
    }

    const savedUnits = Math.max(0, baselineUsage - actualUsage);

    // Look up or default user
    let user = await prisma.user.findFirst({ where: { id: userId } });
    if (!user) {
      user = await prisma.user.findFirst();
    }
    if (!user) {
      return NextResponse.json({ error: "No user found in database. Please run seed script." }, { status: 404 });
    }

    // Calculate score change using SustainX formula
    const scoreResult = calculateScore({
      previousScore: user.compositeScore,
      domain,
      rawValue: savedUnits,
      verificationType: "BBPS_API",
      householdSize: occupants,
      aqiLevel: 4,
    });

    // Record action and update user
    const action = await prisma.greenAction.create({
      data: {
        userId: user.id,
        domain,
        verificationType: "BBPS_API",
        rawValue: savedUnits,
        co2EquivalentG: scoreResult.co2SavedGrams,
        confidenceWeight: scoreResult.confidenceWeight,
        aqiMultiplier: scoreResult.aqiMultiplier,
        status: "VERIFIED",
        txHash: "0xbbps" + Math.random().toString(16).substring(2, 10),
      },
    });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        compositeScore: scoreResult.newCompositeScore,
        tier: scoreResult.tier,
        co2SavedGrams: { increment: scoreResult.co2SavedGrams },
        rewardBalanceInr: { increment: scoreResult.co2SavedGrams * 0.05 }, // 5 paise per 100g
      },
    });

    return NextResponse.json({
      success: true,
      protocol: "Bharat Connect (BBPS) Direct Invoicing dMRV",
      biller: billerId,
      consumerNumber,
      billPeriod: "October 2026",
      usageData: {
        baselineUsage: `${baselineUsage} ${unit}`,
        actualUsage: `${actualUsage} ${unit}`,
        savedUnits: `${savedUnits} ${unit}`,
      },
      verification: {
        status: "VERIFIED",
        confidence: scoreResult.confidenceWeight,
        co2SavedGrams: scoreResult.co2SavedGrams,
        newScore: updatedUser.compositeScore,
        newTier: updatedUser.tier,
      },
      actionId: action.id,
    });
  } catch (error: any) {
    console.error("BBPS Verify API Error:", error);
    return NextResponse.json({ error: error.message || "BBPS verification failed" }, { status: 500 });
  }
}
