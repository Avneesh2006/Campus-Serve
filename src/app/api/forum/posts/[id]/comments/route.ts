import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations/community";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const comments = await prisma.postComment.findMany({
    where: { postId: id },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: { where: { userId: session.user.id }, select: { id: true } },
      _count: { select: { likes: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const shaped = comments.map((c) => ({
    id: c.id,
    postId: c.postId,
    parentId: c.parentId,
    body: c.body,
    isAnonymous: c.isAnonymous,
    createdAt: c.createdAt,
    author: c.isAnonymous
      ? { id: c.author.id, name: "Anonymous", image: null }
      : c.author,
    likeCount: c._count.likes,
    isLiked: c.likes.length > 0,
    isOwnComment: c.authorId === session.user.id,
  }));

  return NextResponse.json({ comments: shaped });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const post = await prisma.forumPost.findUnique({ where: { id } });
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = commentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { body: commentBody, isAnonymous, parentId } = parsed.data;

    if (parentId) {
      const parent = await prisma.postComment.findUnique({ where: { id: parentId } });
      if (!parent || parent.postId !== id) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
      }
    }

    const comment = await prisma.postComment.create({
      data: {
        postId: id,
        authorId: session.user.id,
        parentId: parentId || null,
        body: commentBody,
        isAnonymous,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
