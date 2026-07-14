import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attachmentSchema } from "@/lib/validations/assignments";
import { z } from "zod";

const submitSchema = z.object({
  attachment: attachmentSchema.optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.assignment.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = submitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { attachment } = parsed.data;

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        ...(attachment
          ? {
              attachments: {
                create: {
                  name: attachment.name,
                  fileUrl: attachment.fileUrl,
                  fileKind: attachment.fileKind,
                  fileSizeKb: attachment.fileSizeKb ?? null,
                },
              },
            }
          : {}),
      },
      include: { attachments: true },
    });

    return NextResponse.json({ assignment });
  } catch (error) {
    console.error("Submit assignment error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
