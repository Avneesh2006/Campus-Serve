import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bulkAttendanceSchema } from "@/lib/validations/attendance";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = bulkAttendanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { date, records } = parsed.data;

    const subjectIds = records.map((r) => r.subjectId);
    const owned = await prisma.subject.findMany({
      where: { id: { in: subjectIds }, userId: session.user.id },
      select: { id: true },
    });
    const ownedIds = new Set(owned.map((s) => s.id));

    const validRecords = records.filter((r) => ownedIds.has(r.subjectId));

    const results = await prisma.$transaction(
      validRecords.map((r) =>
        prisma.attendanceRecord.upsert({
          where: {
            subjectId_date: {
              subjectId: r.subjectId,
              date: new Date(date),
            },
          },
          create: {
            userId: session.user!.id,
            subjectId: r.subjectId,
            date: new Date(date),
            status: r.status,
          },
          update: {
            status: r.status,
          },
        })
      )
    );

    return NextResponse.json({ records: results }, { status: 201 });
  } catch (error) {
    console.error("Bulk attendance error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
