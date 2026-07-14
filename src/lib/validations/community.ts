import { z } from "zod";

export const forumCategoryEnum = z.enum([
  "GENERAL",
  "ACADEMICS",
  "CAREER",
  "EVENTS",
  "CONFESSIONS",
  "TECH",
  "OFF_TOPIC",
]);

export const clubCategoryEnum = z.enum([
  "TECHNICAL",
  "CULTURAL",
  "SPORTS",
  "SOCIAL_SERVICE",
  "ARTS",
  "ENTREPRENEURSHIP",
  "OTHER",
]);

export const eventCategoryEnum = z.enum([
  "WORKSHOP",
  "SEMINAR",
  "FEST",
  "COMPETITION",
  "MEETUP",
  "OTHER",
]);

export const rsvpStatusEnum = z.enum(["GOING", "INTERESTED", "NOT_GOING"]);

export const forumPostSchema = z.object({
  category: forumCategoryEnum,
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  body: z.string().min(5, "Post body must be at least 5 characters").max(5000),
  isAnonymous: z.boolean(),
});

export const updateForumPostSchema = forumPostSchema.partial();

export const commentSchema = z.object({
  body: z.string().min(1, "Comment can't be empty").max(2000),
  isAnonymous: z.boolean(),
  parentId: z.string().optional().nullable(),
});

export const seniorGuidanceSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  body: z.string().min(5, "Question must be at least 5 characters").max(5000),
  tags: z.array(z.string().max(30)).max(10),
  isAnonymous: z.boolean(),
});

export const updateSeniorGuidanceSchema = seniorGuidanceSchema.partial();

export const clubSchema = z.object({
  name: z.string().min(2, "Club name must be at least 2 characters").max(100),
  description: z.string().min(5, "Description must be at least 5 characters").max(1000),
  category: clubCategoryEnum,
  logoColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
});

export const updateClubSchema = clubSchema.partial();

export const eventSchema = z.object({
  clubId: z.string().optional().nullable(),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(5, "Description must be at least 5 characters").max(2000),
  category: eventCategoryEnum,
  location: z.string().max(200).optional().or(z.literal("")),
  startsAt: z.string().min(1, "Start date/time is required"),
  endsAt: z.string().optional().or(z.literal("")),
});

export const updateEventSchema = eventSchema.partial();

export type ForumPostInput = z.infer<typeof forumPostSchema>;
export type UpdateForumPostInput = z.infer<typeof updateForumPostSchema>;
export type CommentInput = z.infer<typeof commentSchema>;
export type SeniorGuidanceInput = z.infer<typeof seniorGuidanceSchema>;
export type UpdateSeniorGuidanceInput = z.infer<typeof updateSeniorGuidanceSchema>;
export type ClubInput = z.infer<typeof clubSchema>;
export type UpdateClubInput = z.infer<typeof updateClubSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
