import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAttendanceStats } from "@/lib/attendance";

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [subjects, records] = await Promise.all([
    prisma.subject.findMany({ where: { userId: session.user.id } }),
    prisma.attendanceRecord.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
    }),
  ]);

  // Per-subject stats
  const perSubject = subjects.map((subject) => {
    const subjectRecords = records.filter((r) => r.subjectId === subject.id);
    const heldRecords = subjectRecords.filter((r) => r.status !== "CANCELLED");
    const attended = heldRecords.filter((r) => r.status === "PRESENT").length;
    const totalHeld = heldRecords.length;

    const stats = calculateAttendanceStats(
      attended,
      totalHeld,
      subject.targetPercent
    );

    return {
      subjectId: subject.id,
      subjectName: subject.name,
      color: subject.color,
      ...stats,
    };
  });

  const overallAttended = perSubject.reduce((sum, s) => sum + s.attended, 0);
  const overallHeld = perSubject.reduce((sum, s) => sum + s.totalHeld, 0);
  const overallPercent =
    overallHeld > 0 ? Math.round((overallAttended / overallHeld) * 1000) / 10 : 0;

  // Weekly aggregate (last 8 weeks)
  const weeklyMap = new Map<string, { attended: number; total: number }>();
  for (const record of records) {
    if (record.status === "CANCELLED") continue;
    const weekStart = startOfWeek(new Date(record.date));
    const key = weekStart.toISOString().slice(0, 10);
    const entry = weeklyMap.get(key) ?? { attended: 0, total: 0 };
    entry.total += 1;
    if (record.status === "PRESENT") entry.attended += 1;
    weeklyMap.set(key, entry);
  }
  const weekly = Array.from(weeklyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([weekStart, v]) => ({
      week: weekStart,
      percent: v.total > 0 ? Math.round((v.attended / v.total) * 1000) / 10 : 0,
      attended: v.attended,
      total: v.total,
    }));

  // Monthly aggregate (last 6 months)
  const monthlyMap = new Map<string, { attended: number; total: number }>();
  for (const record of records) {
    if (record.status === "CANCELLED") continue;
    const key = monthKey(new Date(record.date));
    const entry = monthlyMap.get(key) ?? { attended: 0, total: 0 };
    entry.total += 1;
    if (record.status === "PRESENT") entry.attended += 1;
    monthlyMap.set(key, entry);
  }
  const monthly = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, v]) => ({
      month,
      percent: v.total > 0 ? Math.round((v.attended / v.total) * 1000) / 10 : 0,
      attended: v.attended,
      total: v.total,
    }));

  return NextResponse.json({
    overall: {
      attended: overallAttended,
      totalHeld: overallHeld,
      percent: overallPercent,
    },
    perSubject,
    weekly,
    monthly,
  });
}
