import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [totalResources, progressRecords] = await Promise.all([
    prisma.codingResource.count(),
    prisma.codingProgress.findMany({
      where: { userId: session.user.id },
      include: { resource: { select: { category: true } } },
    }),
  ]);

  const completed = progressRecords.filter((p) => p.status === "COMPLETED").length;
  const inProgress = progressRecords.filter((p) => p.status === "IN_PROGRESS").length;
  const notStarted = totalResources - completed - inProgress;

  const byCategory = new Map<string, { total: number; completed: number }>();
  for (const p of progressRecords) {
    const cat = p.resource.category;
    const entry = byCategory.get(cat) ?? { total: 0, completed: 0 };
    entry.total += 1;
    if (p.status === "COMPLETED") entry.completed += 1;
    byCategory.set(cat, entry);
  }

  return NextResponse.json({
    totalResources,
    completed,
    inProgress,
    notStarted: Math.max(0, notStarted),
    percentComplete:
      totalResources > 0 ? Math.round((completed / totalResources) * 100) : 0,
    byCategory: Array.from(byCategory.entries()).map(([category, v]) => ({
      category,
      ...v,
    })),
  });
}
