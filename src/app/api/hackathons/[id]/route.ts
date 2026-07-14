import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateHackathonSchema } from "@/lib/validations/career-hub";

async function assertOwnership(userId: string, id: string) {
  const hackathon = await prisma.hackathon.findUnique({ where: { id } });
  if (!hackathon || hackathon.postedById !== userId) return null;
  return hackathon;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await assertOwnership(session.user.id, id);
  if (!existing) {
    return NextResponse.json(
      { error: "Hackathon not found or you don't have permission to edit it" },
      { status: 404 }
    );
  }

  try {
    const body = await req.json();
    const parsed = updateHackathonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { location, prizePool, startsAt, endsAt, regDeadline, ...rest } = parsed.data;

    const hackathon = await prisma.hackathon.update({
      where: { id },
      data: {
        ...rest,
        ...(location !== undefined ? { location: location || null } : {}),
        ...(prizePool !== undefined ? { prizePool: prizePool || null } : {}),
        ...(startsAt ? { startsAt: new Date(startsAt) } : {}),
        ...(endsAt !== undefined
          ? { endsAt: endsAt ? new Date(endsAt) : null }
          : {}),
        ...(regDeadline !== undefined
          ? { regDeadline: regDeadline ? new Date(regDeadline) : null }
          : {}),
      },
    });

    return NextResponse.json({ hackathon });
  } catch (error) {
    console.error("Update hackathon error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await assertOwnership(session.user.id, id);
  if (!existing) {
    return NextResponse.json(
      { error: "Hackathon not found or you don't have permission to delete it" },
      { status: 404 }
    );
  }

  await prisma.hackathon.delete({ where: { id } });

  return NextResponse.json({ message: "Hackathon deleted" });
}
