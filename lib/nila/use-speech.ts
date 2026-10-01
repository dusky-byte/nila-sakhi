"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import type { SupportedLanguage } from "@/lib/nila/types";

// ── Browser Speech API types (not in all TS libs) ──────────────────────────

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror:  ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend:    (() => void) | null;
};

function getSpeechRecognition(): (new () => SpeechRecognitionType) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
}

function getTTSSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// Language code → BCP-47 locale for STT
function toLangCode(lang: SupportedLanguage): string {
  switch (lang) {
    case "ta":    return "ta-IN";
    case "hi":    return "hi-IN";
    case "mixed": return "ta-IN"; // best guess
    default:      return "en-IN";
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────

interface UseSpeechOptions {
  language: SupportedLanguage;
  onResult: (text: string) => void;
  onStateChange: (listening: boolean) => void;
}

export function useSpeech({ language, onResult, onStateChange }: UseSpeechOptions) {
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  const [isListening, setIsListening]   = useState(false);
  const [isSupported, setIsSupported]   = useState(false);
  const [isTTSReady,  setIsTTSReady]    = useState(false);
  const synth   = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]); // cached voice list

  // Always keep a ref to the latest language so callbacks never read stale closures
  const langRef = useRef(language);
  useEffect(() => { langRef.current = language; }, [language]);

  useEffect(() => {
    setIsSupported(!!getSpeechRecognition());
    if (!getTTSSupported()) return;

    const s = window.speechSynthesis;
    synth.current = s;

    // Voices load asynchronously — populate cache once ready
    function cacheVoices() {
      voicesRef.current = s.getVoices();
    }
    cacheVoices(); // may already be ready on some browsers
    s.addEventListener("voiceschanged", cacheVoices);
    setIsTTSReady(true);

    return () => s.removeEventListener("voiceschanged", cacheVoices);
  }, []);

  const startListening = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;

    // Stop any ongoing utterance
    synth.current?.cancel();

    const recognition = new SR();
    recognition.continuous    = false;
    recognition.interimResults = false;
    // Always use the CURRENT language from ref — never the stale closure value
    recognition.lang          = toLangCode(langRef.current);

    recognition.onresult = (e) => {
      const text = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(" ")
        .trim();
      if (text) onResult(text);
    };

    recognition.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        console.warn("[NILA STT error]", e.error);
      }
      setIsListening(false);
      onStateChange(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      onStateChange(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
      onStateChange(true);
    } catch {
      setIsListening(false);
      onStateChange(false);
    }
  }, [onResult, onStateChange]); // ← language intentionally omitted; read from ref instead

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    onStateChange(false);
  }, [onStateChange]);

  const speak = useCallback((text: string, lang: SupportedLanguage, onEnd?: () => void) => {
    if (!synth.current) { onEnd?.(); return; }
    synth.current.cancel();
    if (!text) { onEnd?.(); return; }

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLocale = toLangCode(lang); // e.g. "ta-IN"
    utterance.lang  = targetLocale;
    utterance.rate  = 0.9;
    utterance.pitch = 1.0;

    // Pick the best voice from the cached list
    // Prefer exact locale match first, then language prefix match
    const voices = voicesRef.current.length > 0
      ? voicesRef.current
      : (synth.current.getVoices()); // last-resort fallback

    const targetNorm = targetLocale.toLowerCase();
    const targetPrefix = targetNorm.split("-")[0];

    const exactMatch  = voices.find(v => v.lang.toLowerCase().replace("_", "-") === targetNorm);
    const prefixMatch = voices.find(v => v.lang.toLowerCase().startsWith(targetPrefix));
    const chosen = exactMatch ?? prefixMatch ?? null;
    if (chosen) utterance.voice = chosen;

    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onEnd?.(); // don't hang if TTS fails
    synth.current.speak(utterance);
  }, []);

  const cancelSpeech = useCallback(() => {
    synth.current?.cancel();
  }, []);

  return { isListening, isSupported, isTTSReady, startListening, stopListening, speak, cancelSpeech };
}

// ── Screen-time hook ─────────────────────────────────────────────────────────

interface UseScreenTimeOptions {
  onReminder: () => void;
}

export function useScreenTime({ onReminder }: UseScreenTimeOptions) {
  const startRef       = useRef<number>(Date.now());
  const activeRef      = useRef<number>(0);
  const intervalRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const thresholdRef   = useRef<number>(60 * 60 * 1000); // 60 min default
  const firedRef       = useRef(false);
  const [configLoaded, setConfigLoaded] = useState(false);

  useEffect(() => {
    // Fetch config from server
    fetch("/api/screen-time-config")
      .then(r => r.json())
      .then(c => {
        const minutes = c.demoMode ? c.demoMinutes : c.reminderMinutes;
        thresholdRef.current = minutes * 60 * 1000;
        setConfigLoaded(true);
      })
      .catch(() => setConfigLoaded(true));
  }, []);

  useEffect(() => {
    if (!configLoaded) return;
    startRef.current = Date.now();

    const tick = () => {
      if (firedRef.current) return;
      if (document.hidden) return; // page not visible — don't count
      activeRef.current += 5000;
      if (activeRef.current >= thresholdRef.current) {
        firedRef.current = true;
        onReminder();
      }
    };

    intervalRef.current = setInterval(tick, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [configLoaded, onReminder]);

  const resetTimer = useCallback(() => {
    firedRef.current  = false;
    activeRef.current = 0;
  }, []);

  return { resetTimer };
}
