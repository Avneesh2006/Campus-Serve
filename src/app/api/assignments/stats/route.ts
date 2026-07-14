import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectiveStatus } from "@/lib/assignments";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const assignments = await prisma.assignment.findMany({
    where: { userId: session.user.id },
  });

  const withEffective = assignments.map((a) => ({
    ...a,
    effectiveStatus: effectiveStatus(a.dueDate, a.status),
  }));

  const counts = {
    total: withEffective.length,
    pending: withEffective.filter((a) => a.effectiveStatus === "PENDING").length,
    inProgress: withEffective.filter((a) => a.effectiveStatus === "IN_PROGRESS")
      .length,
    submitted: withEffective.filter((a) => a.effectiveStatus === "SUBMITTED")
      .length,
    completed: withEffective.filter((a) => a.effectiveStatus === "COMPLETED")
      .length,
    overdue: withEffective.filter((a) => a.effectiveStatus === "OVERDUE").length,
  };

  const dueSoon = withEffective
    .filter(
      (a) =>
        (a.effectiveStatus === "PENDING" || a.effectiveStatus === "IN_PROGRESS") &&
        new Date(a.dueDate).getTime() - Date.now() <= 1000 * 60 * 60 * 24 * 3
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const byPriority = {
    high: withEffective.filter(
      (a) =>
        a.priority === "HIGH" &&
        a.effectiveStatus !== "COMPLETED" &&
        a.effectiveStatus !== "SUBMITTED"
    ).length,
    medium: withEffective.filter(
      (a) =>
        a.priority === "MEDIUM" &&
        a.effectiveStatus !== "COMPLETED" &&
        a.effectiveStatus !== "SUBMITTED"
    ).length,
    low: withEffective.filter(
      (a) =>
        a.priority === "LOW" &&
        a.effectiveStatus !== "COMPLETED" &&
        a.effectiveStatus !== "SUBMITTED"
    ).length,
  };

  return NextResponse.json({ counts, dueSoon, byPriority });
}
