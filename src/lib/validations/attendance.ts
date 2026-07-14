import { z } from "zod";

export const dayOfWeekEnum = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);

export const sessionTypeEnum = z.enum(["LECTURE", "LAB", "TUTORIAL", "SEMINAR"]);

export const attendanceStatusEnum = z.enum(["PRESENT", "ABSENT", "CANCELLED"]);

export const subjectSchema = z.object({
  name: z.string().min(2, "Subject name must be at least 2 characters").max(80),
  code: z.string().max(20).optional().or(z.literal("")),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color"),
  targetPercent: z
    .number()
    .int()
    .min(1, "Target must be at least 1%")
    .max(100, "Target can't exceed 100%"),
});

export const updateSubjectSchema = subjectSchema.partial();

export const timetableSlotSchema = z.object({
  subjectId: z.string().min(1, "Select a subject"),
  dayOfWeek: dayOfWeekEnum,
  startTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:MM format"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Use HH:MM format"),
  room: z.string().max(40).optional().or(z.literal("")),
  type: sessionTypeEnum,
});

export const updateTimetableSlotSchema = timetableSlotSchema.partial();

export const attendanceRecordSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  date: z.string().min(1, "Date is required"), // ISO date string "YYYY-MM-DD"
  status: attendanceStatusEnum,
  note: z.string().max(200).optional().or(z.literal("")),
});

export const bulkAttendanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  records: z.array(
    z.object({
      subjectId: z.string().min(1),
      status: attendanceStatusEnum,
    })
  ),
});

export type SubjectInput = z.infer<typeof subjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type TimetableSlotInput = z.infer<typeof timetableSlotSchema>;
export type UpdateTimetableSlotInput = z.infer<typeof updateTimetableSlotSchema>;
export type AttendanceRecordInput = z.infer<typeof attendanceRecordSchema>;
export type BulkAttendanceInput = z.infer<typeof bulkAttendanceSchema>;
