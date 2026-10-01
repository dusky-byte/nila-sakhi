import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { SessionCreateRequest, SessionCreateResponse } from "@/lib/nila/types";

// Lightweight Supabase client for NILA sessions (no auth cookies needed)
function supabase() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const body: SessionCreateRequest = await req.json().catch(() => ({}));
    const sessionId = crypto.randomUUID();
    const db = supabase();

    if (db) {
      await db.from("nila_sessions").insert({
        id:         sessionId,
        language:   body.language ?? "en",
        anonymous:  true,
        created_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.warn("[NILA session] insert failed:", error.message);
      });
    }

    const response: SessionCreateResponse = { sessionId };
    return NextResponse.json(response);
  } catch (err) {
    console.error("[NILA /api/session]", err);
    // Session creation is non-fatal; return an in-memory id
    return NextResponse.json({ sessionId: crypto.randomUUID() });
  }
}
