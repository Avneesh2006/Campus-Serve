import { z } from "zod";

export const aiConversationTypeEnum = z.enum([
  "CHAT",
  "PDF_SUMMARIZER",
  "STUDY_PLANNER",
  "QUESTION_SOLVER",
]);

export const createConversationSchema = z.object({
  type: aiConversationTypeEnum,
  title: z.string().max(150).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, "Message can't be empty").max(8000),
});

export const summarizePdfSchema = z.object({
  fileName: z.string().min(1).max(200),
  extractedText: z.string().min(1, "The PDF appears to have no extractable text").max(50000),
});

export const studyPlannerSchema = z.object({
  goal: z.string().min(3, "Describe what you'd like a plan for").max(500),
  daysAvailable: z.number().int().min(1).max(90),
  hoursPerDay: z.number().min(0.5).max(16).optional(),
});

export const questionSolverSchema = z.object({
  question: z.string().min(3, "Enter a question").max(4000),
  subject: z.string().max(100).optional().or(z.literal("")),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type SummarizePdfInput = z.infer<typeof summarizePdfSchema>;
export type StudyPlannerInput = z.infer<typeof studyPlannerSchema>;
export type QuestionSolverInput = z.infer<typeof questionSolverSchema>;
