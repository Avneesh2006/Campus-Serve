import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { resourceSchema } from "@/lib/validations/academic-hub";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // NOTE | PYQ | BOOK | RESOURCE
  const query = searchParams.get("q")?.trim();
  const subjectName = searchParams.get("subject")?.trim();
  const semester = searchParams.get("semester");
  const mine = searchParams.get("mine");
  const bookmarked = searchParams.get("bookmarked");
  const sort = searchParams.get("sort") || "recent"; // recent | rating | downloads

  const resources = await prisma.resource.findMany({
    where: {
      ...(type ? { type: type as never } : {}),
      ...(mine === "true" ? { uploaderId: session.user.id } : {}),
      ...(subjectName
        ? { subjectName: { contains: subjectName, mode: "insensitive" } }
        : {}),
      ...(semester ? { semester: Number(semester) } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { subjectName: { contains: query, mode: "insensitive" } },
              { author: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(bookmarked === "true"
        ? { bookmarks: { some: { userId: session.user.id } } }
        : {}),
    },
    include: {
      uploader: { select: { id: true, name: true, image: true } },
      ratings: { select: { value: true } },
      bookmarks: { where: { userId: session.user.id }, select: { id: true } },
      _count: { select: { ratings: true, bookmarks: true } },
    },
    orderBy:
      sort === "downloads"
        ? { downloadCount: "desc" }
        : sort === "recent"
        ? { createdAt: "desc" }
        : { createdAt: "desc" },
  });

  const shaped = resources.map((r) => {
    const avgRating =
      r.ratings.length > 0
        ? r.ratings.reduce((sum, x) => sum + x.value, 0) / r.ratings.length
        : 0;

    return {
      id: r.id,
      type: r.type,
      title: r.title,
      description: r.description,
      subjectName: r.subjectName,
      semester: r.semester,
      author: r.author,
      year: r.year,
      fileUrl: r.fileUrl,
      fileKind: r.fileKind,
      fileSizeKb: r.fileSizeKb,
      downloadCount: r.downloadCount,
      createdAt: r.createdAt,
      uploader: r.uploader,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingCount: r._count.ratings,
      bookmarkCount: r._count.bookmarks,
      isBookmarked: r.bookmarks.length > 0,
    };
  });

  const sorted =
    sort === "rating"
      ? shaped.sort((a, b) => b.avgRating - a.avgRating)
      : shaped;

  return NextResponse.json({ resources: sorted });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = resourceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const resource = await prisma.resource.create({
      data: {
        uploaderId: session.user.id,
        type: data.type,
        title: data.title,
        description: data.description || null,
        subjectName: data.subjectName,
        semester: data.semester ?? null,
        author: data.author || null,
        year: data.year ?? null,
        fileUrl: data.fileUrl,
        fileKind: data.fileKind,
        fileSizeKb: data.fileSizeKb ?? null,
      },
      include: {
        uploader: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ resource }, { status: 201 });
  } catch (error) {
    console.error("Create resource error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
