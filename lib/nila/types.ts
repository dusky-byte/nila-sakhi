// ── NILA Core Types ──────────────────────────────────────────────────────────
// All application logic is deterministic. The LLM only provides structured
// extraction; it does NOT control state transitions.

// ── Application State Machine ──────────────────────────────────────────────
export type AppStep =
  | "WELCOME"
  | "IDENTIFY_INTENT"
  | "COLLECT_NAME"
  | "CONFIRM_NAME"
  | "COLLECT_DOB"
  | "CONFIRM_DOB"
  | "COLLECT_AADHAAR"
  | "CONFIRM_AADHAAR"
  | "COLLECT_MOBILE"
  | "CONFIRM_MOBILE"
  | "COLLECT_ADDRESS"
  | "CONFIRM_ADDRESS"
  | "CONFIRM_ALL"
  | "SUMMARY"
  | "COMPLETE";

// ── Supported Languages ────────────────────────────────────────────────────
export type SupportedLanguage = "ta" | "hi" | "en" | "mixed";

// ── Voice States ───────────────────────────────────────────────────────────
export type VoiceState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "confirming"
  | "error";

// ── Collected application data ─────────────────────────────────────────────
export interface ApplicationData {
  name?: string;
  dob?: string;
  aadhaar?: string;
  mobile?: string;
  address?: string;
}

// ── Conversation message ────────────────────────────────────────────────────
export interface ConversationMessage {
  role: "nila" | "user";
  text: string;
  timestamp: number;
  imageUrl?: string;
  mapCoordinates?: { lat: number; lng: number; title: string };
}

// ── Full session state ─────────────────────────────────────────────────────
export interface NILASession {
  sessionId: string;
  step: AppStep;
  language: SupportedLanguage;
  voiceState: VoiceState;
  applicationData: ApplicationData;
  conversation: ConversationMessage[];
  currentQuestion: string;         // displayed prominently
  pendingConfirmField?: keyof ApplicationData;
  pendingConfirmValue?: string;
  errorCount: number;
  simplifyLevel: number;           // 0 = normal, 1 = simpler, 2 = simplest
}

// ── AI Provider Contract ────────────────────────────────────────────────────
export interface AIInput {
  userText: string;
  currentStep: AppStep;
  language: SupportedLanguage;
  applicationData: ApplicationData;
  simplifyLevel: number;
  conversationHistory: ConversationMessage[];
}

export interface AIResponse {
  language: SupportedLanguage;
  intent: string;
  reply: string;
  field?: keyof ApplicationData;
  value?: string;
  confidence?: number;
  action: "ask" | "confirm" | "repeat" | "simplify" | "complete" | "correct" | "back";
}

export interface AIProvider {
  understand(input: AIInput): Promise<AIResponse>;
}

// ── API request/response types ──────────────────────────────────────────────
export interface UnderstandRequest {
  userText: string;
  currentStep: AppStep;
  language: SupportedLanguage;
  applicationData: ApplicationData;
  simplifyLevel: number;
  conversationHistory: ConversationMessage[];
}

export interface UnderstandResponse {
  ok: true;
  result: AIResponse;
}

export interface SessionCreateRequest {
  language?: SupportedLanguage;
}

export interface SessionCreateResponse {
  sessionId: string;
}

export interface ApplicationSaveRequest {
  sessionId: string;
  data: ApplicationData;
  language: SupportedLanguage;
}

// ── Screen-time config (read from env server-side) ─────────────────────────
export interface ScreenTimeConfig {
  reminderMinutes: number;
  demoMode: boolean;
  demoMinutes: number;
}
