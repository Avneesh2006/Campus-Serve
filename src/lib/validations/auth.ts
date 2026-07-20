import { z } from "zod";

/**
 * The one seeded Super Admin account, which bypasses the college-email
 * domain restriction below. Kept in one place so the schema, the register
 * API, and the seed script all agree on the same address.
 */
export const SUPER_ADMIN_EMAIL = "avneeshagarwal2006@gmail.com";

const COLLEGE_EMAIL_DOMAIN = "@jecrc.ac.in";

export const branchEnum = z.enum([
  "CSE",
  "CSE_AI",
  "CSE_DS",
  "CSE_CYBER_SECURITY",
  "IT",
  "AI_ML",
  "ECE",
  "ELECTRICAL",
  "MECHANICAL",
  "CIVIL",
  "OTHER",
]);

export const BRANCH_LABELS: Record<z.infer<typeof branchEnum>, string> = {
  CSE: "CSE",
  CSE_AI: "CSE AI",
  CSE_DS: "CSE DS",
  CSE_CYBER_SECURITY: "CSE Cyber Security",
  IT: "IT",
  AI_ML: "AI & ML",
  ECE: "ECE",
  ELECTRICAL: "Electrical",
  MECHANICAL: "Mechanical",
  CIVIL: "Civil",
  OTHER: "Other",
};

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    rollNumber: z.string().min(1, "Roll number is required").max(50),
    branch: branchEnum,
    semester: z
      .number()
      .int()
      .min(1, "Select a semester")
      .max(8, "Select a semester"),
    email: z
      .string()
      .email("Enter a valid email address")
      .refine(
        (email) =>
          email.toLowerCase().endsWith(COLLEGE_EMAIL_DOMAIN) ||
          email.toLowerCase() === SUPER_ADMIN_EMAIL,
        { message: "Only JECRC college email addresses are allowed." }
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Missing reset token"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
