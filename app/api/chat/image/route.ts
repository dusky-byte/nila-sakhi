import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { SupportedLanguage } from "@/lib/nila/types";

const VISION_SYSTEM_PROMPT = `You are NILA, a warm voice assistant helping first-time digital users in India.
The user has shared an image with you. Check if it's an ID card (like Aadhaar or Ration Card).
Respond strictly in JSON format with the following keys:
- "reply": A natural, 1-2 sentence response in the requested language (e.g. "I can see your Aadhaar card! I will use this for your application.")
- "extracted": An object containing "name", "dob", and "aadhaar" if you found them in the image. If not found, leave them null.

Do NOT include any markdown or text outside of the JSON object. Keep your "reply" very warm and simple.`;

function getLangLabel(lang: SupportedLanguage): string {
  return { ta: "Tamil", hi: "Hindi", en: "English", mixed: "Tanglish" }[lang] ?? "Tamil";
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Not configured" }, { status: 503 });
    }

    const body = await req.json();
    const { imageBase64, mimeType = "image/jpeg", language = "ta" } = body as {
      imageBase64: string;
      mimeType?: string;
      language?: SupportedLanguage;
    };

    if (!imageBase64) {
      return NextResponse.json({ ok: false, error: "Missing imageBase64" }, { status: 400 });
    }

    const groq = new Groq({ apiKey });
    const model = process.env.GROQ_VISION_MODEL ?? "qwen/qwen3.8-27b";

    const res = await groq.chat.completions.create({
      model,
      max_tokens: 300,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `${VISION_SYSTEM_PROMPT}\n\nRespond with "reply" in ${getLangLabel(language as SupportedLanguage)}.`,
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

    const raw = (res.choices[0]?.message?.content ?? "{}").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    const data = JSON.parse(raw);

    if (!data.reply) {
      throw new Error("Empty vision response");
    }

    return NextResponse.json({ ok: true, reply: data.reply, extracted: data.extracted });
  } catch (err) {
    console.error("[NILA /api/chat/image]", err);
    const fallback: Record<SupportedLanguage, string> = {
      ta: "படம் பார்க்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
      hi: "छवि नहीं दिख रही। दोबारा कोशिश करें।",
      en: "Could not analyze the image. Please try again.",
      mixed: "Image analyze pannala. Try again!",
    };
    const lang = (req.headers.get("x-nila-lang") ?? "ta") as SupportedLanguage;
    return NextResponse.json({ ok: true, reply: fallback[lang] ?? fallback.en });
  }
}