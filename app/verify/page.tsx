import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { resendCode, verifyEmail } from "@/app/auth/actions";

export default async function Verify({ searchParams }: { searchParams: Promise<{ email?: string; error?: string; sent?: string }> }) {
  const { email, error, sent } = await searchParams;
  if (!email) redirect("/signup");
  return (
    <AuthForm title="Check your email" action={verifyEmail} submit="Verify email" error={error}
      notice={sent ? "New code sent." : `We sent a 6-digit code to ${email}. It expires in 1 hour.`}
      hidden={{ email }} fields={[{ name: "code", label: "Verification code", type: "text", autoComplete: "one-time-code", otp: true }]}
      footer={
        <form action={resendCode} className="flex flex-wrap items-center gap-x-3">
          <input type="hidden" name="email" value={email} />
          <button className="underline">Resend code</button>
          <Link href="/signup" className="underline">Use a different email</Link>
        </form>
      } />
  );
}
