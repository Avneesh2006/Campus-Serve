import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attendanceRecordSchema } from "@/lib/validations/attendance";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const subjectId = searchParams.get("subjectId");
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const records = await prisma.attendanceRecord.findMany({
    where: {
      userId: session.user.id,
      ...(subjectId ? { subjectId } : {}),
      ...(from || to
        ? {
            date: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: { subject: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json({ records });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = attendanceRecordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { subjectId, date, status, note } = parsed.data;

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject || subject.userId !== session.user.id) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const record = await prisma.attendanceRecord.upsert({
      where: {
        subjectId_date: {
          subjectId,
          date: new Date(date),
        },
      },
      create: {
        userId: session.user.id,
        subjectId,
        date: new Date(date),
        status,
        note: note || null,
      },
      update: {
        status,
        note: note || null,
      },
      include: { subject: true },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Create attendance record error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
