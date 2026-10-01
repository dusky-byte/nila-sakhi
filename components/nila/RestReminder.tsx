"use client";

import type { SupportedLanguage } from "@/lib/nila/types";

interface RestReminderProps {
  language: SupportedLanguage;
  onAccept: () => void;
  onDismiss: () => void;
}

const REMINDER_MESSAGE: Record<SupportedLanguage, string> = {
  ta:    "நீங்கள் கொஞ்ச நேரமாக திரையை பார்த்துக்கொண்டிருக்கிறீர்கள்.",
  hi:    "आप काफी देर से स्क्रीन देख रहे हैं।",
  en:    "You've been looking at the screen for a while.",
  mixed: "You've been on the screen for a while.",
};

const ACTIVITY_SUGGESTION: Record<SupportedLanguage, string> = {
  ta:    "5 நிமிடம் கோலம் வரையலாமா? 🌸",
  hi:    "5 मिनट के लिए रंगोली बनाएं? 🌸",
  en:    "How about a 5-minute rangoli break? 🌸",
  mixed: "5-minute rangoli break? 🌸",
};

const ACCEPT_LABEL: Record<SupportedLanguage, string> = {
  ta:    "பார்க்கலாம் 🌸",
  hi:    "चलो देखते हैं 🌸",
  en:    "Let's try it 🌸",
  mixed: "Let's try it 🌸",
};

const DISMISS_LABEL: Record<SupportedLanguage, string> = {
  ta:    "இப்போது வேண்டாம்",
  hi:    "अभी नहीं",
  en:    "Not now",
  mixed: "Not now",
};

export function RestReminder({ language, onAccept, onDismiss }: RestReminderProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rest reminder"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-overlay"
    >
      <div className="card w-full max-w-sm px-6 py-6 slide-up flex flex-col gap-4 text-center">
        <span className="text-5xl" aria-hidden="true">🌸</span>

        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium text-text">
            {REMINDER_MESSAGE[language]}
          </p>
          <p className="text-xl font-semibold text-primary-600">
            {ACTIVITY_SUGGESTION[language]}
          </p>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <button
            id="nila-rest-accept"
            type="button"
            onClick={onAccept}
            className={[
              "w-full h-14 rounded-2xl",
              "bg-primary-500 text-white text-lg font-semibold",
              "hover:bg-primary-600 active:scale-[0.98]",
              "transition-all shadow-card",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50",
            ].join(" ")}
          >
            {ACCEPT_LABEL[language]}
          </button>
          <button
            id="nila-rest-dismiss"
            type="button"
            onClick={onDismiss}
            className="text-sm text-textMuted hover:text-text transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            {DISMISS_LABEL[language]}
          </button>
        </div>
      </div>
    </div>
  );
}
