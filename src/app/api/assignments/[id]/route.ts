import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateAssignmentSchema } from "@/lib/validations/assignments";
import { effectiveStatus } from "@/lib/assignments";

async function assertOwnership(userId: string, assignmentId: string) {
  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment || assignment.userId !== userId) return null;
  return assignment;
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
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: { attachments: true },
  });

  if (!assignment || assignment.userId !== session.user.id) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  return NextResponse.json({
    assignment: {
      ...assignment,
      effectiveStatus: effectiveStatus(assignment.dueDate, assignment.status),
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
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = updateAssignmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { attachments, dueDate, reminderAt, description, ...rest } = parsed.data;

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        ...rest,
        ...(description !== undefined
          ? { description: description || null }
          : {}),
        ...(dueDate ? { dueDate: new Date(dueDate) } : {}),
        ...(reminderAt !== undefined
          ? { reminderAt: reminderAt ? new Date(reminderAt) : null }
          : {}),
        ...(attachments
          ? {
              attachments: {
                deleteMany: {},
                create: attachments.map((a) => ({
                  name: a.name,
                  fileUrl: a.fileUrl,
                  fileKind: a.fileKind,
                  fileSizeKb: a.fileSizeKb ?? null,
                })),
              },
            }
          : {}),
      },
      include: { attachments: true },
    });

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("Update assignment error:", error);
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
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  await prisma.assignment.delete({ where: { id } });

  return NextResponse.json({ message: "Assignment deleted" });
}
