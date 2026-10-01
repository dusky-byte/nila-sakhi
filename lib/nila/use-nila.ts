"use client";

import { useState, useCallback, useRef } from "react";
import type {
  NILASession, AppStep, SupportedLanguage,
  VoiceState, ApplicationData, ConversationMessage, AIResponse,
} from "@/lib/nila/types";
import {
  nextStep, prevCollectStep, getQuestion, STEP_TO_FIELD,
  getConfirmQuestion, CORRECTION_PROMPTS, ERROR_PROMPTS,
  COMPLETION_MESSAGES,
} from "@/lib/nila/script";

// ── Helper ──────────────────────────────────────────────────────────────────

function makeSession(sessionId: string): NILASession {
  return {
    sessionId,
    step:            "COLLECT_NAME",
    language:        "ta", // default opening language
    voiceState:      "idle",
    applicationData: {},
    conversation:    [],
    currentQuestion: getQuestion("COLLECT_NAME", "ta"),
    errorCount:      0,
    simplifyLevel:   0,
  };
}

// ── Main hook ────────────────────────────────────────────────────────────────

export function useNILA() {
  const [session, setSession] = useState<NILASession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef<string>(crypto.randomUUID());

  // ── Initialise ─────────────────────────────────────────────────────────
  const init = useCallback(async () => {
    // Fire-and-forget session creation (non-blocking)
    fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language: "ta" }),
    }).then(r => r.json()).then(d => {
      if (d.sessionId) sessionIdRef.current = d.sessionId;
    }).catch(() => {/* non-fatal */});

    const s = makeSession(sessionIdRef.current);
    setSession(s);
    return s;
  }, []);

  // ── Add a message to the conversation log ──────────────────────────────
  const addMessage = useCallback((role: "nila" | "user", text: string, imageUrl?: string) => {
    setSession(prev => {
      if (!prev) return prev;
      const msg: ConversationMessage = { role, text, timestamp: Date.now(), imageUrl };
      return { ...prev, conversation: [...prev.conversation, msg] };
    });
  }, []);

  // ── Process user input (the main entry point) ──────────────────────────
  const processInput = useCallback(async (userText: string) => {
    if (!session || isLoading) return;

    setIsLoading(true);
    setSession(prev => prev ? { ...prev, voiceState: "processing" } : prev);
    addMessage("user", userText);

    try {
      const res = await fetch("/api/ai/understand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userText,
          currentStep:         session.step,
          language:            session.language,
          applicationData:     session.applicationData,
          simplifyLevel:       session.simplifyLevel,
          conversationHistory: session.conversation.slice(-8),
        }),
      });

      if (!res.ok) throw new Error("api_error");
      const data = await res.json();
      if (!data.ok) throw new Error("ai_error");

      const aiResp: AIResponse = data.result;
      applyAIResponse(aiResp, userText);
    } catch {
      setSession(prev => {
        if (!prev) return prev;
        const errCount = prev.errorCount + 1;
        const errMsg   = ERROR_PROMPTS[prev.language];
        return {
          ...prev,
          voiceState:    "idle",
          errorCount:    errCount,
          currentQuestion: errMsg,
        };
      });
      addMessage("nila", ERROR_PROMPTS[session.language]);
    } finally {
      setIsLoading(false);
    }
  }, [session, isLoading, addMessage]);

  // ── Apply the structured AI response to session state ─────────────────
  const applyAIResponse = useCallback((aiResp: AIResponse, _userText: string) => {
    setSession(prev => {
      if (!prev) return prev;

      const lang = aiResp.language ?? prev.language;
      let nextState: NILASession = {
        ...prev,
        language:     lang,
        voiceState:   "idle",
        simplifyLevel: 0,
        errorCount:   0,
      };

      switch (aiResp.action) {
        case "simplify": {
          const sl = Math.min(prev.simplifyLevel + 1, 2);
          const q  = getQuestion(prev.step, lang, sl);
          nextState = { ...nextState, simplifyLevel: sl, currentQuestion: q };
          addMessage("nila", aiResp.reply || q);
          break;
        }

        case "repeat": {
          const q = getQuestion(prev.step, lang, prev.simplifyLevel);
          nextState = { ...nextState, currentQuestion: q };
          addMessage("nila", aiResp.reply || q);
          break;
        }

        case "back": {
          const backStep = prevCollectStep(prev.step);
          const q = getQuestion(backStep, lang, 0);
          nextState = { ...nextState, step: backStep, currentQuestion: q, simplifyLevel: 0 };
          addMessage("nila", aiResp.reply || q);
          break;
        }

        case "confirm": {
          // AI extracted a value — move to the CONFIRM_ step
          const field = aiResp.field ?? STEP_TO_FIELD[prev.step];
          const value = aiResp.value;
          if (field && value) {
            const confirmStep = `CONFIRM_${field.toUpperCase()}` as AppStep;
            const q = getConfirmQuestion(field, value, lang);
            nextState = {
              ...nextState,
              step:                confirmStep,
              pendingConfirmField: field,
              pendingConfirmValue: value,
              currentQuestion:     q,
              voiceState:          "confirming",
            };
            addMessage("nila", aiResp.reply || q);
          } else {
            // No value extracted — re-ask
            const q = getQuestion(prev.step, lang, prev.simplifyLevel);
            nextState = { ...nextState, currentQuestion: q };
            addMessage("nila", aiResp.reply || q);
          }
          break;
        }

        case "ask": {
          // Move to next COLLECT_ step with AI reply
          const ns = nextStep(prev.step);
          const q  = getQuestion(ns, lang, 0);
          nextState = { ...nextState, step: ns, currentQuestion: aiResp.reply || q };
          addMessage("nila", aiResp.reply || q);
          break;
        }

        case "complete": {
          nextState = { ...nextState, step: "SUMMARY", currentQuestion: COMPLETION_MESSAGES[lang] };
          addMessage("nila", COMPLETION_MESSAGES[lang]);
          // Persist application
          fetch("/api/application", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: prev.sessionId,
              data:      prev.applicationData,
              language:  lang,
            }),
          }).catch(() => {});
          break;
        }

        default: {
          // Generic ask
          const q = aiResp.reply || getQuestion(prev.step, lang, prev.simplifyLevel);
          nextState = { ...nextState, currentQuestion: q };
          addMessage("nila", q);
        }
      }

      return nextState;
    });
  }, [addMessage]);

  // ── Confirm (yes/no) ──────────────────────────────────────────────────
  const confirm = useCallback((yes: boolean) => {
    setSession(prev => {
      if (!prev || !prev.pendingConfirmField || !prev.pendingConfirmValue) return prev;
      const lang = prev.language;

      if (!yes) {
        // User said no — go back to the COLLECT_ step
        const collectStep = `COLLECT_${prev.pendingConfirmField.toUpperCase()}` as AppStep;
        const q = CORRECTION_PROMPTS[lang];
        addMessage("nila", q);
        return {
          ...prev,
          step:                collectStep,
          currentQuestion:     q,
          pendingConfirmField: undefined,
          pendingConfirmValue: undefined,
          voiceState:          "idle",
        };
      }

      // User confirmed — save the field and advance
      const newData: ApplicationData = {
        ...prev.applicationData,
        [prev.pendingConfirmField]: prev.pendingConfirmValue,
      };

      const nextSt = nextStep(prev.step);
      const isFinalCollect = nextSt === "CONFIRM_ALL" || nextSt === "SUMMARY";
      const q = getQuestion(nextSt, lang, 0);
      addMessage("nila", q);

      const updatedSession: NILASession = {
        ...prev,
        applicationData:     newData,
        step:                nextSt,
        currentQuestion:     q,
        pendingConfirmField: undefined,
        pendingConfirmValue: undefined,
        voiceState:          "idle",
        simplifyLevel:       0,
      };

      // If all fields done, also fire application save
      if (isFinalCollect) {
        fetch("/api/application", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: prev.sessionId,
            data:      newData,
            language:  lang,
          }),
        }).catch(() => {});
      }

      return updatedSession;
    });
  }, [addMessage]);

  // ── Simplify on demand ─────────────────────────────────────────────────
  const simplify = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      const sl = Math.min(prev.simplifyLevel + 1, 2);
      const q  = getQuestion(prev.step, prev.language, sl);
      addMessage("nila", q);
      return { ...prev, simplifyLevel: sl, currentQuestion: q };
    });
  }, [addMessage]);

  // ── Repeat current question ────────────────────────────────────────────
  const repeat = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      addMessage("nila", prev.currentQuestion);
      return { ...prev };
    });
  }, [addMessage]);

  // ── Apply extracted data from vision API ──────────────────────────────
  const applyExtractedData = useCallback((extracted: Partial<ApplicationData>) => {
    setSession(prev => {
      if (!prev) return prev;
      // Merge data
      const newData = { ...prev.applicationData };
      if (extracted.name) newData.name = extracted.name;
      if (extracted.dob) newData.dob = extracted.dob;
      if (extracted.aadhaar) newData.aadhaar = extracted.aadhaar;
      
      // Determine the next step that is missing
      let nextStepStr: AppStep = prev.step;
      if (!newData.name) nextStepStr = "COLLECT_NAME";
      else if (!newData.dob) nextStepStr = "COLLECT_DOB";
      else if (!newData.address) nextStepStr = "COLLECT_ADDRESS";
      else if (!newData.mobile) nextStepStr = "COLLECT_MOBILE";
      else nextStepStr = "CONFIRM_ALL";

      const q = getQuestion(nextStepStr, prev.language, 0);
      // Wait a moment before asking the next question to let the natural reply play
      setTimeout(() => {
          addMessage("nila", q);
      }, 1500);

      return {
        ...prev,
        applicationData: newData,
        step: nextStepStr,
        currentQuestion: q,
        voiceState: "idle"
      };
    });
  }, [addMessage]);

  // ── Mark completion ────────────────────────────────────────────────────
  const markComplete = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      return { ...prev, step: "COMPLETE", voiceState: "idle" };
    });
  }, []);

  // ── Set voice state directly (from speech hook) ────────────────────────
  const setVoiceState = useCallback((vs: VoiceState) => {
    setSession(prev => prev ? { ...prev, voiceState: vs } : prev);
  }, []);

  return {
    session,
    isLoading,
    init,
    processInput,
    confirm,
    simplify,
    repeat,
    markComplete,
    setVoiceState,
    addMessage,
    applyExtractedData,
  };
}
