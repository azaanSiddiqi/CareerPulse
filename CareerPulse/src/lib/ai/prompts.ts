/**
 * Versioned prompt templates. Bumping PROMPT_VERSION lets you keep older
 * outputs in the DB while changing the prompt for new ones.
 */

export const PROMPT_VERSION = "2026-05-04.v1";

const SYSTEM_BASE = `You are CareerPulse, a precise career assistant.
You always respond with valid JSON matching the requested schema.
You never invent skills or experience the candidate hasn't demonstrated.
You write in the candidate's voice — confident, specific, no clichés.`;

export const systemPrompt = () => SYSTEM_BASE;

export const tailorResumePrompt = (input: {
  jobDescription: string;
  jobRole: string;
  jobCompany: string;
  baseResume: string;
}) => `Tailor this candidate's resume to the role.

ROLE: ${input.jobRole} at ${input.jobCompany}

JOB DESCRIPTION:
${input.jobDescription}

CANDIDATE'S BASE RESUME:
${input.baseResume}

Return JSON:
{
  "summary": "2-3 sentence professional summary aimed at this role",
  "bullets": ["3-5 resume bullets that mirror the JD's language and quantify impact where possible"]
}

Rules:
- Only use experience that's evidenced in the base resume.
- Match keywords from the JD when truthful.
- Each bullet leads with a strong verb and includes a number when one exists in the source.
- No buzzword soup. No "synergized" or "leveraged."`;

export const interviewQuestionsPrompt = (input: {
  jobDescription: string;
  jobRole: string;
  jobCompany: string;
}) => `Generate likely interview questions for this role.

ROLE: ${input.jobRole} at ${input.jobCompany}

JOB DESCRIPTION:
${input.jobDescription}

Return JSON:
{
  "behavioral": ["6 behavioral questions tailored to the seniority and domain"],
  "technical": ["6 technical questions covering the core skills the JD names"]
}

Rules:
- Behavioral questions should reference situations that map to the JD's responsibilities.
- Technical questions should escalate from fundamentals to one or two stretch questions.
- Don't ask trick questions or LeetCode-style brainteasers unless the JD signals algorithmic interviewing.`;

export const coverLetterPrompt = (input: {
  jobDescription: string;
  jobRole: string;
  jobCompany: string;
  baseResume: string;
  tone?: "professional" | "enthusiastic" | "concise";
}) => `Write a cover letter for this candidate.

TONE: ${input.tone ?? "professional"}
ROLE: ${input.jobRole} at ${input.jobCompany}

JOB DESCRIPTION:
${input.jobDescription}

CANDIDATE'S BASE RESUME:
${input.baseResume}

Return JSON:
{
  "letter": "A 250-350 word cover letter, no addresses, no 'Dear hiring manager' if the tone is concise"
}

Rules:
- Open with a hook tied to the company or role, not "I am applying for…"
- Reference 1-2 specific items from the JD and connect them to evidence in the resume.
- End with a clear, light close. No "Looking forward to hearing from you" cliché.`;

export const matchScorePrompt = (input: {
  jobDescription: string;
  jobRole: string;
  baseResume: string;
}) => `Score how well this candidate matches the role.

ROLE: ${input.jobRole}

JOB DESCRIPTION:
${input.jobDescription}

CANDIDATE'S BASE RESUME:
${input.baseResume}

Return JSON:
{
  "score": <0-100 integer>,
  "matched": ["skills/requirements the candidate clearly has"],
  "gaps": ["skills/requirements the candidate lacks or hasn't shown"]
}

Rules:
- Be honest. Don't inflate the score.
- "matched" items must be evidenced in the resume.
- "gaps" should suggest what's missing, not just list what's absent.`;
