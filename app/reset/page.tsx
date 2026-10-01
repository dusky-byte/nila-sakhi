import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { resetWithCode } from "@/app/auth/actions";

export default async function Reset({ searchParams }: { searchParams: Promise<{ email?: string; error?: string }> }) {
  const { email, error } = await searchParams;
  if (!email) redirect("/forgot-password");
  return (
    <AuthForm title="Set a new password" action={resetWithCode} submit="Update password" error={error}
      notice={`If ${email} has an account, we sent it a 6-digit code.`} hidden={{ email }}
      fields={[
        { name: "code", label: "Code from your email", type: "text", autoComplete: "one-time-code", otp: true },
        { name: "password", label: "New password (8+ characters)", type: "password", autoComplete: "new-password" },
      ]}
      footer={<Link href="/forgot-password" className="underline">Send a new code</Link>} />
  );
}
