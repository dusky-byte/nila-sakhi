import "server-only";
import Groq from "groq-sdk";
import { z } from "zod";

export class AIError extends Error {
  constructor(public kind: "config" | "rate_limit" | "network" | "malformed", message: string) { super(message); }
}

let client: Groq | null = null;
function groq() {
  if (!process.env.GROQ_API_KEY) throw new AIError("config", "GROQ_API_KEY is not set on the server.");
  return (client ??= new Groq({ apiKey: process.env.GROQ_API_KEY }));
}

/** Focused call: short system prompt + compact JSON context → Zod-validated output. */
export async function aiJson<T extends z.ZodTypeAny>(opts: {
  system: string; context: unknown; schema: T; maxTokens?: number;
}): Promise<z.infer<T>> {
  const sys = `${opts.system}\nUse only the supplied data. Never invent achievements, experience, metrics or skills. State uncertainty explicitly. Reply with JSON only.`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await groq().chat.completions.create({
        model: process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: opts.maxTokens ?? 1200,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: sys }, { role: "user", content: JSON.stringify(opts.context) }],
      });
      const parsed = opts.schema.safeParse(JSON.parse(res.choices[0]?.message?.content ?? "{}"));
      if (parsed.success) return parsed.data;
    } catch (e) {
      if (e instanceof AIError) throw e;
      if ((e as { status?: number }).status === 429) throw new AIError("rate_limit", "Rate limit reached. Wait a moment and retry.");
      if (!(e instanceof SyntaxError)) throw new AIError("network", "Could not reach the AI service. Check your connection and retry.");
    }
  }
  throw new AIError("malformed", "The AI returned an unusable response. Try again.");
}
