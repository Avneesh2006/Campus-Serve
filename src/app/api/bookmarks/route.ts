import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: session.user.id },
    include: {
      resource: {
        include: {
          uploader: { select: { id: true, name: true, image: true } },
          ratings: { select: { value: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const resources = bookmarks.map((b) => {
    const r = b.resource;
    const avgRating =
      r.ratings.length > 0
        ? r.ratings.reduce((sum, x) => sum + x.value, 0) / r.ratings.length
        : 0;
    return {
      ...r,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingCount: r.ratings.length,
      isBookmarked: true,
    };
  });

  return NextResponse.json({ resources });
}
