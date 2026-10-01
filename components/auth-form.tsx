"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Logo } from "./logo";
import CodeSlots from "./ui/CodeSlots";

type Field = { name: string; label: string; type: string; autoComplete: string; otp?: boolean };
export function AuthForm(p: {
  title: string; action: (fd: FormData) => Promise<void>; fields: Field[]; submit: string;
  error?: string; notice?: string; hidden?: Record<string, string>; footer: React.ReactNode;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-600/5 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="absolute top-8 left-8 z-10">
        <Link href="/" aria-label="Clove home"><Logo /></Link>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-surface border border-border rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{p.title}</h2>
            <p className="text-sm text-gray-400">Continue your journey with Clove.</p>
          </div>

          <div role="status" aria-live="polite" className="mb-4">
            {p.error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400 flex items-center gap-2"><i className="ph-fill ph-warning-circle"></i> {p.error}</p>}
            {p.notice && <p className="rounded-lg border border-primary-500/20 bg-primary-500/10 px-3 py-2 text-sm text-primary-400 flex items-center gap-2"><i className="ph-fill ph-info"></i> {p.notice}</p>}
          </div>

          <form action={p.action} className="space-y-4">
            {Object.entries(p.hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
            {p.fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">{f.label}</label>
                {f.otp ? (
                  <div className="flex justify-center">
                    <CodeSlots
                      name={f.name}
                      length={6}
                      status={p.error ? "error" : "idle"}
                    />
                  </div>
                ) : f.type === "password" ? (
                  <div className="relative">
                    <input name={f.name} type={showPassword ? "text" : "password"} autoComplete={f.autoComplete} required
                      placeholder={`Enter your ${f.label.toLowerCase()}`}
                      className={`w-full bg-background border border-border rounded-lg px-4 py-2.5 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors`} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      aria-label={showPassword ? "Hide password" : "Reveal password"}
                    >
                      <i className={`ph ${showPassword ? 'ph-eye-slash' : 'ph-eye'} text-lg`}></i>
                    </button>
                  </div>
                ) : (
                  <input name={f.name} type={f.type} autoComplete={f.autoComplete} required
                    placeholder={`Enter your ${f.label.toLowerCase()}`}
                    className={`w-full bg-background border border-border rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors`} />
                )}
              </div>
            ))}
            
            <div className="pt-4">
              <SubmitButton text={p.submit} />
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            {p.footer}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20 focus:ring-primary-500 border border-primary-500/50 relative overflow-hidden group">
      <span className={`transition-opacity duration-200 ${pending ? "opacity-0" : "opacity-100"}`}>{text}</span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <i className="ph ph-spinner animate-spin text-xl"></i>
        </span>
      )}
    </button>
  );
}
