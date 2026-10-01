"use client";

import type { ApplicationData, SupportedLanguage } from "@/lib/nila/types";
import {
  SUMMARY_LABELS, COMPLETION_MESSAGES, COMPLETION_NEXT_STEP,
} from "@/lib/nila/script";

interface ApplicationSummaryProps {
  data:       ApplicationData;
  language:   SupportedLanguage;
  onConfirm:  () => void;
  onEdit:     (field: keyof ApplicationData) => void;
}

export function ApplicationSummary({ data, language, onConfirm, onEdit }: ApplicationSummaryProps) {
  const fields: (keyof ApplicationData)[] = ["name", "dob", "aadhaar", "mobile", "address"];

  const confirmLabels: Record<SupportedLanguage, string> = {
    ta: "ஆம், முடிக்கலாம் ✓",
    hi: "हाँ, पूरा करें ✓",
    en: "Yes, complete ✓",
    mixed: "Yes, complete ✓",
  };

  const editLabels: Record<SupportedLanguage, string> = {
    ta: "திருத்தவும்",
    hi: "सही करें",
    en: "Edit",
    mixed: "Edit",
  };

  const summaryTitle: Record<SupportedLanguage, string> = {
    ta: "உங்கள் தகவல்கள் சரியா?",
    hi: "क्या आपकी जानकारी सही है?",
    en: "Is your information correct?",
    mixed: "Is your information correct?",
  };

  return (
    <div className="flex flex-col gap-5 w-full animate-fade_in">
      <h2 className="text-2xl font-semibold text-text text-center">
        {summaryTitle[language]}
      </h2>

      <div className="card divide-y divide-border overflow-hidden">
        {fields.map(field => (
          data[field] ? (
            <div key={field} className="flex items-center justify-between px-5 py-4 gap-3">
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm text-textMuted font-medium">
                  {SUMMARY_LABELS[field][language]}
                </span>
                <span className="text-lg font-semibold text-text truncate">
                  {data[field]}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onEdit(field)}
                aria-label={`Edit ${SUMMARY_LABELS[field]["en"]}`}
                className="shrink-0 text-sm text-primary-600 hover:text-primary-700 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
              >
                {editLabels[language]}
              </button>
            </div>
          ) : null
        ))}
      </div>

      {/* Notice: this is a demo */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
        <p className="text-sm text-primary-700 leading-relaxed">
          ℹ️ {COMPLETION_NEXT_STEP[language]}
        </p>
      </div>

      <button
        id="nila-summary-confirm"
        type="button"
        onClick={onConfirm}
        className={[
          "w-full h-16 rounded-2xl",
          "bg-success-500 text-white text-xl font-semibold",
          "hover:bg-success-700 active:scale-[0.98]",
          "transition-all shadow-card",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success-500/50",
        ].join(" ")}
      >
        {confirmLabels[language]}
      </button>
    </div>
  );
}
