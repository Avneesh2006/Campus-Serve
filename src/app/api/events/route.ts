import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/lib/validations/community";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q")?.trim();
  const clubId = searchParams.get("clubId");
  const upcoming = searchParams.get("upcoming");
  const rsvped = searchParams.get("rsvped");

  const events = await prisma.event.findMany({
    where: {
      ...(category ? { category: category as never } : {}),
      ...(clubId ? { clubId } : {}),
      ...(upcoming === "true" ? { startsAt: { gte: new Date() } } : {}),
      ...(rsvped === "true"
        ? { rsvps: { some: { userId: session.user.id } } }
        : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      club: { select: { id: true, name: true, logoColor: true } },
      rsvps: { where: { userId: session.user.id }, select: { status: true } },
      _count: { select: { rsvps: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  const shaped = events.map((e) => ({
    id: e.id,
    clubId: e.clubId,
    club: e.club,
    title: e.title,
    description: e.description,
    category: e.category,
    location: e.location,
    startsAt: e.startsAt,
    endsAt: e.endsAt,
    rsvpCount: e._count.rsvps,
    myRsvpStatus: e.rsvps[0]?.status ?? null,
  }));

  return NextResponse.json({ events: shaped });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = eventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { clubId, title, description, category, location, startsAt, endsAt } =
      parsed.data;

    if (clubId) {
      const club = await prisma.club.findUnique({ where: { id: clubId } });
      if (!club) {
        return NextResponse.json({ error: "Club not found" }, { status: 404 });
      }
    }

    const event = await prisma.event.create({
      data: {
        clubId: clubId || null,
        organizerId: session.user.id,
        title,
        description,
        category,
        location: location || null,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
      },
      include: {
        club: { select: { id: true, name: true, logoColor: true } },
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Create event error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
