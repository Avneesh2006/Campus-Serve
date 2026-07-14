import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateResourceSchema } from "@/lib/validations/academic-hub";

async function assertOwnership(userId: string, resourceId: string) {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });
  if (!resource || resource.uploaderId !== userId) return null;
  return resource;
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

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      uploader: { select: { id: true, name: true, image: true } },
      ratings: true,
      bookmarks: { where: { userId: session.user.id } },
    },
  });

  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const avgRating =
    resource.ratings.length > 0
      ? resource.ratings.reduce((sum, r) => sum + r.value, 0) /
        resource.ratings.length
      : 0;

  return NextResponse.json({
    resource: {
      ...resource,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingCount: resource.ratings.length,
      isBookmarked: resource.bookmarks.length > 0,
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
      { error: "Resource not found or you don't have permission to edit it" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const parsed = updateResourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = { ...parsed.data };
    if (data.description === "") data.description = undefined;
    if (data.author === "") data.author = undefined;

    const resource = await prisma.resource.update({
      where: { id },
      data,
    });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("Update resource error:", error);
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
      { error: "Resource not found or you don't have permission to delete it" },
      { status: 404 }
    );
  }

  await prisma.resource.delete({ where: { id } });

  return NextResponse.json({ message: "Resource deleted" });
}
