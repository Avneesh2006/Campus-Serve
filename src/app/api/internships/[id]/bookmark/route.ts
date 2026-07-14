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

  const internship = await prisma.internship.findUnique({ where: { id } });
  if (!internship) {
    return NextResponse.json({ error: "Internship not found" }, { status: 404 });
  }

  const existing = await prisma.internshipBookmark.findUnique({
    where: { userId_internshipId: { userId: session.user.id, internshipId: id } },
  });

  if (existing) {
    await prisma.internshipBookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ bookmarked: false });
  }

  await prisma.internshipBookmark.create({
    data: { userId: session.user.id, internshipId: id },
  });

  return NextResponse.json({ bookmarked: true });
}
