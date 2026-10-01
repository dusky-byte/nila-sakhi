import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { SupportedLanguage } from "@/lib/nila/types";

const TRANSLATE_SYSTEM_PROMPT = `You are NILA, a voice assistant helping first-time digital users in India.
The user has shared a screenshot of their screen. Your job is to:
1. Read any visible text in the screenshot.
2. Explain what the screen is showing in simple, friendly language.
3. If there are buttons or actions, describe what the user can do.
Respond ONLY in the user's requested language. Use very simple words — imagine explaining to someone who has never used a phone.
Keep the response to 2-4 sentences maximum.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
    }

    const body = await req.json();
    const { imageBase64, mimeType = "image/png", language = "ta" } = body as {
      imageBase64: string;
      mimeType?: string;
      language?: SupportedLanguage;
    };

    if (!imageBase64) {
      return NextResponse.json({ ok: false, error: "Missing imageBase64" }, { status: 400 });
    }

    const langLabel: Record<SupportedLanguage, string> = {
      ta: "Tamil", hi: "Hindi", en: "English", mixed: "Tanglish",
    };

    const groq = new Groq({ apiKey });
    const model = process.env.GROQ_VISION_MODEL ?? "meta-llama/llama-4-scout-17b-16e-instruct";

    const res = await groq.chat.completions.create({
      model,
      max_tokens: 250,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${TRANSLATE_SYSTEM_PROMPT}\n\nRespond in ${langLabel[language as SupportedLanguage] ?? "Tamil"}.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    });

    const reply = res.choices[0]?.message?.content?.trim() ?? "";

    if (!reply) throw new Error("Empty vision response");

    return NextResponse.json({ ok: true, reply });
  } catch (err) {
    console.error("[NILA /api/chat/translate]", err);
    const fallback: Record<SupportedLanguage, string> = {
      ta: "திரையை படிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
      hi: "स्क्रीन नहीं पढ़ी जा सकी। दोबारा कोशिश करें।",
      en: "Could not read the screen. Please try again.",
      mixed: "Screen read pannala. Try again!",
    };
    const lang = (req.headers.get("x-nila-lang") ?? "ta") as SupportedLanguage;
    return NextResponse.json({ ok: true, reply: fallback[lang] ?? fallback.en });
  }
}
