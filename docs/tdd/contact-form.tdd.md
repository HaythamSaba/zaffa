# TDD evidence: contact form (Phase 1, step 3)

**Source plan:** the Phase 1 plan approved in conversation (no `*.plan.md` file).
**Checkpoints:** `3a2578e` (RED) → `909b879` (GREEN) on `feat/landing-page`. No separate refactor commit.

## User journeys
1. A couple submits valid details, sees a clear success message, and the inquiry is emailed to the studio with reply-to set to the couple.
2. A couple makes a mistake, sees which fields to fix, and keeps what they typed.
3. A bot fills the hidden honeypot, gets a fake success, and nothing is sent.
4. Someone floods the form; after 5 submissions in 10 minutes from one IP they are asked to wait.
5. Delivery fails; the visitor gets a friendly error with our email, and the reason is logged on the server.
6. A developer uses `CONTACT_DRY_RUN=1` locally; in production the flag has no effect.

## RED
`npx vitest run` → 8 suites failed with `Cannot find module` for the new, unimplemented modules; the existing 4 tests passed.

## GREEN
`npm run test:coverage` → 9 files, **65 tests passed**.
One intermediate failure was fixed: Zod 4 runs `.refine` after a failed regex, so `isRealDate` threw `RangeError` on `12/06/2027`; it now validates its own input.

## Test specification
| # | What is guaranteed | Test | Type | Result |
|---|---|---|---|---|
| 1 | Names and email are required; empty optional fields become undefined; package defaults to "unsure" | `lib/contact/schema.test.ts` | unit | PASS |
| 2 | Length caps (names 120, message 2000), offered packages only, real and non-past dates (1-day grace), file uploads rejected | `lib/contact/schema.test.ts` | unit | PASS |
| 3 | Sliding window allows the limit, blocks the next request with the correct retry time, ignores blocked attempts, keeps keys separate, keeps memory bounded | `lib/rate-limit.test.ts` | unit | PASS |
| 4 | Client IP comes only from `x-real-ip`, then the first `x-forwarded-for` entry; other headers and non-IP values are ignored; IPv6 is supported | `lib/client-ip.test.ts` | unit | PASS |
| 5 | `CONTACT_DRY_RUN=1` works outside production and **is ignored in production** | `lib/contact/env.test.ts` | unit | PASS |
| 6 | Missing Resend variables throw an error that names them without echoing their values | `lib/contact/env.test.ts` | unit | PASS |
| 7 | Email is plain text with reply-to set to the couple; the subject can't carry injected headers; provider errors and throws become failures | `lib/contact/email.test.ts` | unit | PASS |
| 8 | Flow order is rate limit → honeypot → validate → deliver; values are echoed only on error; internal reasons are never shown to visitors | `lib/contact/handle-inquiry.test.ts` | unit | PASS |
| 9 | Server action: dry run sends nothing; **production with DRY_RUN=1 really sends**; missing config gives a friendly error; per-IP limit uses Vercel headers | `app/(marketing)/actions.test.ts` | integration (mocked `next/headers` and Resend) | PASS |
| 10 | Form: labelled and required fields, hidden honeypot, linked field errors, values kept after an error, alert and status regions, pending state | `components/marketing/ContactFormView.test.tsx` | component (jsdom) | PASS |

## Coverage
Statements 97.64%, branches 92%, functions 100%, lines 98.68% (scope: `lib/**`, the action, `ContactFormView`; thresholds 80%).

## Manual check (production build)
- Past wedding date → field error shown, names kept.
- Valid submission with no Resend config → friendly error; the server logs `Missing contact form configuration: RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL`.

## Known gaps
- No e2e test yet for the success path. `CONTACT_DRY_RUN` is correctly ignored under `next start` (production), so a success e2e needs `next dev` or a real Resend test key. Planned for Phase 6.
- The rate limiter is per server instance (in memory). It's acceptable for launch; a shared store can be added behind the same interface later.
- Playwright's `getByRole("alert")` also matches Next's route announcer; future e2e tests must scope alerts to `#contact`.
