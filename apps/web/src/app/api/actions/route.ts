import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const domain = searchParams.get("domain");

    const where: any = {};
    if (userId) where.userId = userId;
    if (domain) where.domain = domain;

    const actions = await prisma.greenAction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        user: {
          select: { name: true, nickname: true, tier: true, picture: true }
        }
      }
    });

    return NextResponse.json({ actions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
