import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seniorGuidanceSchema } from "@/lib/validations/community";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();
  const answered = searchParams.get("answered"); // "true" | "false"
  const tag = searchParams.get("tag")?.trim();

  const posts = await prisma.seniorGuidance.findMany({
    where: {
      ...(answered ? { isAnswered: answered === "true" } : {}),
      ...(tag ? { tags: { has: tag } } : {}),
      ...(query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { body: { contains: query, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const shaped = posts.map((p) => ({
    ...p,
    author: p.isAnonymous ? { id: p.author.id, name: "Anonymous", image: null } : p.author,
    isOwnPost: p.authorId === session.user.id,
  }));

  return NextResponse.json({ posts: shaped });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = seniorGuidanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, body: postBody, tags, isAnonymous } = parsed.data;

    const post = await prisma.seniorGuidance.create({
      data: {
        authorId: session.user.id,
        title,
        body: postBody,
        tags,
        isAnonymous,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create senior guidance post error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
