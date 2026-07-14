import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ratingSchema } from "@/lib/validations/academic-hub";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = ratingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { value, comment } = parsed.data;

    const rating = await prisma.rating.upsert({
      where: {
        userId_resourceId: { userId: session.user.id, resourceId: id },
      },
      create: {
        userId: session.user.id,
        resourceId: id,
        value,
        comment: comment || null,
      },
      update: {
        value,
        comment: comment || null,
      },
    });

    const allRatings = await prisma.rating.findMany({
      where: { resourceId: id },
      select: { value: true },
    });
    const avgRating =
      allRatings.reduce((sum, r) => sum + r.value, 0) / allRatings.length;

    return NextResponse.json({
      rating,
      avgRating: Math.round(avgRating * 10) / 10,
      ratingCount: allRatings.length,
    });
  } catch (error) {
    console.error("Rate resource error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
