"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import CodeSlots from "./ui/CodeSlots";

type Field = { name: string; label: string; type: string; autoComplete: string; otp?: boolean };

export function AuthForm(p: {
  title: string; action: (fd: FormData) => Promise<void>; fields: Field[]; submit: string;
  error?: string; notice?: string; hidden?: Record<string, string>; footer: React.ReactNode;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FDF8F3]"
      style={{ fontFamily: "'Anek Tamil', system-ui, sans-serif" }}
    >
      {/* Subtle warm blobs */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-[#ef533f]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-[#FBBB75]/8 rounded-full blur-[100px] pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="flex flex-col items-center gap-1 mb-8 group" aria-label="NILA home">
        <div className="w-12 h-12 rounded-full bg-[#ef533f] flex items-center justify-center shadow-lg text-white font-extrabold text-xl group-hover:scale-105 transition-transform">
          N
        </div>
        <p className="font-extrabold text-sm tracking-[0.25em] text-[#29221C] uppercase">NILA</p>
        <p className="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">Voice Helper</p>
      </Link>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-[#29221C] mb-1">{p.title}</h2>
          <p className="text-sm text-gray-400 mb-6">Continue with NILA.</p>

          <div role="status" aria-live="polite" className="mb-4 space-y-2">
            {p.error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 font-medium flex items-center gap-2">
                <span className="shrink-0">⚠</span> {p.error}
              </p>
            )}
            {p.notice && (
              <p className="rounded-xl border border-[#ef533f]/20 bg-[#ef533f]/5 px-4 py-2.5 text-sm text-[#ef533f] font-medium flex items-center gap-2">
                <span className="shrink-0">ℹ</span> {p.notice}
              </p>
            )}
          </div>

          <form action={p.action} className="space-y-4">
            {Object.entries(p.hidden ?? {}).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
            {p.fields.map((f) => (
              <div key={f.name}>
                <label className="block text-sm font-semibold text-[#29221C] mb-1.5">{f.label}</label>
                {f.otp ? (
                  <div className="flex justify-center py-2">
                    <CodeSlots name={f.name} length={6} status={p.error ? "error" : "idle"} />
                  </div>
                ) : f.type === "password" ? (
                  <div className="relative">
                    <input
                      name={f.name}
                      type={showPassword ? "text" : "password"}
                      autoComplete={f.autoComplete}
                      required
                      placeholder={`Enter your ${f.label.toLowerCase()}`}
                      className="w-full bg-[#FDF8F3] border border-gray-200 rounded-xl px-4 py-3 text-[#29221C] placeholder-gray-400 focus:outline-none focus:border-[#ef533f] focus:ring-2 focus:ring-[#ef533f]/20 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ef533f] transition-colors text-sm"
                      aria-label={showPassword ? "Hide password" : "Reveal password"}
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                ) : (
                  <input
                    name={f.name}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    required
                    placeholder={`Enter your ${f.label.toLowerCase()}`}
                    className="w-full bg-[#FDF8F3] border border-gray-200 rounded-xl px-4 py-3 text-[#29221C] placeholder-gray-400 focus:outline-none focus:border-[#ef533f] focus:ring-2 focus:ring-[#ef533f]/20 transition-all text-sm"
                  />
                )}
              </div>
            ))}

            <div className="pt-2">
              <SubmitButton text={p.submit} />
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            {p.footer}
          </div>
        </div>
      </div>

      <p className="text-[10px] text-gray-300 mt-8 font-medium tracking-wider uppercase">
        NILA • மகளிர் ஸேவை
      </p>
    </div>
  );
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full py-3.5 rounded-full bg-[#ef533f] text-white font-bold text-sm hover:bg-[#d94834] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md relative overflow-hidden"
    >
      <span className={`transition-opacity duration-200 ${pending ? "opacity-0" : "opacity-100"}`}>
        {text}
      </span>
      {pending && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </span>
      )}
    </button>
  );
}
