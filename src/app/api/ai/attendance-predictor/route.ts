import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { extractReplyText } from "@/lib/ai-response";
import { calculateAttendanceStats } from "@/lib/attendance";

/**
 * Projects each subject's attendance % forward assuming a given number of
 * upcoming classes are all attended vs. all missed, to show the range of
 * likely outcomes. This is a deterministic calculation over the student's
 * real AttendanceRecord/Subject data — not something an LLM should be
 * guessing at. An AI-generated natural-language insight is layered on top
 * purely for readability, grounded in these exact numbers (see POST below).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [subjects, records, slots] = await Promise.all([
    prisma.subject.findMany({ where: { userId: session.user.id } }),
    prisma.attendanceRecord.findMany({ where: { userId: session.user.id } }),
    prisma.timetableSlot.findMany({ where: { userId: session.user.id } }),
  ]);

  const predictions = subjects.map((subject) => {
    const subjectRecords = records.filter((r) => r.subjectId === subject.id);
    const heldRecords = subjectRecords.filter((r) => r.status !== "CANCELLED");
    const attended = heldRecords.filter((r) => r.status === "PRESENT").length;
    const totalHeld = heldRecords.length;

    const current = calculateAttendanceStats(attended, totalHeld, subject.targetPercent);

    // Estimate classes per week for this subject from the timetable, to
    // project forward over the next 4 weeks.
    const weeklyClasses = slots.filter((s) => s.subjectId === subject.id).length;
    const upcomingClasses = weeklyClasses * 4;

    const bestCase = calculateAttendanceStats(
      attended + upcomingClasses,
      totalHeld + upcomingClasses,
      subject.targetPercent
    );
    const worstCase = calculateAttendanceStats(
      attended,
      totalHeld + upcomingClasses,
      subject.targetPercent
    );

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      color: subject.color,
      target: subject.targetPercent,
      current,
      upcomingClasses,
      bestCase,
      worstCase,
    };
  });

  return NextResponse.json({ predictions });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [subjects, records] = await Promise.all([
    prisma.subject.findMany({ where: { userId: session.user.id } }),
    prisma.attendanceRecord.findMany({ where: { userId: session.user.id } }),
  ]);

  if (subjects.length === 0) {
    return NextResponse.json(
      { error: "Add subjects and mark some attendance first." },
      { status: 400 }
    );
  }

  const summaryLines = subjects.map((subject) => {
    const subjectRecords = records.filter((r) => r.subjectId === subject.id);
    const heldRecords = subjectRecords.filter((r) => r.status !== "CANCELLED");
    const attended = heldRecords.filter((r) => r.status === "PRESENT").length;
    const totalHeld = heldRecords.length;
    const stats = calculateAttendanceStats(attended, totalHeld, subject.targetPercent);
    return `- ${subject.name}: ${stats.percent}% (target ${subject.targetPercent}%), safe bunks: ${stats.safeBunks}, classes needed to reach target: ${stats.classesRequired}`;
  });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI Tools aren't configured yet. Set ANTHROPIC_API_KEY in your environment to enable this feature.",
      },
      { status: 503 }
    );
  }

  try {
    const completion = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 512,
      system:
        "You are an attendance advisor inside CampusOS. You will be given a student's EXACT, already-calculated attendance numbers per subject. Do not recalculate or contradict these numbers — just explain what they mean and give brief, practical advice on which subjects need attention. Keep it to a short paragraph plus a bullet list of action items. Use markdown.",
      messages: [
        {
          role: "user",
          content: `Here is my current attendance data:\n\n${summaryLines.join("\n")}\n\nGive me a short, practical read on this.`,
        },
      ],
    });

    const insight = extractReplyText(completion);

    return NextResponse.json({ insight });
  } catch (error) {
    console.error("Attendance predictor insight error:", error);
    return NextResponse.json(
      { error: "Something went wrong generating the insight. Please try again." },
      { status: 500 }
    );
  }
}
