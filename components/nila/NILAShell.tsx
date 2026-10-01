"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, BellRing, LayoutGrid, X, Send, CheckCircle2, ChevronRight } from "lucide-react";
import { useNILA } from "@/lib/nila/use-nila";
import { useSpeech, useScreenTime } from "@/lib/nila/use-speech";
import { RestReminder } from "./RestReminder";
import { RangoliActivity } from "./RangoliActivity";
import { ApplicationSummary } from "./ApplicationSummary";
import { CompletionView } from "./CompletionView";

// ── Government Schemes Data ──────────────────────────────────────────────────

const SCHEMES = [
  {
    id: 1,
    title: "PM Ujjwala Yojana",
    title_ta: "பி.எம். உஜ்வாலா யோஜனா",
    desc: "Free LPG gas connection for women below poverty line.",
    desc_ta: "ஏழைப் பெண்களுக்கு இலவச எரிவாயு இணைப்பு.",
    category: "Health & Kitchen",
    regions: ["all"],
    icon: "🔥",
  },
  {
    id: 2,
    title: "Sukanya Samriddhi Yojana",
    title_ta: "சுகன்யா சம்ருத்தி யோஜனா",
    desc: "Savings scheme for the girl child with high interest.",
    desc_ta: "பெண் குழந்தைகளுக்கான சேமிப்பு திட்டம்.",
    category: "Finance",
    regions: ["all"],
    icon: "💰",
  },
  {
    id: 3,
    title: "Maternity Benefit Act",
    title_ta: "மகப்பேறு நலத் திட்டம்",
    desc: "26 weeks paid maternity leave for working women.",
    desc_ta: "பணிபுரியும் பெண்களுக்கு 26 வார சம்பளத்துடன் மகப்பேறு விடுப்பு.",
    category: "Employment",
    regions: ["all"],
    icon: "👶",
  },
  {
    id: 4,
    title: "Tamilnadu Magalir Urimai Thittam",
    title_ta: "மகளிர் உரிமைத் திட்டம்",
    desc: "Monthly financial assistance of ₹1000 for women heads of household in Tamil Nadu.",
    desc_ta: "தமிழ்நாட்டில் குடும்பத் தலைவிகளுக்கு மாதம் ₹1000 நிதியுதவி.",
    category: "Finance",
    regions: ["tamil nadu", "chennai", "coimbatore", "madurai", "trichy", "salem"],
    icon: "💜",
  },
  {
    id: 5,
    title: "Beti Bachao Beti Padhao",
    title_ta: "பெண் காப்போம் பெண் படிப்போம்",
    desc: "Scheme to promote welfare and education of girl children.",
    desc_ta: "பெண் குழந்தைகளின் நலன் மற்றும் கல்வியை மேம்படுத்தும் திட்டம்.",
    category: "Education",
    regions: ["all"],
    icon: "📚",
  },
  {
    id: 6,
    title: "PM Awas Yojana (Women Priority)",
    title_ta: "பி.எம். ஆவாஸ் யோஜனா",
    desc: "Housing scheme giving priority ownership to women.",
    desc_ta: "பெண்களுக்கு முன்னுரிமை அளிக்கும் வீட்டு உதவித் திட்டம்.",
    category: "Housing",
    regions: ["all"],
    icon: "🏠",
  },
  {
    id: 7,
    title: "Tamilnadu Kalaignar Magalir Urimai",
    title_ta: "கலைஞர் மகளிர் உரிமை",
    desc: "Additional support and skill development for women in Tamil Nadu.",
    desc_ta: "தமிழ்நாட்டு பெண்களுக்கு திறன் மேம்பாடு மற்றும் உதவி.",
    category: "Skills",
    regions: ["tamil nadu", "chennai", "coimbatore", "madurai", "trichy"],
    icon: "✨",
  },
  {
    id: 8,
    title: "National Women's Helpline 181",
    title_ta: "தேசிய மகளிர் உதவி எண் 181",
    desc: "24x7 helpline for women in distress across India.",
    desc_ta: "இந்தியா முழுவதும் துன்பத்தில் உள்ள பெண்களுக்கு 24x7 உதவி.",
    category: "Safety",
    regions: ["all"],
    icon: "📞",
  },
];

