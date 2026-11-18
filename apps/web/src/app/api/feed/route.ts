import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    const posts = await prisma.communityPost.findMany({
      where: query
        ? {
            body: {
              contains: query,
            },
          }
        : undefined,
      orderBy: { postedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            nickname: true,
            tier: true,
            picture: true,
            compositeScore: true,
          },
        },
      },
    });

    const formatted = posts.map((p) => {
      let parsedLikes: string[] = [];
      try {
        parsedLikes = JSON.parse(p.likes || "[]");
      } catch {
        parsedLikes = [];
      }
      return {
        ...p,
        likesList: parsedLikes,
        likesCount: parsedLikes.length,
      };
    });

    return NextResponse.json({ posts: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId = "usr_deepak_01", text, imageUrl, cvLabel, cvConfidence, isVerifiedAction } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Post body cannot be empty" }, { status: 400 });
    }

    const post = await prisma.communityPost.create({
      data: {
        userId,
        body: text,
        imageUrl: imageUrl || null,
        cvLabel: cvLabel || "community_activity",
        cvConfidence: cvConfidence || 0.85,
        isVerifiedAction: isVerifiedAction ?? true,
        likes: JSON.stringify([]),
      },
      include: {
        user: {
          select: { id: true, name: true, nickname: true, tier: true, picture: true },
        },
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, userId } = body;

    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let likesList: string[] = [];
    try {
      likesList = JSON.parse(post.likes || "[]");
    } catch {
      likesList = [];
    }

    if (likesList.includes(userId)) {
      likesList = likesList.filter((id) => id !== userId);
    } else {
      likesList.push(userId);
    }

    const updated = await prisma.communityPost.update({
      where: { id: postId },
      data: { likes: JSON.stringify(likesList) },
    });

    return NextResponse.json({
      success: true,
      postId: updated.id,
      likesCount: likesList.length,
      likedByYou: likesList.includes(userId),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
