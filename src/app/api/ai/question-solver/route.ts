import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { extractReplyText } from "@/lib/ai-response";
import { questionSolverSchema } from "@/lib/validations/ai-tools";
import { SYSTEM_PROMPTS } from "@/lib/ai-system-prompts";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = questionSolverSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { question, subject } = parsed.data;

    const userPrompt = subject
      ? `Subject: ${subject}\n\nQuestion: ${question}`
      : question;

    const conversation = await prisma.aiConversation.create({
      data: {
        userId: session.user.id,
        type: "QUESTION_SOLVER",
        title: question.slice(0, 60),
      },
    });

    const userMessage = await prisma.aiMessage.create({
      data: { conversationId: conversation.id, role: "USER", content: userPrompt },
    });

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            "AI Tools aren't configured yet. Set ANTHROPIC_API_KEY in your environment to enable this feature.",
          conversation,
          userMessage,
        },
        { status: 503 }
      );
    }

    const completion = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPTS.QUESTION_SOLVER,
      messages: [{ role: "user", content: userPrompt }],
    });

    const replyText = extractReplyText(completion);

    const assistantMessage = await prisma.aiMessage.create({
      data: { conversationId: conversation.id, role: "ASSISTANT", content: replyText },
    });

    return NextResponse.json(
      { conversation, userMessage, assistantMessage },
      { status: 201 }
    );
  } catch (error) {
    console.error("Question solver error:", error);
    return NextResponse.json(
      { error: "Something went wrong while solving. Please try again." },
      { status: 500 }
    );
  }
}
