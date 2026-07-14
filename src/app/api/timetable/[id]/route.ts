import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateTimetableSlotSchema } from "@/lib/validations/attendance";

async function assertOwnership(userId: string, slotId: string) {
  const slot = await prisma.timetableSlot.findUnique({ where: { id: slotId } });
  if (!slot || slot.userId !== userId) return null;
  return slot;
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
    return NextResponse.json({ error: "Timetable slot not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = updateTimetableSlotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = { ...parsed.data };
    if (data.room === "") data.room = undefined;

    if (
      data.startTime &&
      data.endTime &&
      data.startTime >= data.endTime
    ) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    const slot = await prisma.timetableSlot.update({
      where: { id },
      data,
      include: { subject: true },
    });

    return NextResponse.json({ slot });
  } catch (error) {
    console.error("Update timetable slot error:", error);
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
    return NextResponse.json({ error: "Timetable slot not found" }, { status: 404 });
  }

  await prisma.timetableSlot.delete({ where: { id } });

  return NextResponse.json({ message: "Timetable slot deleted" });
}
