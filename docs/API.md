# API

All routes live under `src/app/api/` and are Next.js route handlers. All require an authenticated session except the cron route, which requires `CRON_SECRET`.

## Conventions

- JSON in, JSON out. Error shape: `{ error: { code, message } }`.
- Validation with Zod on every input. Failures return 400.
- Auth via Supabase server client; ownership enforced by RLS.
- 200 for reads, 201 for creates, 204 for deletes, 4xx/5xx as expected.

## Jobs

### `GET /api/jobs`
Query: `?status=applied&q=stripe&limit=50&offset=0`
Returns: `{ jobs: Job[], total: number }`

### `POST /api/jobs`
Body: `{ company, role, description?, link?, status?, applied_at? }`
Returns: `{ job: Job }` (201)

### `GET /api/jobs/:id`
Returns: `{ job: Job, notes: Note[], ai_outputs: AIOutput[], reminders: Reminder[] }`

### `PATCH /api/jobs/:id`
Body: any subset of job fields.
Returns: `{ job: Job }`

### `DELETE /api/jobs/:id`
Returns: 204

## Notes

### `POST /api/jobs/:id/notes` — `{ content }`
### `DELETE /api/notes/:id`

## Reminders

### `POST /api/jobs/:id/reminders` — `{ due_at, type, message? }`
### `PATCH /api/reminders/:id` — `{ due_at?, message? }`
### `DELETE /api/reminders/:id`

## AI

All AI routes accept `{ jobId }` and return structured JSON. The route handler:
1. Authenticates user.
2. Fetches the job (RLS enforces ownership).
3. Calls the provider router.
4. Persists the result to `ai_outputs`.
5. Returns the saved row.

### `POST /api/ai/tailor-resume`
Body: `{ jobId }`
Returns: `{ output: { id, content: { bullets: string[], summary: string }, model } }`

### `POST /api/ai/interview-questions`
Body: `{ jobId }`
Returns: `{ output: { content: { behavioral: string[], technical: string[] } } }`

### `POST /api/ai/cover-letter`
Body: `{ jobId, tone?: 'professional' | 'enthusiastic' | 'concise' }`
Returns: `{ output: { content: { letter: string } } }`

### `POST /api/ai/match-score`
Body: `{ jobId }`
Returns: `{ output: { content: { score: number, matched: string[], gaps: string[] } } }`

## Cron

### `POST /api/cron/send-reminders`
Headers: `Authorization: Bearer <CRON_SECRET>`
Runs hourly. Sends emails for reminders due in the next hour where `notified_at is null`. Marks them.

Vercel cron config in `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/send-reminders", "schedule": "0 * * * *" }
  ]
}
```

## Error codes

| code | meaning |
|---|---|
| `unauthenticated` | no session |
| `forbidden` | session exists but RLS blocked the row |
| `not_found` | id valid but row not visible to user |
| `invalid_input` | zod validation failed; `details` contains the issues |
| `ai_provider_error` | upstream model error; safe to retry |
| `rate_limited` | too many AI calls; show backoff message |
