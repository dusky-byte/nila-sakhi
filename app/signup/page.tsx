import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signUp } from "@/app/auth/actions";
export default async function Signup({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthForm title="Build your career roadmap" action={signUp} submit="Create account" error={error}
    fields={[{ name: "name", label: "Full Name", type: "text", autoComplete: "name" }, { name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "password", label: "Password", type: "password", autoComplete: "new-password" }]}
    footer={<><span className="text-gray-400">Already have an account? </span><Link href="/login" className="text-primary-400 hover:text-white transition-colors">Sign in</Link></>} />;
}
