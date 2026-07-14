import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateInternshipSchema } from "@/lib/validations/career-hub";

async function assertOwnership(userId: string, id: string) {
  const internship = await prisma.internship.findUnique({ where: { id } });
  if (!internship || internship.postedById !== userId) return null;
  return internship;
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
      { error: "Internship not found or you don't have permission to edit it" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const parsed = updateInternshipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { location, stipend, deadline, ...rest } = parsed.data;

    const internship = await prisma.internship.update({
      where: { id },
      data: {
        ...rest,
        ...(location !== undefined ? { location: location || null } : {}),
        ...(stipend !== undefined ? { stipend: stipend || null } : {}),
        ...(deadline !== undefined
          ? { deadline: deadline ? new Date(deadline) : null }
          : {}),
      },
    });

    return NextResponse.json({ internship });
  } catch (error) {
    console.error("Update internship error:", error);
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
      { error: "Internship not found or you don't have permission to delete it" },
      { status: 404 }
    );
  }

  await prisma.internship.delete({ where: { id } });

  return NextResponse.json({ message: "Internship deleted" });
}
