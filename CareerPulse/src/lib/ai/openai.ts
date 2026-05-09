import OpenAI from "openai";
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

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

async function complete<T>(prompt: string): Promise<T> {
  const res = await client.chat.completions.create({
    model: MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt() },
      { role: "user", content: prompt },
    ],
  });

  const text = res.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text) as T;
}

export const openaiProvider: AIProvider = {
  name: "openai",
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
