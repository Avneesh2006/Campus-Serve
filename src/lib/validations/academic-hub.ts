import { z } from "zod";

export const resourceTypeEnum = z.enum(["NOTE", "PYQ", "BOOK", "RESOURCE"]);
export const fileKindEnum = z.enum(["PDF", "DOC", "IMAGE", "LINK", "OTHER"]);

export const resourceSchema = z.object({
  type: resourceTypeEnum,
  title: z.string().min(2, "Title must be at least 2 characters").max(150),
  description: z.string().max(1000).optional().or(z.literal("")),
  subjectName: z.string().min(1, "Subject is required").max(100),
  semester: z
    .number()
    .int()
    .min(1)
    .max(12)
    .optional()
    .nullable(),
  author: z.string().max(150).optional().or(z.literal("")),
  year: z
    .number()
    .int()
    .min(1990)
    .max(new Date().getFullYear() + 1)
    .optional()
    .nullable(),
  fileUrl: z.string().min(1, "A file link is required").max(2000),
  fileKind: fileKindEnum,
  fileSizeKb: z.number().int().min(0).optional().nullable(),
});

export const updateResourceSchema = resourceSchema.partial();

export const ratingSchema = z.object({
  value: z.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  comment: z.string().max(500).optional().or(z.literal("")),
});

export type ResourceInput = z.infer<typeof resourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type RatingInput = z.infer<typeof ratingSchema>;
