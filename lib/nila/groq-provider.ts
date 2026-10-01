import "server-only";
import Groq from "groq-sdk";
import { z } from "zod";
import type { AIProvider, AIInput, AIResponse, SupportedLanguage } from "./types";

// ── Groq AI Provider with HuggingFace fallback ──────────────────────────────

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

// ── HuggingFace fallback ──────────────────────────────────────────────────────
// Inference Providers router (OpenAI-compatible). The old api-inference.huggingface.co
// text-generation endpoint is retired. Token needs the "Make calls to Inference Providers" permission.
const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

function extractJson(raw: string): unknown | null {
  const cleaned = raw.replace(/^```(json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]); } catch { return null; }
}

async function callHuggingFace(context: object): Promise<AIResponse | null> {
  const hfKey = process.env.HF_API_KEY;
  if (!hfKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${hfKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.HF_MODEL || "meta-llama/Llama-3.1-8B-Instruct",
        temperature: 0.2,
        max_tokens: 400,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(context) },
        ],
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      console.error(`[NILA HF fallback] HTTP ${res.status}:`, await res.text());
      return null;
    }

    const data = await res.json();
    const json = extractJson(data?.choices?.[0]?.message?.content ?? "");
    const parsed = AIResponseSchema.safeParse(json);
    if (parsed.success) return parsed.data;
    console.error("[NILA HF fallback] Schema mismatch:", parsed.error?.issues);
    return null;
  } catch (e) {
    console.error("[NILA HF fallback] Exception:", e);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Groq provider ─────────────────────────────────────────────────────────────
async function callGroq(model: string, context: object): Promise<AIResponse | null> {
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

      const parsed = AIResponseSchema.safeParse(extractJson(res.choices[0]?.message?.content ?? ""));
      if (parsed.success) return parsed.data;
      console.error("[NILA Groq] Schema mismatch:", parsed.error?.issues);
    } catch (e) {
      console.error(`[NILA Groq] Attempt ${attempt + 1} failed:`, e);
      if (attempt === 1) break;
    }
  }
  return null;
}

export class GroqProvider implements AIProvider {
  async understand(input: AIInput): Promise<AIResponse> {
    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

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

    // Try Groq first
    const groqResult = await callGroq(model, context);
    if (groqResult) return groqResult;

    // HuggingFace as fallback
    console.warn("[NILA] Groq failed, trying HuggingFace fallback...");
    const hfResult = await callHuggingFace(context);
    if (hfResult) return hfResult;

    // Safe fallback — never expose error to UI
    return {
      language: input.language,
      intent: "unknown",
      reply: getRetryMessage(input.language),
      action: "ask",
    };
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