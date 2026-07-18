import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
  token: z.string().min(1, "Missing verification token"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Missing verification token" }, { status: 400 });
    }

    const { token } = parsed.data;

    const user = await prisma.user.findUnique({ where: { verificationToken: token } });

    if (!user) {
      return NextResponse.json(
        { error: "This verification link is invalid or has already been used." },
        { status: 400 }
      );
    }

    if (user.verificationExpiry && user.verificationExpiry.getTime() < Date.now()) {
      return NextResponse.json(
        { error: "This verification link has expired. Please register again." },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationExpiry: null,
      },
    });

    return NextResponse.json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("Verify email error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
