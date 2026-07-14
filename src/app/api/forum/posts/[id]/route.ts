import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateForumPostSchema } from "@/lib/validations/community";

async function assertOwnership(userId: string, postId: string) {
  const post = await prisma.forumPost.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== userId) return null;
  return post;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const post = await prisma.forumPost.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: { where: { userId: session.user.id }, select: { id: true } },
      bookmarks: { where: { userId: session.user.id }, select: { id: true } },
      _count: { select: { likes: true, comments: true, bookmarks: true } },
    },
  }).catch(() => null);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({
    post: {
      ...post,
      author: post.isAnonymous
        ? { id: post.author.id, name: "Anonymous", image: null }
        : post.author,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      bookmarkCount: post._count.bookmarks,
      isLiked: post.likes.length > 0,
      isBookmarked: post.bookmarks.length > 0,
      isOwnPost: post.authorId === session.user.id,
    },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await assertOwnership(session.user.id, id);
  if (!existing) {
    return NextResponse.json(
      { error: "Post not found or you don't have permission to edit it" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const parsed = updateForumPostSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const post = await prisma.forumPost.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Update forum post error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await assertOwnership(session.user.id, id);
  if (!existing) {
    return NextResponse.json(
      { error: "Post not found or you don't have permission to delete it" },
      { status: 404 }
    );
  }

  await prisma.forumPost.delete({ where: { id } });

  return NextResponse.json({ message: "Post deleted" });
}
