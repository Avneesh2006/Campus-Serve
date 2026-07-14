import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clubSchema } from "@/lib/validations/community";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q")?.trim();
  const joined = searchParams.get("joined");

  const clubs = await prisma.club.findMany({
    where: {
      ...(category ? { category: category as never } : {}),
      ...(joined === "true"
        ? { memberships: { some: { userId: session.user.id } } }
        : {}),
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      memberships: { where: { userId: session.user.id }, select: { id: true } },
      _count: { select: { memberships: true, events: true } },
    },
    orderBy: { name: "asc" },
  });

  const shaped = clubs.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    category: c.category,
    logoColor: c.logoColor,
    createdAt: c.createdAt,
    memberCount: c._count.memberships,
    eventCount: c._count.events,
    isJoined: c.memberships.length > 0,
  }));

  return NextResponse.json({ clubs: shaped });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = clubSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const club = await prisma.club.create({ data: parsed.data });

    return NextResponse.json({ club }, { status: 201 });
  } catch (error) {
    console.error("Create club error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
