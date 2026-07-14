import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const resource = await prisma.codingResource.findUnique({ where: { id } });
  if (!resource) {
    return NextResponse.json({ error: "Resource not found" }, { status: 404 });
  }

  const existing = await prisma.codingResourceBookmark.findUnique({
    where: { userId_resourceId: { userId: session.user.id, resourceId: id } },
  });

  if (existing) {
    await prisma.codingResourceBookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.codingResourceBookmark.create({
    data: { userId: session.user.id, resourceId: id },
  });

  return NextResponse.json({ bookmarked: true });
}
