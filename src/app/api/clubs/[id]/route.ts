import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateClubSchema } from "@/lib/validations/community";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.club.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = updateClubSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const club = await prisma.club.update({ where: { id }, data: parsed.data });

    return NextResponse.json({ club });
  } catch (error) {
    console.error("Update club error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.club.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  await prisma.club.delete({ where: { id } });

  return NextResponse.json({ message: "Club deleted" });
}
