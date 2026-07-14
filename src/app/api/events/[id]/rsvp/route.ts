import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rsvpStatusEnum } from "@/lib/validations/community";
import { z } from "zod";

const rsvpSchema = z.object({ status: rsvpStatusEnum });

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = rsvpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    if (parsed.data.status === "NOT_GOING") {
      await prisma.eventRsvp.deleteMany({
        where: { eventId: id, userId: session.user.id },
      });
      return NextResponse.json({ status: "NOT_GOING" });
    }

    const rsvp = await prisma.eventRsvp.upsert({
      where: { eventId_userId: { eventId: id, userId: session.user.id } },
      create: { eventId: id, userId: session.user.id, status: parsed.data.status },
      update: { status: parsed.data.status },
    });

    return NextResponse.json({ status: rsvp.status });
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
