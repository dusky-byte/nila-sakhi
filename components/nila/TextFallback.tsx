"use client";

import { useState } from "react";
import type { SupportedLanguage } from "@/lib/nila/types";
import {
  REPEAT_LABEL, SIMPLIFY_LABEL, TYPE_INSTEAD_LABEL,
} from "@/lib/nila/script";

interface TextFallbackProps {
  language:       SupportedLanguage;
  onSubmit:       (text: string) => void;
  onRepeat:       () => void;
  onSimplify:     () => void;
  showTypeInput:  boolean;
  onToggleType:   () => void;
  disabled?:      boolean;
}

export function TextFallback({
  language, onSubmit, onRepeat, onSimplify,
  showTypeInput, onToggleType, disabled,
}: TextFallbackProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text.trim());
    setText("");
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Helper action buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          id="nila-repeat-btn"
          type="button"
          onClick={onRepeat}
          disabled={disabled}
          aria-label="Repeat the question"
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50"
        >
          🔁 {REPEAT_LABEL[language]}
        </button>
        <button
          id="nila-simplify-btn"
          type="button"
          onClick={onSimplify}
          disabled={disabled}
          aria-label="Ask NILA to explain more simply"
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50"
        >
          💡 {SIMPLIFY_LABEL[language]}
        </button>
        <button
          id="nila-type-toggle-btn"
          type="button"
          onClick={onToggleType}
          disabled={disabled}
          aria-label="Type your response instead of speaking"
          className="px-4 py-2.5 rounded-xl text-sm font-medium text-textMuted bg-surface hover:bg-surfaceWarm border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:opacity-50"
        >
          ⌨️ {TYPE_INSTEAD_LABEL[language]}
        </button>
      </div>

      {/* Text input area */}
      {showTypeInput && (
        <form onSubmit={handleSubmit} className="flex gap-2 animate-fade_in mt-1">
          <input
            id="nila-text-input"
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            disabled={disabled}
            autoComplete="off"
            inputMode="text"
            placeholder="..."
            aria-label="Type your response"
            className={[
              "flex-1 rounded-xl border-2 border-border px-4 py-3",
              "text-lg text-text bg-surface",
              "placeholder:text-textLight",
              "focus:border-primary-400 focus:outline-none",
              "transition-colors",
              "disabled:opacity-50",
            ].join(" ")}
          />
          <button
            type="submit"
            disabled={disabled || !text.trim()}
            aria-label="Send"
            className={[
              "h-14 w-14 flex items-center justify-center",
              "rounded-xl bg-primary-500 text-white text-2xl",
              "hover:bg-primary-600 active:scale-95",
              "transition-all shadow-card",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50",
            ].join(" ")}
          >
            ↑
          </button>
        </form>
      )}
    </div>
  );
}
