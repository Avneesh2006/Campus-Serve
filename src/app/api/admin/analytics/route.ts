import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function lastNDays(n: number) {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(dayKey(d));
  }
  return days;
}

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 13);
  since.setHours(0, 0, 0, 0);

  const [newUsers, newAssignments, newResources, newForumPosts, roleBreakdown] =
    await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.assignment.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.resource.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.forumPost.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true },
      }),
      prisma.user.groupBy({ by: ["role"], _count: { role: true } }),
    ]);

  const days = lastNDays(14);
  const bucket = (rows: { createdAt: Date }[]) => {
    const counts = new Map<string, number>();
    for (const day of days) counts.set(day, 0);
    for (const row of rows) {
      const key = dayKey(new Date(row.createdAt));
      if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return days.map((day) => ({ day, count: counts.get(day) ?? 0 }));
  };

  return NextResponse.json({
    newUsersByDay: bucket(newUsers),
    newAssignmentsByDay: bucket(newAssignments),
    newResourcesByDay: bucket(newResources),
    newForumPostsByDay: bucket(newForumPosts),
    usersByRole: roleBreakdown.map((r) => ({ role: r.role, count: r._count.role })),
  });
}
