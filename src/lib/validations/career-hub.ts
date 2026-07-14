import { z } from "zod";

export const internshipCategoryEnum = z.enum([
  "SOFTWARE_DEV",
  "DATA_SCIENCE",
  "DESIGN",
  "MARKETING",
  "FINANCE",
  "CORE_ENGINEERING",
  "RESEARCH",
  "OTHER",
]);

export const internshipModeEnum = z.enum(["REMOTE", "ONSITE", "HYBRID"]);

export const internshipSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(150),
  company: z.string().min(2, "Company name is required").max(150),
  category: internshipCategoryEnum,
  mode: internshipModeEnum,
  location: z.string().max(150).optional().or(z.literal("")),
  stipend: z.string().max(100).optional().or(z.literal("")),
  durationWeeks: z.number().int().min(1).max(104).optional().nullable(),
  applyUrl: z.string().min(1, "Application link is required").max(2000),
  description: z.string().min(10, "Description must be at least 10 characters").max(3000),
  deadline: z.string().optional().or(z.literal("")),
});

export const updateInternshipSchema = internshipSchema.partial();

export const hackathonModeEnum = z.enum(["REMOTE", "ONSITE", "HYBRID"]);

export const hackathonSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(150),
  organizer: z.string().min(2, "Organizer is required").max(150),
  mode: hackathonModeEnum,
  location: z.string().max(150).optional().or(z.literal("")),
  prizePool: z.string().max(100).optional().or(z.literal("")),
  registerUrl: z.string().min(1, "Registration link is required").max(2000),
  description: z.string().min(10, "Description must be at least 10 characters").max(3000),
  startsAt: z.string().min(1, "Start date is required"),
  endsAt: z.string().optional().or(z.literal("")),
  regDeadline: z.string().optional().or(z.literal("")),
});

export const updateHackathonSchema = hackathonSchema.partial();

export const codingResourceCategoryEnum = z.enum([
  "DSA",
  "WEB_DEV",
  "SYSTEM_DESIGN",
  "COMPETITIVE_PROGRAMMING",
  "INTERVIEW_PREP",
  "LANGUAGES",
  "OTHER",
]);

export const codingResourceDifficultyEnum = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
]);

export const codingResourceSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(150),
  provider: z.string().max(100).optional().or(z.literal("")),
  category: codingResourceCategoryEnum,
  difficulty: codingResourceDifficultyEnum,
  url: z.string().min(1, "A link is required").max(2000),
  description: z.string().min(5, "Description must be at least 5 characters").max(2000),
});

export const updateCodingResourceSchema = codingResourceSchema.partial();

export const progressStatusEnum = z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]);

export const updateProgressSchema = z.object({
  status: progressStatusEnum,
});

export const resumeEducationItemSchema = z.object({
  school: z.string().max(150),
  degree: z.string().max(150),
  startYear: z.string().max(10).optional().or(z.literal("")),
  endYear: z.string().max(10).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export const resumeExperienceItemSchema = z.object({
  company: z.string().max(150),
  role: z.string().max(150),
  startDate: z.string().max(20).optional().or(z.literal("")),
  endDate: z.string().max(20).optional().or(z.literal("")),
  description: z.string().max(1000).optional().or(z.literal("")),
});

export const resumeProjectItemSchema = z.object({
  name: z.string().max(150),
  description: z.string().max(1000).optional().or(z.literal("")),
  link: z.string().max(500).optional().or(z.literal("")),
  techStack: z.string().max(300).optional().or(z.literal("")),
});

export const resumeSchema = z.object({
  title: z.string().min(1).max(150),
  fullName: z.string().max(150).optional().or(z.literal("")),
  email: z.string().max(150).optional().or(z.literal("")),
  phone: z.string().max(30).optional().or(z.literal("")),
  location: z.string().max(150).optional().or(z.literal("")),
  summary: z.string().max(1000).optional().or(z.literal("")),
  education: z.array(resumeEducationItemSchema).max(10),
  experience: z.array(resumeExperienceItemSchema).max(10),
  projects: z.array(resumeProjectItemSchema).max(10),
  skills: z.array(z.string().max(50)).max(30),
});

export const updateResumeSchema = resumeSchema.partial();

export type InternshipInput = z.infer<typeof internshipSchema>;
export type UpdateInternshipInput = z.infer<typeof updateInternshipSchema>;
export type HackathonInput = z.infer<typeof hackathonSchema>;
export type UpdateHackathonInput = z.infer<typeof updateHackathonSchema>;
export type CodingResourceInput = z.infer<typeof codingResourceSchema>;
export type UpdateCodingResourceInput = z.infer<typeof updateCodingResourceSchema>;
export type ResumeInput = z.infer<typeof resumeSchema>;
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>;
