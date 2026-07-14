import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timetableSlotSchema } from "@/lib/validations/attendance";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const slots = await prisma.timetableSlot.findMany({
    where: { userId: session.user.id },
    include: { subject: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });

  return NextResponse.json({ slots });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = timetableSlotSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { subjectId, dayOfWeek, startTime, endTime, room, type } =
      parsed.data;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject || subject.userId !== session.user.id) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    if (startTime >= endTime) {
      return NextResponse.json(
        { error: "End time must be after start time" },
        { status: 400 }
      );
    }

    const slot = await prisma.timetableSlot.create({
      data: {
        userId: session.user.id,
        subjectId,
        dayOfWeek,
        startTime,
        endTime,
        room: room || null,
        type,
      },
      include: { subject: true },
    });

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    console.error("Create timetable slot error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
