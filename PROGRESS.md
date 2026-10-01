# Clove — build progress

## Stack (current)
Next.js 15 App Router + TS + Tailwind, Supabase (Postgres, Auth, Storage, RLS) via @supabase/ssr, Groq, Zod. No Prisma, no separate backend.

## Done
- Phase 1: config, Tailwind token theme (dark default/light), landing page, wordmark
- Phase 2: `supabase/migrations/0001_init.sql` — 23 tables, all with user_id + owner-only RLS, signup trigger (profiles + user_preferences), private `resumes` bucket (5 MB, PDF/DOCX, per-user folder policy)
- Phase 2: Supabase server/browser clients, middleware route protection (verified via getUser), sign in/up/out/reset server actions with Zod, /auth/callback (no open redirect), /login /signup /forgot-password, signup → /profile/setup
- lib/ai/groq.ts: server-only `aiJson()` with Zod validation and typed errors

- Email OTP flow: signup → /verify (6-digit code, resend) → /profile/setup; unverified sign-in re-sends a code and goes to /verify; password reset = /forgot-password → /reset (code + new password). Gmail SMTP + templates: supabase/EMAIL_SETUP.md. /auth/callback kept for future OAuth.

## Not done
- shadcn primitives, app shell (sidebar + mobile nav), sign-out button placement
- /profile/setup is a stub — Phase 3 onboarding is next
- Phases 3–14; demo seed (scripts/seed.ts using service-role key, profiles.is_demo = true)
- Nothing has been installed, run or tested. Migration not applied.

## Known limits / decisions
- RLS enforces ownership by user_id only; it does not stop a user pointing a child row at another user's parent uuid. Server code must verify parent ownership before inserts.
- Email confirmation must stay ON for OTP verify to be used; Gmail SMTP must be configured (EMAIL_SETUP.md) or no codes are sent. Supabase's built-in mailer is ~2 emails/hour.
- Design screenshots never received; accent is a placeholder.

## Next session
1. Create Supabase project → apply migration (SQL editor or `supabase db push`) → fill .env → `npm i && npm run dev`
2. Phase 3: conversational onboarding → aiJson extraction → editable Career Profile → write profiles/educations/career_goals/skills
