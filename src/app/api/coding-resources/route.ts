import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { codingResourceSchema } from "@/lib/validations/career-hub";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const difficulty = searchParams.get("difficulty");
  const query = searchParams.get("q")?.trim();
  const bookmarked = searchParams.get("bookmarked");
  const status = searchParams.get("status"); // filter by progress status

  const resources = await prisma.codingResource.findMany({
    where: {
      ...(category ? { category: category as never } : {}),
      ...(difficulty ? { difficulty: difficulty as never } : {}),
      ...(bookmarked === "true"
        ? { bookmarks: { some: { userId: session.user.id } } }
        : {}),
      ...(status
        ? { progress: { some: { userId: session.user.id, status: status as never } } }
        : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { provider: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      bookmarks: { where: { userId: session.user.id }, select: { id: true } },
      progress: { where: { userId: session.user.id }, select: { status: true } },
      _count: { select: { bookmarks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const shaped = resources.map((r) => ({
    ...r,
    isBookmarked: r.bookmarks.length > 0,
    bookmarkCount: r._count.bookmarks,
    myStatus: r.progress[0]?.status ?? "NOT_STARTED",
    isOwn: r.addedById === session.user.id,
  }));

  return NextResponse.json({ resources: shaped });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = codingResourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, provider, category, difficulty, url, description } = parsed.data;

    const resource = await prisma.codingResource.create({
      data: {
        addedById: session.user.id,
        title,
        provider: provider || null,
        category,
        difficulty,
        url,
        description,
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error("Create coding resource error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
