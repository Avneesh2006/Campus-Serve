import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attendanceStatusEnum } from "@/lib/validations/attendance";

async function assertOwnership(userId: string, recordId: string) {
  const record = await prisma.attendanceRecord.findUnique({
    where: { id: recordId },
  });
  if (!record || record.userId !== userId) return null;
  return record;
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
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsedStatus = attendanceStatusEnum.safeParse(body.status);

    if (!parsedStatus.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const record = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        status: parsedStatus.data,
        note: typeof body.note === "string" ? body.note : undefined,
      },
      include: { subject: true },
    });

    return NextResponse.json({ record });
  } catch (error) {
    console.error("Update attendance record error:", error);
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
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  await prisma.attendanceRecord.delete({ where: { id } });

  return NextResponse.json({ message: "Record deleted" });
}
