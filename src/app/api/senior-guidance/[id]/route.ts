import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateSeniorGuidanceSchema } from "@/lib/validations/community";

async function assertOwnership(userId: string, postId: string) {
  const post = await prisma.seniorGuidance.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== userId) return null;
  return post;
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
    const parsed = updateSeniorGuidanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const post = await prisma.seniorGuidance.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Update senior guidance post error:", error);
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

  await prisma.seniorGuidance.delete({ where: { id } });

  return NextResponse.json({ message: "Post deleted" });
}