const ALERTS = [
  {
    id: 1,
    title: "New: Tamil Nadu Kalaignar Scheme Extended",
    title_ta: "புதிது: கலைஞர் திட்டம் நீட்டிக்கப்பட்டது",
    body: "The Kalaignar Magalir Urimai scheme registration is now open until December 2026.",
    body_ta: "கலைஞர் மகளிர் உரிமைத் திட்ட பதிவு டிசம்பர் 2026 வரை நீட்டிக்கப்பட்டது.",
    date: "Oct 1, 2026",
    tag: "New",
    tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 2,
    title: "PM Ujjwala Yojana Phase 3 Launched",
    title_ta: "PM உஜ்வாலா யோஜனா நிலை 3 தொடங்கியது",
    body: "Government launches Phase 3 targeting 75 lakh new beneficiaries across rural areas.",
    body_ta: "கிராமப்புற பகுதிகளில் 75 லட்சம் புதிய பயனாளிகளை இலக்காகக் கொண்டு நிலை 3 தொடங்கியது.",
    date: "Sep 28, 2026",
    tag: "Update",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 3,
    title: "Free Legal Aid for Women — Apply Now",
    title_ta: "பெண்களுக்கு இலவச சட்ட உதவி",
    body: "District Legal Services Authority is offering free legal aid to women in need.",
    body_ta: "மாவட்ட சட்ட சேவைகள் அமைப்பு தேவையுள்ள பெண்களுக்கு இலவச சட்ட உதவி வழங்குகிறது.",
    date: "Sep 25, 2026",
    tag: "Alert",
    tagColor: "bg-orange-100 text-orange-700",
  },
];

// ── Registration Step Config ──────────────────────────────────────────────────

type UILang = "ta" | "hi" | "en";

const REG_STEPS = [
  {
    step: "COLLECT_NAME",
    field: "name",
    question_ta: "வணக்கம்! நான் நிலா. உங்கள் பெயர் என்ன?",
    question_hi: "नमस्ते! मैं NILA हूँ। आपका नाम क्या है?",
    question_en: "Hello! I'm NILA. What is your name?",
    placeholder_ta: "உங்கள் பெயரை தட்டச்சு செய்யவும்...",
    placeholder_hi: "अपना नाम लिखें...",
    placeholder_en: "Type your name...",
  },
  {
    step: "COLLECT_DOB",
    field: "dob",
    question_ta: "உங்கள் வயது அல்லது பிறந்த தேதி என்ன?",
    question_hi: "आपकी उम्र या जन्म तिथि क्या है?",
    question_en: "What is your age or date of birth?",
    placeholder_ta: "உங்கள் வயது அல்லது தேதி...",
    placeholder_hi: "आपकी उम्र या जन्म तिथि...",
    placeholder_en: "Your age or date of birth...",
  },
  {
    step: "COLLECT_ADDRESS",
    field: "address",
    question_ta: "நீங்கள் எந்த ஊரில் அல்லது மாவட்டத்தில் வசிக்கிறீர்கள்?",
    question_hi: "आप किस शहर या जिले में रहते हैं?",
    question_en: "Which town or district do you live in?",
    placeholder_ta: "உங்கள் ஊர் / மாவட்டம்...",
    placeholder_hi: "आपका शहर / जिला...",
    placeholder_en: "Your town or district...",
  },
  {
    step: "COLLECT_MOBILE",
    field: "mobile",
    question_ta: "உங்கள் தொலைபேசி எண் என்ன?",
    question_hi: "आपका फ़ोन नंबर क्या है?",
    question_en: "What is your phone number?",
    placeholder_ta: "உங்கள் தொலைபேசி எண்...",
    placeholder_hi: "आपका फ़ोन नंबर...",
    placeholder_en: "Your phone number...",
  },
];

