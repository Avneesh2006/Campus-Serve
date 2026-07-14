import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [recentPosts, recentListings, recentGuidance] = await Promise.all([
    prisma.forumPost.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true, likes: true } },
      },
    }),
    prisma.marketplaceListing.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        seller: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.seniorGuidance.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  return NextResponse.json({
    recentPosts: recentPosts.map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      isAnonymous: p.isAnonymous,
      author: p.isAnonymous ? { id: p.author.id, name: "Anonymous", email: null } : p.author,
      commentCount: p._count.comments,
      likeCount: p._count.likes,
      createdAt: p.createdAt,
    })),
    recentListings: recentListings.map((l) => ({
      id: l.id,
      title: l.title,
      listingType: l.listingType,
      status: l.status,
      seller: l.seller,
      createdAt: l.createdAt,
    })),
    recentGuidance: recentGuidance.map((g) => ({
      id: g.id,
      title: g.title,
      isAnonymous: g.isAnonymous,
      author: g.isAnonymous ? { id: g.author.id, name: "Anonymous", email: null } : g.author,
      isAnswered: g.isAnswered,
      createdAt: g.createdAt,
    })),
  });
}
