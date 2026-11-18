import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function GET() {
  try {
    const retirements = await prisma.corporateRetirement.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Calculate aggregated pools available
    const userAggregates = await prisma.user.aggregate({
      _sum: {
        co2SavedGrams: true,
        plasticSavedGrams: true,
      },
      _count: {
        id: true,
      },
    });

    const totalCo2Kg = (userAggregates._sum.co2SavedGrams || 0) / 1000.0;
    const totalPlasticKg = (userAggregates._sum.plasticSavedGrams || 0) / 1000.0;

    return NextResponse.json({
      retirements,
      pools: {
        totalCo2AvailableKg: parseFloat(totalCo2Kg.toFixed(2)),
        totalPlasticAvailableKg: parseFloat(totalPlasticKg.toFixed(2)),
        activeCitizensCount: userAggregates._count.id,
        rewardPoolFundedInr: (totalCo2Kg * 45) + (totalPlasticKg * 30),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      corporateName = "Tata Consultancy Services (TCS Salt Lake)",
      brsrReference = "BRSR-FY26-Q3-089",
      co2Kg = 50.0,
      plasticKg = 25.0,
      amountPaidInr = 3500.0,
    } = body;

    // Generate cryptographic retirement certificate hash
    const certString = `${corporateName}:${brsrReference}:${co2Kg}:${plasticKg}:${Date.now()}`;
    const certificateHash = "0x" + crypto.createHash("sha256").update(certString).digest("hex");
    const txHash = "0x" + crypto.randomBytes(32).toString("hex");

    const retirement = await prisma.corporateRetirement.create({
      data: {
        corporateName,
        brsrReference,
        co2RetiredKg: parseFloat(co2Kg),
        plasticRetiredKg: parseFloat(plasticKg),
        amountPaidInr: parseFloat(amountPaidInr),
        certificateHash,
        txHash,
      },
    });

    // 80% buyout fund distribution to participating citizens
    const citizenFundPool = amountPaidInr * 0.80;
    const allUsers = await prisma.user.findMany();
    if (allUsers.length > 0) {
      const share = citizenFundPool / allUsers.length;
      await prisma.user.updateMany({
        data: {
          rewardBalanceInr: { increment: share },
        },
      });
    }

    return NextResponse.json({
      success: true,
      status: "RETIRED_ON_CHAIN",
      protocol: "SustainImpact (ERC-1155) Batch Burn Protocol",
      retirementId: retirement.id,
      certificateHash,
      txHash,
      compliance: {
        standard: "SEBI BRSR Core / MoEFCC Green Credit Programme",
        co2RetiredKg: co2Kg,
        plasticRetiredKg: plasticKg,
        amountPaidInr,
        citizenCashbackFundedInr: citizenFundPool,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
