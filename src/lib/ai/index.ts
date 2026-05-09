/**
 * AI provider router. Reads AI_PROVIDER from env and returns the matching
 * implementation. Both providers conform to the same `AIProvider` interface,
 * so route handlers are agnostic.
 *
 * Override per request by passing `?provider=openai` (route handlers can
 * call `getAIProvider('openai')` to honor the user's preference).
 */

import { claudeProvider } from "./claude";
import { openaiProvider } from "./openai";
import type { AIProvider } from "./types";

type ProviderName = "anthropic" | "openai";

export function getAIProvider(override?: ProviderName | null): AIProvider {
  const name = (override ?? process.env.AI_PROVIDER ?? "anthropic") as ProviderName;
  switch (name) {
    case "openai":
      return openaiProvider;
    case "anthropic":
    default:
      return claudeProvider;
  }
}

export type { AIProvider } from "./types";
