"use client";

import type { SupportedLanguage } from "@/lib/nila/types";
import { YES_LABEL, NO_LABEL } from "@/lib/nila/script";

interface ConfirmationButtonsProps {
  language:   SupportedLanguage;
  onYes:      () => void;
  onNo:       () => void;
  disabled?:  boolean;
}

export function ConfirmationButtons({ language, onYes, onNo, disabled }: ConfirmationButtonsProps) {
  return (
    <div className="flex gap-4 mt-2 animate-fade_in" role="group" aria-label="Confirmation">
      <button
        id="nila-confirm-yes"
        type="button"
        disabled={disabled}
        onClick={onYes}
        className={[
          "flex-1 h-16 rounded-2xl text-xl font-semibold",
          "bg-success-500 text-white",
          "hover:bg-success-700 active:scale-95",
          "transition-all duration-150 shadow-card",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success-500/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        {YES_LABEL[language]}
      </button>

      <button
        id="nila-confirm-no"
        type="button"
        disabled={disabled}
        onClick={onNo}
        className={[
          "flex-1 h-16 rounded-2xl text-xl font-semibold",
          "bg-surface text-text border-2 border-border",
          "hover:border-primary-400 hover:text-primary-600 active:scale-95",
          "transition-all duration-150 shadow-card",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        ].join(" ")}
      >
        {NO_LABEL[language]}
      </button>
    </div>
  );
}
