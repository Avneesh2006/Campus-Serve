import { z } from "zod";

export const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);
export const statusEnum = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETED",
  "OVERDUE",
]);
export const fileKindEnum = z.enum(["PDF", "DOC", "IMAGE", "LINK", "OTHER"]);

export const attachmentSchema = z.object({
  name: z.string().min(1).max(150),
  fileUrl: z.string().min(1).max(2000),
  fileKind: fileKindEnum,
  fileSizeKb: z.number().int().min(0).optional().nullable(),
});

export const assignmentSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(150),
  description: z.string().max(2000).optional().or(z.literal("")),
  subjectName: z.string().min(1, "Subject is required").max(100),
  dueDate: z.string().min(1, "Due date is required"), // ISO date string
  priority: priorityEnum,
  status: statusEnum,
  reminderAt: z.string().optional().or(z.literal("")),
  attachments: z.array(attachmentSchema),
});

export const updateAssignmentSchema = assignmentSchema.partial();

export const updateStatusSchema = z.object({
  status: statusEnum,
});

export type AttachmentInput = z.infer<typeof attachmentSchema>;
export type AssignmentInput = z.infer<typeof assignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;
