# Email OTP via Google (Gmail SMTP)

1. Google account → Security → turn on 2-Step Verification → App passwords → create one named "Clove" (16 characters, no spaces).
2. Supabase dashboard → Authentication → Emails → SMTP Settings → enable custom SMTP:
   - Host `smtp.gmail.com`, Port `465`
   - Username: the Gmail/Workspace address; Password: the app password
   - Sender email: same address; Sender name: Clove
3. Authentication → Emails → Templates: paste `templates/confirm.html` into **Confirm signup** and `templates/recovery.html` into **Reset password**. They must contain `{{ .Token }}` (the 6-digit code) and no confirmation link.
4. Authentication → Sign In / Providers → Email: keep **Confirm email** on. OTP length 6, expiry 3600s.

Limits: a personal Gmail account caps at roughly 500 sends/day (Workspace ~2,000); Supabase also throttles resends to one per 60 seconds per user. Fine for a demo; use a transactional provider (Resend, Postmark) before real launch.
Do not commit the app password; it lives only in the Supabase dashboard.
