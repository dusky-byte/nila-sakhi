"use client";

import { useRef, useEffect, useState, useCallback } from "react";

// Simple dot-grid rangoli canvas — no gamification, no scoring
const GRID = 7; // 7×7 dot grid
const DOT_SIZE = 28;
const GAP = 10;
const CANVAS_SIZE = GRID * (DOT_SIZE + GAP) - GAP;

interface RangoliActivityProps {
  onClose: () => void;
  language?: string;
}

const CLOSE_LABEL: Record<string, string> = {
  ta: "மூடவும்",
  hi: "बंद करें",
  en: "Close",
};

const TITLE_LABEL: Record<string, string> = {
  ta: "கோலம் வரையுங்கள்",
  hi: "रंगोली बनाएं",
  en: "Draw a rangoli",
};

const COLORS = ["#E8811A", "#F89D42", "#22C55E", "#A855F7", "#EF4444", "#3B82F6", "#F59E0B"];

export function RangoliActivity({ onClose, language = "ta" }: RangoliActivityProps) {
  const [activeDots, setActiveDots] = useState<Set<number>>(new Set());
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [dotColors, setDotColors] = useState<Record<number, string>>({});
  const isPointerDown = useRef(false);

  function dotIndex(row: number, col: number) {
    return row * GRID + col;
  }

  function activateDot(row: number, col: number) {
    const idx = dotIndex(row, col);
    setActiveDots(prev => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
    setDotColors(prev => ({ ...prev, [idx]: selectedColor }));
  }

  function clearAll() {
    setActiveDots(new Set());
    setDotColors({});
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rangoli activity"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay"
    >
      <div className="card w-full max-w-sm px-5 py-5 slide-up flex flex-col gap-4 items-center">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <h2 className="text-lg font-semibold text-text">
            🌸 {TITLE_LABEL[language] ?? TITLE_LABEL.en}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close rangoli activity"
            className="text-textMuted hover:text-text text-xl px-2 py-1 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            ✕
          </button>
        </div>

        {/* Colour picker */}
        <div className="flex gap-2" role="group" aria-label="Colour selection">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              aria-label={`Select colour ${c}`}
              aria-pressed={selectedColor === c}
              onClick={() => setSelectedColor(c)}
              className={[
                "w-7 h-7 rounded-full transition-all",
                selectedColor === c
                  ? "scale-125 ring-2 ring-offset-2 ring-primary-500"
                  : "hover:scale-110",
              ].join(" ")}
              style={{ background: c }}
            />
          ))}
        </div>

        {/* Dot grid */}
        <div
          className="touch-none select-none"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID}, ${DOT_SIZE}px)`,
            gap: `${GAP}px`,
          }}
          onPointerDown={() => { isPointerDown.current = true; }}
          onPointerUp={() => { isPointerDown.current = false; }}
          onPointerLeave={() => { isPointerDown.current = false; }}
        >
          {Array.from({ length: GRID }).map((_, row) =>
            Array.from({ length: GRID }).map((_, col) => {
              const idx = dotIndex(row, col);
              const isActive = activeDots.has(idx);
              return (
                <button
                  key={idx}
                  type="button"
                  aria-label={`Dot ${row + 1}-${col + 1}`}
                  onPointerEnter={() => { if (isPointerDown.current) activateDot(row, col); }}
                  onPointerDown={() => activateDot(row, col)}
                  className={[
                    "rounded-full border-2 transition-all duration-100",
                    isActive ? "scale-110" : "hover:scale-125 border-border bg-surfaceWarm",
                  ].join(" ")}
                  style={{
                    width: DOT_SIZE,
                    height: DOT_SIZE,
                    background: isActive ? dotColors[idx] : undefined,
                    borderColor: isActive ? dotColors[idx] : undefined,
                  }}
                />
              );
            })
          )}
        </div>

        {/* Clear button */}
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-textMuted hover:text-error-500 transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
        >
          🗑 {language === "ta" ? "அழிக்கவும்" : language === "hi" ? "मिटाएं" : "Clear"}
        </button>
      </div>
    </div>
  );
}
