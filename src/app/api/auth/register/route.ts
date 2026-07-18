import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { registerSchema, SUPER_ADMIN_EMAIL } from "@/lib/validations/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, rollNumber, branch, semester, email, password } = parsed.data;

    const [existingEmail, existingRollNumber] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      prisma.user.findUnique({ where: { rollNumber } }),
    ]);

    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    if (existingRollNumber) {
      return NextResponse.json(
        { error: "An account with this roll number already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    const user = await prisma.user.create({
      data: {
        name,
        rollNumber,
        branch,
        semester,
        email,
        password: hashedPassword,
        role: isSuperAdmin ? "SUPER_ADMIN" : "STUDENT",
        // The seeded Super Admin account is pre-verified so it can sign in
        // immediately; every other new account must verify their email.
        emailVerified: isSuperAdmin ? new Date() : null,
        verificationToken: isSuperAdmin ? null : verificationToken,
        verificationExpiry: isSuperAdmin ? null : verificationExpiry,
      },
      select: { id: true, name: true, email: true },
    });

    if (!isSuperAdmin) {
      // TODO (future prompt): send a real verification email via an email
      // provider. For now, log the link the same way the forgot-password
      // flow does, until an email service is wired up.
      console.log(
        `Verification link for ${email}: /verify-email?token=${verificationToken}`
      );
    }

    return NextResponse.json(
      {
        message: isSuperAdmin
          ? "Account created successfully"
          : "Account created. Please check your college email to verify your account before signing in.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
