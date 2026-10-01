"use client";

interface NILAMessageProps {
  text:      string;
  isNew?:    boolean;
  onReplay?: () => void;
}

export function NILAMessage({ text, isNew = false, onReplay }: NILAMessageProps) {
  return (
    <div
      className={[
        "flex flex-col gap-3",
        isNew ? "animate-fade_in" : "",
      ].join(" ")}
    >
      {/* NILA badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-sm font-bold shadow-sm">
          N
        </span>
        <span className="text-sm font-medium text-primary-600">NILA</span>
      </div>

      {/* Message bubble */}
      <div className="card-warm px-5 py-4 max-w-prose">
        <p className="text-xl leading-relaxed text-text font-medium">
          {text}
        </p>
      </div>

      {/* Replay button */}
      {onReplay && (
        <button
          type="button"
          aria-label="Replay message"
          onClick={onReplay}
          className="self-start flex items-center gap-1.5 text-sm text-textMuted hover:text-primary-600 transition-colors px-2 py-1 rounded-lg hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <span aria-hidden="true">🔁</span>
          <span>மீண்டும் கேட்கலாம்</span>
        </button>
      )}
    </div>
  );
}

interface UserMessageProps {
  text: string;
}

export function UserMessage({ text }: UserMessageProps) {
  return (
    <div className="flex justify-end animate-fade_in">
      <div className="bg-primary-500 rounded-2xl rounded-br-sm px-5 py-3 max-w-xs">
        <p className="text-white text-base font-medium">{text}</p>
      </div>
    </div>
  );
}
