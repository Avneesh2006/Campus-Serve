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

  const hackathon = await prisma.hackathon.findUnique({ where: { id } });
  if (!hackathon) {
    return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
  }

  const existing = await prisma.hackathonBookmark.findUnique({
    where: { userId_hackathonId: { userId: session.user.id, hackathonId: id } },
  });

  if (existing) {
    await prisma.hackathonBookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.hackathonBookmark.create({
    data: { userId: session.user.id, hackathonId: id },
  });

  return NextResponse.json({ bookmarked: true });
}
