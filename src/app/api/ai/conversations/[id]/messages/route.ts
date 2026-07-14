import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { extractReplyText } from "@/lib/ai-response";
import { sendMessageSchema } from "@/lib/validations/ai-tools";
import { SYSTEM_PROMPTS } from "@/lib/ai-system-prompts";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const conversation = await prisma.aiConversation.findUnique({ where: { id } });
  if (!conversation || conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const messages = await prisma.aiMessage.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ messages });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const conversation = await prisma.aiConversation.findUnique({ where: { id } });
  if (!conversation || conversation.userId !== session.user.id) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const parsed = sendMessageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { content } = parsed.data;

    // Persist the user's message first so history is never lost even if the
    // model call below fails.
    const userMessage = await prisma.aiMessage.create({
      data: { conversationId: id, role: "USER", content },
    });

    const priorMessages = await prisma.aiMessage.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            "AI Tools aren't configured yet. Set ANTHROPIC_API_KEY in your environment to enable this feature.",
          userMessage,
        },
        { status: 503 }
      );
    }

    const completion = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPTS[conversation.type],
      messages: priorMessages.map((m) => ({
        role: m.role === "USER" ? ("user" as const) : ("assistant" as const),
        content: m.content,
      })),
    });

    const replyText = extractReplyText(completion);

    const assistantMessage = await prisma.aiMessage.create({
      data: { conversationId: id, role: "ASSISTANT", content: replyText },
    });

    // Auto-title fresh conversations from the first user message.
    if (conversation.title === "New conversation" && priorMessages.length === 1) {
      await prisma.aiConversation.update({
        where: { id },
        data: { title: content.slice(0, 60) },
      });
    } else {
      await prisma.aiConversation.update({
        where: { id },
        data: { updatedAt: new Date() },
      });
    }

    return NextResponse.json({ userMessage, assistantMessage }, { status: 201 });
  } catch (error) {
    console.error("AI message error:", error);
    return NextResponse.json(
      { error: "Something went wrong while contacting the AI. Please try again." },
      { status: 500 }
    );
  }
}
