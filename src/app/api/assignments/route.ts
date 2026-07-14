import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assignmentSchema } from "@/lib/validations/assignments";
import { effectiveStatus } from "@/lib/assignments";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const subjectName = searchParams.get("subject")?.trim();
  const query = searchParams.get("q")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const sort = searchParams.get("sort") || "dueDate"; // dueDate | priority | createdAt

  const assignments = await prisma.assignment.findMany({
    where: {
      userId: session.user.id,
      ...(priority ? { priority: priority as never } : {}),
      ...(subjectName
        ? { subjectName: { contains: subjectName, mode: "insensitive" } }
        : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { subjectName: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(from || to
        ? {
            dueDate: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
    },
    include: { attachments: true },
    orderBy:
      sort === "priority"
        ? { priority: "desc" }
        : sort === "createdAt"
        ? { createdAt: "desc" }
        : { dueDate: "asc" },
  });

  let shaped = assignments.map((a) => ({
    ...a,
    effectiveStatus: effectiveStatus(a.dueDate, a.status),
  }));

  // Status filter applies to the *effective* status (so "overdue" catches
  // assignments whose due date has passed even if stored status is PENDING).
  if (status) {
    shaped = shaped.filter((a) => a.effectiveStatus === status);
  }

  return NextResponse.json({ assignments: shaped });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = assignmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, subjectName, dueDate, priority, status, reminderAt, attachments } =
      parsed.data;

    const assignment = await prisma.assignment.create({
      data: {
        userId: session.user.id,
        title,
        description: description || null,
        subjectName,
        dueDate: new Date(dueDate),
        priority,
        status,
        reminderAt: reminderAt ? new Date(reminderAt) : null,
        attachments: {
          create: attachments.map((a) => ({
            name: a.name,
            fileUrl: a.fileUrl,
            fileKind: a.fileKind,
            fileSizeKb: a.fileSizeKb ?? null,
          })),
        },
      },
      include: { attachments: true },
    });

    return NextResponse.json({ assignment }, { status: 201 });
  } catch (error) {
    console.error("Create assignment error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
