import { z } from "zod";

export const aiRequestSchema = z.object({
  jobId: z.string().uuid(),
  provider: z.enum(["anthropic", "openai"]).optional(),
});

export const coverLetterSchema = aiRequestSchema.extend({
  tone: z.enum(["professional", "enthusiastic", "concise"]).optional(),
});

export type AIRequest = z.infer<typeof aiRequestSchema>;
