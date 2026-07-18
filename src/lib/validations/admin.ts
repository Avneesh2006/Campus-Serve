import { z } from "zod";

export const announcementPriorityEnum = z.enum(["LOW", "NORMAL", "HIGH"]);

export const announcementSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(150),
  body: z.string().min(5, "Body must be at least 5 characters").max(3000),
  priority: announcementPriorityEnum,
  isPinned: z.boolean(),
});

export const updateAnnouncementSchema = announcementSchema.partial();

export const roleEnum = z.enum(["STUDENT", "SUB_ADMIN", "ADMIN", "SUPER_ADMIN"]);

export const updateUserRoleSchema = z.object({
  role: roleEnum,
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
