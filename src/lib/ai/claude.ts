import Anthropic from "@anthropic-ai/sdk";
import {
  AIProvider,
  CoverLetter,
  CoverLetterInput,
  InterviewInput,
  InterviewQuestions,
  MatchScore,
  TailorInput,
  TailoredResume,
} from "./types";
import {
  PROMPT_VERSION,
  coverLetterPrompt,
  interviewQuestionsPrompt,
  matchScorePrompt,
  systemPrompt,
  tailorResumePrompt,
} from "./prompts";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6";

async function complete<T>(prompt: string): Promise<T> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: systemPrompt(),
    messages: [{ role: "user", content: prompt }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  // Strip code fences if present and parse JSON.
  const cleaned = text.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
  return JSON.parse(cleaned) as T;
}

export const claudeProvider: AIProvider = {
  name: "anthropic",
  model: MODEL,
  promptVersion: PROMPT_VERSION,

  tailorResume(input: TailorInput) {
    return complete<TailoredResume>(tailorResumePrompt(input));
  },
  generateInterviewQuestions(input: InterviewInput) {
    return complete<InterviewQuestions>(interviewQuestionsPrompt(input));
  },
  generateCoverLetter(input: CoverLetterInput) {
    return complete<CoverLetter>(coverLetterPrompt(input));
  },
  matchScore(input: TailorInput) {
    return complete<MatchScore>(
      matchScorePrompt({
        jobDescription: input.jobDescription,
        jobRole: input.jobRole,
        baseResume: input.baseResume,
      })
    );
  },
};
