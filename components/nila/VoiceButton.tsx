"use client";

import type { VoiceState } from "@/lib/nila/types";

interface VoiceButtonProps {
  state:    VoiceState;
  onPress:  () => void;
  disabled?: boolean;
}

const stateLabels: Record<VoiceState, string> = {
  idle:         "🎙️",
  listening:    "🎙️",
  processing:   "⏳",
  speaking:     "🔊",
  confirming:   "🎙️",
  error:        "🎙️",
};

const stateAriaLabels: Record<VoiceState, string> = {
  idle:         "Start speaking",
  listening:    "Listening — tap to stop",
  processing:   "Processing your voice",
  speaking:     "NILA is speaking",
  confirming:   "Start speaking",
  error:        "Try speaking again",
};

export function VoiceButton({ state, onPress, disabled }: VoiceButtonProps) {
  const isListening  = state === "listening";
  const isProcessing = state === "processing";
  const isSpeaking   = state === "speaking";

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Pulse rings — only while listening */}
      {isListening && (
        <>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-primary-500/25 mic-ring-1"
            style={{ width: 120, height: 120 }}
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute rounded-full bg-primary-500/15 mic-ring-2"
            style={{ width: 120, height: 120 }}
          />
        </>
      )}

      {/* Main button */}
      <button
        id="nila-mic-button"
        type="button"
        aria-label={stateAriaLabels[state]}
        disabled={disabled || isProcessing}
        onClick={onPress}
        className={[
          "relative z-10 flex items-center justify-center",
          "w-24 h-24 rounded-full",
          "text-4xl",
          "transition-all duration-200 ease-out",
          "focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50",
          isListening
            ? "bg-primary-500 scale-110 shadow-lg shadow-primary-500/40"
            : isProcessing || isSpeaking
            ? "bg-primary-100 scale-100 cursor-wait"
            : "bg-primary-500 hover:bg-primary-600 active:scale-95 shadow-card hover:shadow-lg",
        ].join(" ")}
      >
        {isProcessing ? (
          // Spinning dots
          <span className="flex gap-1.5" aria-hidden="true">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </span>
        ) : isSpeaking ? (
          // Wave bars
          <span className="flex items-center gap-1 h-8" aria-hidden="true">
            <span className="wave-bar h-3" />
            <span className="wave-bar h-6" />
            <span className="wave-bar h-8" />
            <span className="wave-bar h-6" />
            <span className="wave-bar h-4" />
          </span>
        ) : (
          <span aria-hidden="true">{stateLabels[state]}</span>
        )}
      </button>
    </div>
  );
}
