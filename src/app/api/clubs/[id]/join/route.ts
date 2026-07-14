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

  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  const existing = await prisma.clubMembership.findUnique({
    where: { clubId_userId: { clubId: id, userId: session.user.id } },
  });

  if (existing) {
    await prisma.clubMembership.delete({ where: { id: existing.id } });
    return NextResponse.json({ joined: false });
  }

  await prisma.clubMembership.create({
    data: { clubId: id, userId: session.user.id },
  });

  return NextResponse.json({ joined: true });
}
