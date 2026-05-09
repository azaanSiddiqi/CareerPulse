import { z } from "zod";

export const jobStatus = z.enum([
  "wishlist",
  "applied",
  "interview",
  "offer",
  "rejected",
]);

export const createJobSchema = z.object({
  company: z.string().min(1, "Company is required").max(120),
  role: z.string().min(1, "Role is required").max(160),
  description: z.string().max(20000).optional(),
  link: z.string().url().optional().or(z.literal("")),
  status: jobStatus.default("applied"),
  applied_at: z.string().datetime().optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const reminderSchema = z.object({
  due_at: z.string().datetime(),
  type: z.enum(["interview", "follow_up", "deadline"]),
  message: z.string().max(500).optional(),
});

export const noteSchema = z.object({
  content: z.string().min(1).max(5000),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
