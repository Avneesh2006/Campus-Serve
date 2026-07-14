import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { effectiveStatus } from "@/lib/assignments";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 5);

  const assignments = await prisma.assignment.findMany({
    where: {
      userId: session.user.id,
      status: { notIn: ["COMPLETED", "SUBMITTED"] },
    },
    orderBy: { dueDate: "asc" },
    take: limit,
    include: { attachments: true },
  });

  const shaped = assignments.map((a) => ({
    ...a,
    effectiveStatus: effectiveStatus(a.dueDate, a.status),
  }));

  return NextResponse.json({ assignments: shaped });
}
