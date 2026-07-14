import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { internshipSchema } from "@/lib/validations/career-hub";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const mode = searchParams.get("mode");
  const query = searchParams.get("q")?.trim();
  const bookmarked = searchParams.get("bookmarked");

  const internships = await prisma.internship.findMany({
    where: {
      ...(category ? { category: category as never } : {}),
      ...(mode ? { mode: mode as never } : {}),
      ...(bookmarked === "true"
        ? { bookmarks: { some: { userId: session.user.id } } }
        : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { company: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      bookmarks: { where: { userId: session.user.id }, select: { id: true } },
      _count: { select: { bookmarks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const shaped = internships.map((i) => ({
    ...i,
    isBookmarked: i.bookmarks.length > 0,
    bookmarkCount: i._count.bookmarks,
    isOwn: i.postedById === session.user.id,
  }));

  return NextResponse.json({ internships: shaped });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = internshipSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      title,
      company,
      category,
      mode,
      location,
      stipend,
      durationWeeks,
      applyUrl,
      description,
      deadline,
    } = parsed.data;

    const internship = await prisma.internship.create({
      data: {
        postedById: session.user.id,
        title,
        company,
        category,
        mode,
        location: location || null,
        stipend: stipend || null,
        durationWeeks: durationWeeks ?? null,
        applyUrl,
        description,
        deadline: deadline ? new Date(deadline) : null,
      },
    });

    return NextResponse.json({ internship }, { status: 201 });
  } catch (error) {
    console.error("Create internship error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
