import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { anthropic, AI_MODEL } from "@/lib/anthropic";
import { extractReplyText } from "@/lib/ai-response";
import { studyPlannerSchema } from "@/lib/validations/ai-tools";
import { SYSTEM_PROMPTS } from "@/lib/ai-system-prompts";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = studyPlannerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", issues: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { goal, daysAvailable, hoursPerDay } = parsed.data;

    // Ground the plan in the student's real subjects and upcoming
    // assignments rather than letting the model invent a generic schedule.
    const [subjects, upcomingAssignments] = await Promise.all([
      prisma.subject.findMany({ where: { userId: session.user.id } }),
      prisma.assignment.findMany({
        where: {
          userId: session.user.id,
          status: { notIn: ["COMPLETED", "SUBMITTED"] },
        },
        orderBy: { dueDate: "asc" },
        take: 10,
      }),
    ]);

    const contextLines = [
      `Goal: ${goal}`,
      `Days available: ${daysAvailable}`,
      hoursPerDay ? `Hours available per day: ${hoursPerDay}` : null,
      subjects.length > 0
        ? `Current subjects: ${subjects.map((s) => s.name).join(", ")}`
        : null,
      upcomingAssignments.length > 0
        ? `Upcoming assignments:\n${upcomingAssignments
            .map(
              (a) =>
                `- ${a.title} (${a.subjectName}), due ${new Date(a.dueDate).toLocaleDateString()}, priority ${a.priority}`
            )
            .join("\n")}`
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const conversation = await prisma.aiConversation.create({
      data: {
        userId: session.user.id,
        type: "STUDY_PLANNER",
        title: goal.slice(0, 60),
      },
    });

    const userMessage = await prisma.aiMessage.create({
      data: { conversationId: conversation.id, role: "USER", content: contextLines },
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
      system: SYSTEM_PROMPTS.STUDY_PLANNER,
      messages: [{ role: "user", content: contextLines }],
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
    console.error("Study planner error:", error);
    return NextResponse.json(
      { error: "Something went wrong while generating your plan. Please try again." },
      { status: 500 }
    );
  }
}
