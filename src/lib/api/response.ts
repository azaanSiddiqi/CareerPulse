import { NextResponse } from "next/server";
import { ZodError } from "zod";

type ErrorCode =
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "invalid_input"
  | "ai_provider_error"
  | "rate_limited"
  | "server_error";

export function apiError(code: ErrorCode, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ error: { code, message, details } }, { status });
}

export function fromZodError(err: ZodError) {
  return apiError("invalid_input", "Validation failed", 400, err.flatten());
}

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}
