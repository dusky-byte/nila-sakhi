import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { requestReset } from "@/app/auth/actions";
export default async function Forgot({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthForm title="Reset your password" action={requestReset} submit="Send code" error={error}
    fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]}
    footer={<Link href="/login" className="underline">Back to sign in</Link>} />;
}
