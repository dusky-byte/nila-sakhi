import { NextRequest, NextResponse } from "next/server";
import { GroqProvider } from "@/lib/nila/groq-provider";
import type { UnderstandRequest } from "@/lib/nila/types";

const provider = new GroqProvider();

export async function POST(req: NextRequest) {
  try {
    const body: UnderstandRequest = await req.json();

    if (!body.userText || typeof body.userText !== "string") {
      return NextResponse.json({ ok: false, error: "Missing userText" }, { status: 400 });
    }

    const result = await provider.understand({
      userText:            body.userText.slice(0, 1000), // hard limit
      currentStep:         body.currentStep,
      language:            body.language ?? "en",
      applicationData:     body.applicationData ?? {},
      simplifyLevel:       body.simplifyLevel ?? 0,
      conversationHistory: body.conversationHistory ?? [],
    });

    return NextResponse.json({ ok: true, result });
  } catch (err) {
    // Log for developers; never expose to client
    console.error("[NILA /api/ai/understand]", err);
    return NextResponse.json({ ok: false, error: "service_unavailable" }, { status: 503 });
  }
}
