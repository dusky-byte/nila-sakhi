import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { ApplicationSaveRequest } from "@/lib/nila/types";

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  try {
    const body: ApplicationSaveRequest = await req.json();

    if (!body.sessionId || !body.data) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }

    const db = supabase();
    if (db) {
      const { error } = await db.from("nila_applications").upsert({
        session_id:  body.sessionId,
        service:     "e-shram",
        status:      "prepared",
        language:    body.language,
        data:        body.data,
        updated_at:  new Date().toISOString(),
      }, { onConflict: "session_id" });

      if (error) console.warn("[NILA application] upsert error:", error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[NILA /api/application]", err);
    return NextResponse.json({ ok: true }); // non-fatal; data is shown in UI anyway
  }
}
