import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, commentId } = await params;

  const comment = await prisma.postComment.findUnique({ where: { id: commentId } });
  if (!comment || comment.postId !== id) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }
  if (comment.authorId !== session.user.id) {
    return NextResponse.json(
      { error: "You don't have permission to delete this comment" },
      { status: 403 }
    );
  }

  await prisma.postComment.delete({ where: { id: commentId } });

  return NextResponse.json({ message: "Comment deleted" });
}