function getQ(cfg: typeof REG_STEPS[0], l: UILang) {
  if (l === "hi") return cfg.question_hi;
  if (l === "en") return cfg.question_en;
  return cfg.question_ta;
}
function getPH(cfg: typeof REG_STEPS[0], l: UILang) {
  if (l === "hi") return cfg.placeholder_hi;
  if (l === "en") return cfg.placeholder_en;
  return cfg.placeholder_ta;
}

// ── Main Shell ────────────────────────────────────────────────────────────────

export function NILAShell() {
  const {
    session, isLoading, init, processInput, confirm,
    markComplete, setVoiceState, addMessage,
  } = useNILA();

  const [showRestReminder, setShowRestReminder] = useState(false);
  const [showRangoli,      setShowRangoli]      = useState(false);
  const [isSpeaking,       setIsSpeaking]       = useState(false);
  const [showAlerts,       setShowAlerts]       = useState(false);
  const [showGrid,         setShowGrid]         = useState(false);
  const [textInput,        setTextInput]        = useState("");
  const [regStep,          setRegStep]          = useState(0);
  const [answers,          setAnswers]          = useState<Record<string, string>>({});
  const [confirming,       setConfirming]       = useState<{field: string; value: string} | null>(null);
  const [registered,       setRegistered]       = useState(false);
  const [uiLang,           setUiLang]           = useState<UILang>("ta"); // per-question language

  const inputRef = useRef<HTMLInputElement>(null);
  const lang = session?.language ?? "ta";

  const { isListening, startListening, stopListening, speak } = useSpeech({
    language: uiLang, // always follow the user's chosen UI language
    onResult: (text) => {
      handleAnswer(text);
    },
    onStateChange: (listening) => setVoiceState(listening ? "listening" : "idle"),
  });

  const { resetTimer } = useScreenTime({
    onReminder: useCallback(() => setShowRestReminder(true), []),
  });

  useEffect(() => { init(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // ── Speak the current question when step or language changes ─────────────
  const spokenKey = useRef("");
  useEffect(() => {
    if (!session) return;
    if (registered) return;
    if (regStep >= REG_STEPS.length) return;
    const key = `${regStep}-${uiLang}`;
    if (spokenKey.current === key) return;
    spokenKey.current = key;

    const q = getQ(REG_STEPS[regStep], uiLang);
    setIsSpeaking(true);
    setVoiceState("speaking");
    speak(q, uiLang, () => {
      setIsSpeaking(false);
      setVoiceState("idle");
    });
  }, [regStep, uiLang, registered, session, speak, setVoiceState]);

  // ── Handle an answer (from mic or text) ───────────────────────────────────
  function handleAnswer(value: string) {
    if (!value.trim() || regStep >= REG_STEPS.length) return;
    const cfg = REG_STEPS[regStep];
    setConfirming({ field: cfg.field, value: value.trim() });
    const confirmMsg =
      uiLang === "ta" ? `"${value.trim()}" — சரியா?` :
      uiLang === "hi" ? `"${value.trim()}" — क्या यह सही है?` :
      `"${value.trim()}" — is that correct?`;
    speak(confirmMsg, uiLang);
  }

  function handleConfirmYes() {
    if (!confirming) return;
    const newAnswers = { ...answers, [confirming.field]: confirming.value };
    setAnswers(newAnswers);
    setConfirming(null);

    const nextReg = regStep + 1;
    if (nextReg >= REG_STEPS.length) {
      const doneMsg =
        uiLang === "ta" ? "நன்றி! உங்கள் பதிவு முடிந்தது. இப்போது நான் உங்களுக்கு உதவ தயார்." :
        uiLang === "hi" ? "धन्यवाद! पंजीकरण पूरा हुआ। मैं अब आपकी मदद के लिए तैयार हूँ।" :
        "Thank you! Registration complete. I'm ready to help you.";
      addMessage("nila", doneMsg);
      speak(doneMsg, uiLang);
      processInput(`My name is ${newAnswers.name}, age ${newAnswers.dob}, region ${newAnswers.address}, phone ${newAnswers.mobile}`);
      setRegistered(true);
    } else {
      setRegStep(nextReg);
      spokenKey.current = ""; // reset so new step+lang combo triggers speak
    }
    setTextInput("");
  }

  function handleConfirmNo() {
    setConfirming(null);
    const q = getQ(REG_STEPS[regStep], uiLang);
    speak(q, uiLang);
    setTextInput("");
  }

  function switchLang(l: UILang) {
    setUiLang(l);
    spokenKey.current = ""; // force re-speak in new language
  }

  function handleTextSubmit() {
    const val = textInput.trim();
    if (!val) return;
    if (registered) {
      processInput(val);
      setTextInput("");
    } else {
      handleAnswer(val);
      setTextInput("");
    }
  }

  function handleMicPress() {
    if (!session) return;
    if (isSpeaking) { speak("", lang); setIsSpeaking(false); return; }
    if (isListening) {
      stopListening();
    } else {
      speak("", lang);
      startListening();
    }
  }

  // ── Auto-speak NILA replies after registration ────────────────────────────
  const lastNilaMsgRef = useRef(0);
  useEffect(() => {
    if (!session || !registered) return;
    const nilaMessages = session.conversation.filter(m => m.role === "nila");
    if (nilaMessages.length > lastNilaMsgRef.current) {
      const last = nilaMessages[nilaMessages.length - 1];
      setIsSpeaking(true);
      setVoiceState("speaking");
      speak(last.text, lang, () => {
        setIsSpeaking(false);
        setVoiceState("idle");
      });
      lastNilaMsgRef.current = nilaMessages.length;
    }
  }, [session?.conversation, registered, speak, setVoiceState, lang]);

  // ── Loading state ─────────────────────────────────────────────────────────
  if (!session) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-[#FDF8F3]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#ef533f]/20 animate-pulse" />
          <p className="text-sm text-gray-500">NILA is starting...</p>
        </div>
      </main>
    );
  }

  const step = session.step;
  const isSummary = step === "SUMMARY" || step === "CONFIRM_ALL";
  const isComplete = step === "COMPLETE";

  const currentStepCfg = REG_STEPS[regStep];
  const question = currentStepCfg ? getQ(currentStepCfg, uiLang) : "";
  const placeholder = currentStepCfg
    ? getPH(currentStepCfg, uiLang)
    : (uiLang === "ta" ? "தட்டச்சு செய்யவும்..." : uiLang === "hi" ? "यहाँ लिखें..." : "Type here...");

  // ── Schemes filtered by region ─────────────────────────────────────────────
  const userRegion = (answers.address || session.applicationData.address || "").toLowerCase();
  const filteredSchemes = SCHEMES.filter(s =>
    s.regions.includes("all") || s.regions.some(r => userRegion.includes(r))
  );

  const orbActive = isListening || isSpeaking || isLoading;

  return (
    <div className="flex flex-col h-[100dvh] bg-[#FDF8F3] text-[#2c221a] font-sans overflow-hidden relative">

      {/* Background doodle */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: 'url(/doodle.svg)', backgroundSize: '400px', backgroundRepeat: 'repeat' }} />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="flex justify-between items-center z-10 px-4 lg:px-8 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#29221C] text-[#FDF8F3] rounded-full flex items-center justify-center font-bold text-base shadow-md">N</div>
          <div>
            <p className="font-extrabold text-sm leading-tight tracking-widest text-[#29221C]">NILA</p>
            <p className="text-[9px] text-gray-400 font-bold tracking-[0.2em] uppercase">VOICE HELPER</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Alerts */}
          <button
            onClick={() => { setShowAlerts(true); setShowGrid(false); }}
            className="relative w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#ef533f] transition-colors shadow-sm"
          >
            <BellRing size={16} strokeWidth={2.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ef533f] border border-white" />
          </button>
          {/* Grid */}
          <button
            onClick={() => { setShowGrid(true); setShowAlerts(false); }}
            className="relative w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#ef533f] transition-colors shadow-sm"
          >
            <LayoutGrid size={16} strokeWidth={2.5} />
          </button>
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border border-gray-200 bg-white text-xs font-bold text-gray-500 ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
            ONLINE
          </div>
        </div>
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      {isComplete ? (
        <main className="flex-1 overflow-y-auto flex flex-col justify-center items-center px-6">
          <CompletionView language={lang} name={session.applicationData.name || answers.name} />
        </main>
      ) : isSummary ? (
        <main className="flex-1 overflow-y-auto px-4 lg:px-8">
          <ApplicationSummary
            data={{ ...session.applicationData, ...answers }}
            language={lang}
            onConfirm={() => markComplete()}
            onEdit={(field) => processInput(`மீண்டும் ${field} சொல்கிறேன்`)}
          />
        </main>
      ) : (
        <main className="flex-1 flex flex-col lg:flex-row min-h-0 px-4 lg:px-8 gap-4 lg:gap-8 pb-4">

          {/* LEFT: Question + Chat ──────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-h-0 justify-between">

            {!registered ? (
              /* ── REGISTRATION FLOW ── */
              <div className="flex flex-col h-full justify-between">
                {/* Progress dots + Language Selector */}
                <div className="flex items-center gap-3 mt-2 mb-4">
                  <div className="flex gap-1.5 flex-1">
                    {REG_STEPS.map((_, i) => (
                      <div key={i} className={`h-1.5 rounded-full flex-1 transition-all ${i < regStep ? 'bg-[#ef533f]' : i === regStep ? 'bg-[#ef533f]/60' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  {/* Language toggle pills */}
                  <div className="flex gap-1 shrink-0">
                    {(["ta", "hi", "en"] as UILang[]).map(l => (
                      <button
                        key={l}
                        onClick={() => switchLang(l)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          uiLang === l
                            ? "bg-[#29221C] text-white border-[#29221C]"
                            : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        {l === "ta" ? "தமிழ்" : l === "hi" ? "हिन्दी" : "EN"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Display */}
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-xs font-bold tracking-widest text-[#ef533f] uppercase mb-3">
                    {lang === "ta" ? `கேள்வி ${regStep + 1} / ${REG_STEPS.length}` : `Question ${regStep + 1} of ${REG_STEPS.length}`}
                  </p>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#29221C] leading-snug mb-6">
                    {question}
                  </h2>

                  {/* Confirming state */}
                  {confirming ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
                      <p className="text-sm text-gray-500 mb-1">
                        {uiLang === "ta" ? "நீங்கள் சொன்னது:" : uiLang === "hi" ? "आपने कहा:" : "You said:"}
                      </p>
                      <p className="text-xl font-bold text-[#29221C] mb-4">"{confirming.value}"</p>
                      <div className="flex gap-3">
                        <button onClick={handleConfirmYes} className="flex-1 py-2.5 rounded-full bg-[#ef533f] text-white font-bold text-sm hover:bg-[#d94834] transition-colors flex items-center justify-center gap-2">
                          <CheckCircle2 size={16} />
                          {uiLang === "ta" ? "ஆம், சரி" : uiLang === "hi" ? "हाँ, सही है" : "Yes, correct"}
                        </button>
                        <button onClick={handleConfirmNo} className="flex-1 py-2.5 rounded-full border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors">
                          {uiLang === "ta" ? "மீண்டும் சொல்கிறேன்" : uiLang === "hi" ? "फिर से बोलूँगी" : "Let me redo"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Previous answers */
                    <div className="space-y-2">
                      {Object.entries(answers).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle2 size={14} className="text-green-500 shrink-0" />
                          <span className="font-medium capitalize">{k}:</span>
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input row */}
                {!confirming && (
                  <div className="flex flex-col gap-2 mt-4 shrink-0">
                    <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type={currentStepCfg?.field === "mobile" ? "tel" : "text"}
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleTextSubmit(); }}
                      placeholder={placeholder}
                      disabled={isLoading || isSpeaking}
                      className="flex-1 rounded-full border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:border-[#ef533f] focus:ring-2 focus:ring-[#ef533f]/20 disabled:bg-gray-50 disabled:text-gray-400 shadow-sm"
                    />
                    <button
                      onClick={handleTextSubmit}
                      disabled={!textInput.trim() || isLoading}
                      className="w-11 h-11 rounded-full bg-[#ef533f] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#d94834] transition-colors shadow-sm shrink-0"
                    >
                      <Send size={16} />
                    </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── POST-REGISTRATION CHAT ── */
              <div className="flex flex-col h-full min-h-0">
                <div className="overflow-y-auto flex-1 space-y-3 pr-1 pb-2">
                  {session.conversation.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm font-medium leading-relaxed ${msg.role === "user"
                        ? "bg-[#ef533f] text-white rounded-br-sm"
                        : "bg-white border border-gray-100 shadow-sm text-[#29221C] rounded-tl-sm"}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-sm flex gap-1.5 items-center">
                        <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{animationDelay:"0ms"}}/>
                        <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{animationDelay:"150ms"}}/>
                        <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{animationDelay:"300ms"}}/>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-2 shrink-0">
                  <input
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleTextSubmit(); }}
                    placeholder={lang === "ta" ? "தட்டச்சு செய்யவும்..." : "Type here..."}
                    disabled={isLoading || isSpeaking}
                    className="flex-1 rounded-full border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:border-[#ef533f] focus:ring-2 focus:ring-[#ef533f]/20 disabled:bg-gray-50 shadow-sm"
                  />
                  <button
                    onClick={handleTextSubmit}
                    disabled={!textInput.trim() || isLoading}
                    className="w-11 h-11 rounded-full bg-[#ef533f] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#d94834] transition-colors shadow-sm shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Mic Orb ─────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-center shrink-0 lg:w-72">
            {/* Status label */}
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#ef533f] mb-3 h-4">
              {isListening ? (lang === "ta" ? "கேட்கிறது..." : "LISTENING...")
                : isLoading ? (lang === "ta" ? "யோசிக்கிறது..." : "THINKING...")
                : isSpeaking ? (lang === "ta" ? "பேசுகிறது..." : "SPEAKING...")
                : ""}
            </p>

            {/* Orb */}
            <div className="relative flex items-center justify-center w-40 h-40 md:w-52 md:h-52">
              {orbActive && (
                <>
                  <div className={`absolute inset-0 rounded-full ${isSpeaking ? "bg-[#FBBB75]/30" : "bg-[#ef533f]/10"} animate-ping`}
                    style={{ animationDuration: "2s" }} />
                  <div className={`absolute inset-4 rounded-full ${isSpeaking ? "bg-[#FBBB75]/40" : "bg-[#ef533f]/15"} animate-ping`}
                    style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
                </>
              )}
              {isLoading && (
                <div className="absolute inset-6 rounded-full border-4 border-dashed border-[#FBBB75] animate-spin" style={{ animationDuration: "4s" }} />
              )}
              <div className={`absolute inset-10 rounded-full ${isSpeaking ? "bg-[#FBBB75]/30" : "bg-[#ef533f]/15"} transition-all`} />

              <button
                onClick={handleMicPress}
                disabled={isLoading && !isListening}
                className={`relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95
                  ${isListening ? "bg-[#d94834] scale-110"
                    : isLoading ? "bg-gray-400 cursor-wait"
                    : "bg-[#ef533f] hover:bg-[#d94834]"}`}
              >
                <Mic size={28} strokeWidth={2.5} className={isListening ? "animate-pulse" : ""} />
              </button>
            </div>

            <p className="text-xs text-gray-400 font-medium mt-3 text-center">
              {uiLang === "ta"
                ? (isListening ? "பேசுங்கள்..." : "மைக்கை அழுத்துங்கள்")
                : uiLang === "hi"
                ? (isListening ? "बोलिए..." : "माइक दबाएं")
                : (isListening ? "Speak now..." : "Tap to speak")}
            </p>

            {/* Step pills on mobile */}
            {!registered && (
              <div className="flex gap-1.5 mt-4 flex-wrap justify-center">
                {REG_STEPS.map((s, i) => (
                  <div key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all
                    ${i < regStep ? "bg-green-50 border-green-200 text-green-600"
                      : i === regStep ? "bg-[#ef533f]/10 border-[#ef533f]/30 text-[#ef533f]"
                      : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                    {uiLang === "ta"
                      ? (s.field === "name" ? "பெயர்" : s.field === "dob" ? "வயது" : s.field === "address" ? "இடம்" : "தொலைபேசி")
                      : uiLang === "hi"
                      ? (s.field === "name" ? "नाम" : s.field === "dob" ? "उम्र" : s.field === "address" ? "क्षेत्र" : "फ़ोन")
                      : (s.field === "name" ? "Name" : s.field === "dob" ? "Age" : s.field === "address" ? "Region" : "Phone")}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ── Times-up ──────────────────────────────────────────────────────── */}
      {showRestReminder && (
        <RestReminder
          language={lang}
          onAccept={() => { setShowRestReminder(false); setShowRangoli(true); }}
          onDismiss={() => { setShowRestReminder(false); resetTimer(); }}
        />
      )}
      {showRangoli && (
        <RangoliActivity language={lang} onClose={() => { setShowRangoli(false); resetTimer(); }} />
      )}

      {/* ── ALERTS MODAL ──────────────────────────────────────────────────── */}
      {showAlerts && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowAlerts(false); }}>
          <div className="bg-[#FDF8F3] rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <BellRing size={18} className="text-[#ef533f]" />
                <h2 className="font-bold text-base text-[#29221C]">
                  {lang === "ta" ? "அறிவிப்புகள்" : "Notifications"}
                </h2>
                <span className="w-5 h-5 rounded-full bg-[#ef533f] text-white text-[10px] font-bold flex items-center justify-center">{ALERTS.length}</span>
              </div>
              <button onClick={() => setShowAlerts(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {ALERTS.map(a => (
                <div key={a.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.tagColor}`}>{a.tag}</span>
                    <span className="text-[10px] text-gray-400">{a.date}</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#29221C] mb-1">{lang === "ta" ? a.title_ta : a.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{lang === "ta" ? a.body_ta : a.body}</p>
                  <div className="flex items-center gap-1 mt-2 text-[#ef533f] text-xs font-bold">
                    <span>{lang === "ta" ? "மேலும் அறிக" : "Learn more"}</span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── GRID MODAL ────────────────────────────────────────────────────── */}
      {showGrid && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowGrid(false); }}>
          <div className="bg-[#FDF8F3] rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <LayoutGrid size={18} className="text-[#ef533f]" />
                  <h2 className="font-bold text-base text-[#29221C]">
                    {lang === "ta" ? "உரிமைகள் & திட்டங்கள்" : "Rights & Schemes"}
                  </h2>
                </div>
                {userRegion && (
                  <p className="text-[10px] text-gray-400 mt-0.5 ml-6">
                    {lang === "ta" ? `${answers.address || session.applicationData.address} அடிப்படையில் வடிகட்டப்பட்டது` : `Filtered for ${answers.address || session.applicationData.address}`}
                  </p>
                )}
              </div>
              <button onClick={() => setShowGrid(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500">
                <X size={16} />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {filteredSchemes.map(s => (
                  <div key={s.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <h3 className="font-bold text-xs text-[#29221C] leading-tight mb-1">
                      {lang === "ta" ? s.title_ta : s.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      {lang === "ta" ? s.desc_ta : s.desc}
                    </p>
                    <span className="inline-block mt-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ef533f]/10 text-[#ef533f]">
                      {s.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
