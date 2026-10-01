import { currentUser } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Setup() {
  const user = await currentUser();
  const name = user?.user_metadata?.full_name;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center bg-[#FDF8F3] px-6 py-16 text-[#29221C]"
      style={{ fontFamily: "'Anek Tamil', system-ui, sans-serif" }}
    >
      {/* Orb logo */}
      <div className="relative w-20 h-20 flex items-center justify-center mb-6">
        <div className="absolute inset-0 rounded-full bg-[#ef533f]/10 animate-pulse" />
        <div className="w-14 h-14 rounded-full bg-[#ef533f] flex items-center justify-center shadow-lg text-white font-extrabold text-2xl">
          N
        </div>
      </div>

      <p className="font-extrabold text-2xl tracking-[0.25em] text-[#29221C] uppercase mb-1">NILA</p>
      <p className="text-xs text-gray-400 font-bold tracking-[0.2em] uppercase mb-8">Voice Helper</p>

      <div className="max-w-sm w-full text-center bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-[#29221C] mb-3">
          {name ? `வணக்கம், ${name}! 🎉` : "வணக்கம்! 🎉"}
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {name
            ? `Your account is ready, ${name}. NILA is here to help you access government services in your language.`
            : "Your account is all set. NILA is here to help you access government services in your language."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full py-3.5 rounded-full bg-[#ef533f] text-white font-bold text-sm hover:bg-[#d94834] active:scale-95 transition-all shadow-md"
        >
          Start with NILA →
        </Link>
      </div>

      <p className="text-[10px] text-gray-300 mt-8 font-medium tracking-wider uppercase">
        NILA • மகளிர் ஸேவை
      </p>
    </main>
  );
}
