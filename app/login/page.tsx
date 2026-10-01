import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { signIn } from "@/app/auth/actions";
export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <AuthForm title="Welcome back" action={signIn} submit="Sign in" error={error}
    fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }, { name: "password", label: "Password", type: "password", autoComplete: "current-password" }]}
    footer={<><Link href="/forgot-password" className="text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</Link> &middot; <Link href="/signup" className="text-gray-400 hover:text-white transition-colors">Create account</Link></>} />;
}
