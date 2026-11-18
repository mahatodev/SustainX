import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const leaderboard = searchParams.get("leaderboard") === "true";

    if (leaderboard) {
      const topUsers = await prisma.user.findMany({
        orderBy: { compositeScore: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          nickname: true,
          tier: true,
          compositeScore: true,
          co2SavedGrams: true,
          plasticSavedGrams: true,
          rewardBalanceInr: true,
          householdSize: true,
          pinCode: true,
          sbtTokenId: true,
          picture: true,
        },
      });
      return NextResponse.json({ users: topUsers });
    }

    const allUsers = await prisma.user.findMany({
      orderBy: { compositeScore: "desc" },
    });
    return NextResponse.json({ users: allUsers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
