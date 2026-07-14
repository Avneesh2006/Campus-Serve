import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; attachmentId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, attachmentId } = await params;

  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment || assignment.userId !== session.user.id) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  const attachment = await prisma.assignmentAttachment.findUnique({
    where: { id: attachmentId },
  });
  if (!attachment || attachment.assignmentId !== id) {
    return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
  }

  await prisma.assignmentAttachment.delete({ where: { id: attachmentId } });

  return NextResponse.json({ message: "Attachment removed" });
}
