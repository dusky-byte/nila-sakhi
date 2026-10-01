import "server-only";
import Groq from "groq-sdk";
import { z } from "zod";
import type { AIProvider, AIInput, AIResponse, SupportedLanguage } from "./types";

// ── Groq AI Provider ────────────────────────────────────────────────────────

const AIResponseSchema = z.object({
  language: z.enum(["ta", "hi", "en", "mixed"]),
  intent: z.string(),
  reply: z.string(),
  field: z.enum(["name", "dob", "aadhaar", "mobile", "address"]).optional(),
  value: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  action: z.enum(["ask", "confirm", "repeat", "simplify", "complete", "correct", "back"]),
});

let _groqClient: Groq | null = null;
function groqClient(): Groq {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured.");
  return (_groqClient ??= new Groq({ apiKey: process.env.GROQ_API_KEY }));
}

const SYSTEM_PROMPT = `You are NILA, a warm and patient voice assistant that helps first-time digital users in India apply for the PM Ujjwala Yojana (free gas cylinder scheme).

CRITICAL RULES:
1. Respond ONLY in JSON matching the schema below. No text outside JSON.
2. Detect the user's language (ta=Tamil, hi=Hindi, en=English, mixed=Tanglish/Hinglish) from their input.
3. Your "reply" must be in the SAME language as the user's input. If Tamil input → Tamil reply. If Hindi → Hindi. If code-switched → mirror their style naturally.
4. NEVER say "Tamil detected" or mention the language detection.
5. NEVER expose technical errors, API details, or form concepts.
6. When the user says they don't understand ("என்ன?", "kya?", "samjha nahi", "puriyala") set action to "simplify".
7. When the user says "again" or "repeat" set action to "repeat".
8. When the user asks to go back, set action to "back".
9. Extract the "value" from natural speech — do not ask for formatted input.
10. Keep replies SHORT, warm, and conversational. No bullet points. No lists. One idea per reply.
11. You are NOT allowed to decide what question to ask next — that is controlled by the application. Your job is ONLY to understand intent and extract data.

JSON Schema:
{
  "language": "ta" | "hi" | "en" | "mixed",
  "intent": string (brief description),
  "reply": string (your response in the user's language),
  "field": "name"|"dob"|"aadhaar"|"mobile"|"address" | undefined,
  "value": string (extracted value from speech) | undefined,
  "confidence": 0.0-1.0,
  "action": "ask"|"confirm"|"repeat"|"simplify"|"complete"|"correct"|"back"
}`;

export class GroqProvider implements AIProvider {
  async understand(input: AIInput): Promise<AIResponse> {
    const model = "openai/gpt-oss-120b"; // Hardcoded to bypass invalid env var

    const historyText = input.conversationHistory
      .slice(-6)
      .map(m => `${m.role === "nila" ? "NILA" : "USER"}: ${m.text}`)
      .join("\n");

    const context = {
      currentStep: input.currentStep,
      language: input.language,
      applicationData: input.applicationData,
      simplifyLevel: input.simplifyLevel,
      recentHistory: historyText,
      userInput: input.userText,
    };

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await groqClient().chat.completions.create({
          model,
          temperature: 0.2,
          max_tokens: 600,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: JSON.stringify(context) },
          ],
        });

        const raw = res.choices[0]?.message?.content ?? "{}";
        const parsed = AIResponseSchema.safeParse(JSON.parse(raw));
        if (parsed.success) return parsed.data;
      } catch (e) {
        if (attempt === 1) throw e;
      }
    }

    // Safe fallback — never expose error to UI
    const fallback: AIResponse = {
      language: input.language,
      intent: "unknown",
      reply: getRetryMessage(input.language),
      action: "ask",
    };
    return fallback;
  }
}

function getRetryMessage(lang: SupportedLanguage): string {
  const msgs: Record<SupportedLanguage, string> = {
    ta: "மன்னிக்கவும். மீண்டும் முயற்சி செய்யலாமா?",
    hi: "माफ़ करें। क्या हम दोबारा कोशिश करें?",
    en: "Sorry about that. Shall we try again?",
    mixed: "Sorry! Shall we try again?",
  };
  return msgs[lang];
}
