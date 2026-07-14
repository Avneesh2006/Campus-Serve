import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateCodingResourceSchema } from "@/lib/validations/career-hub";

async function assertOwnership(userId: string, id: string) {
  const resource = await prisma.codingResource.findUnique({ where: { id } });
  if (!resource || resource.addedById !== userId) return null;
  return resource;
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
    const parsed = updateCodingResourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { provider, ...rest } = parsed.data;

    const resource = await prisma.codingResource.update({
      where: { id },
      data: {
        ...rest,
        ...(provider !== undefined ? { provider: provider || null } : {}),
      },
    });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error("Update coding resource error:", error);
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

  await prisma.codingResource.delete({ where: { id } });

  return NextResponse.json({ message: "Resource deleted" });
}
