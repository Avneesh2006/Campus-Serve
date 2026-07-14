import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { forumPostSchema } from "@/lib/validations/community";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q")?.trim();
  const bookmarked = searchParams.get("bookmarked");
  const mine = searchParams.get("mine");
  const sort = searchParams.get("sort") || "recent"; // recent | popular

  const posts = await prisma.forumPost.findMany({
    where: {
      ...(category ? { category: category as never } : {}),
      ...(mine === "true" ? { authorId: session.user.id } : {}),
      ...(bookmarked === "true"
        ? { bookmarks: { some: { userId: session.user.id } } }
        : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { body: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: { where: { userId: session.user.id }, select: { id: true } },
      bookmarks: { where: { userId: session.user.id }, select: { id: true } },
      _count: { select: { likes: true, comments: true, bookmarks: true } },
    },
    orderBy: [
      { isPinned: "desc" },
      sort === "popular" ? { likes: { _count: "desc" } } : { createdAt: "desc" },
    ],
  });

  const shaped = posts.map((p) => ({
    id: p.id,
    category: p.category,
    title: p.title,
    body: p.body,
    isAnonymous: p.isAnonymous,
    isPinned: p.isPinned,
    viewCount: p.viewCount,
    createdAt: p.createdAt,
    author: p.isAnonymous
      ? { id: p.author.id, name: "Anonymous", image: null }
      : p.author,
    likeCount: p._count.likes,
    commentCount: p._count.comments,
    bookmarkCount: p._count.bookmarks,
    isLiked: p.likes.length > 0,
    isBookmarked: p.bookmarks.length > 0,
    isOwnPost: p.authorId === session.user.id,
  }));

  return NextResponse.json({ posts: shaped });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = forumPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { category, title, body: postBody, isAnonymous } = parsed.data;

    const post = await prisma.forumPost.create({
      data: {
        authorId: session.user.id,
        category,
        title,
        body: postBody,
        isAnonymous,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create forum post error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
