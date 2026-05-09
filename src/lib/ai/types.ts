/**
 * Provider-agnostic AI interface. Both Claude and OpenAI implementations
 * conform to this so route handlers don't know which model is running.
 */

export interface TailoredResume {
  summary: string;
  bullets: string[];
}

export interface InterviewQuestions {
  behavioral: string[];
  technical: string[];
}

export interface CoverLetter {
  letter: string;
}

export interface MatchScore {
  score: number; // 0–100
  matched: string[];
  gaps: string[];
}

export interface TailorInput {
  jobDescription: string;
  jobRole: string;
  jobCompany: string;
  baseResume: string;
}

export interface InterviewInput {
  jobDescription: string;
  jobRole: string;
  jobCompany: string;
}

export interface CoverLetterInput extends TailorInput {
  tone?: "professional" | "enthusiastic" | "concise";
}

export interface AIProvider {
  name: "anthropic" | "openai";
  model: string;
  promptVersion: string;

  tailorResume(input: TailorInput): Promise<TailoredResume>;
  generateInterviewQuestions(input: InterviewInput): Promise<InterviewQuestions>;
  generateCoverLetter(input: CoverLetterInput): Promise<CoverLetter>;
  matchScore(input: TailorInput): Promise<MatchScore>;
}
