import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hackathonSchema } from "@/lib/validations/career-hub";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("mode");
  const query = searchParams.get("q")?.trim();
  const bookmarked = searchParams.get("bookmarked");
  const upcoming = searchParams.get("upcoming");

  const hackathons = await prisma.hackathon.findMany({
    where: {
      ...(mode ? { mode: mode as never } : {}),
      ...(upcoming === "true" ? { startsAt: { gte: new Date() } } : {}),
      ...(bookmarked === "true"
        ? { bookmarks: { some: { userId: session.user.id } } }
        : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { organizer: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      bookmarks: { where: { userId: session.user.id }, select: { id: true } },
      _count: { select: { bookmarks: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  const shaped = hackathons.map((h) => ({
    ...h,
    isBookmarked: h.bookmarks.length > 0,
    bookmarkCount: h._count.bookmarks,
    isOwn: h.postedById === session.user.id,
  }));

  return NextResponse.json({ hackathons: shaped });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = hackathonSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      organizer,
      mode,
      location,
      prizePool,
      registerUrl,
      description,
      startsAt,
      endsAt,
      regDeadline,
    } = parsed.data;

    const hackathon = await prisma.hackathon.create({
      data: {
        postedById: session.user.id,
        title,
        organizer,
        mode,
        location: location || null,
        prizePool: prizePool || null,
        registerUrl,
        description,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        regDeadline: regDeadline ? new Date(regDeadline) : null,
      },
    });

    return NextResponse.json({ hackathon }, { status: 201 });
  } catch (error) {
    console.error("Create hackathon error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
