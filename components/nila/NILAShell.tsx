"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Mic, BellRing, LayoutGrid, X, Send, CheckCircle2, ChevronRight, ArrowLeft, ChevronDown } from "lucide-react";
import { useNILA } from "@/lib/nila/use-nila";
import { useSpeech, useScreenTime } from "@/lib/nila/use-speech";
import { RestReminder } from "./RestReminder";
import { RangoliActivity } from "./RangoliActivity";
import { ApplicationSummary } from "./ApplicationSummary";
import { CompletionView } from "./CompletionView";
import type { SupportedLanguage } from "@/lib/nila/types";

// ── Schemes Data ─────────────────────────────────────────────────────────────

const SCHEMES = [
  { id: 1, icon: "🔥", category: "Health & Kitchen", regions: ["all"],
    title: "PM Ujjwala Yojana", title_ta: "பி.எம். உஜ்வாலா யோஜனா", title_hi: "PM उज्ज्वला योजना",
    desc: "Free LPG gas connection for women below poverty line.", desc_ta: "ஏழைப் பெண்களுக்கு இலவச எரிவாயு இணைப்பு.", desc_hi: "गरीबी रेखा से नीचे की महिलाओं को मुफ्त LPG गैस कनेक्शन।",
    detail: "Eligibility: BPL women. Documents: Aadhaar, ration card. Benefit: One free LPG cylinder connection + subsidy on refills. Apply at your nearest gas agency.",
    detail_ta: "தகுதி: ஏழ்மை கோட்டிற்கு கீழ் உள்ள பெண்கள். ஆவணங்கள்: ஆதார், ரேஷன் கார்டு. நன்மை: ஒரு இலவச எரிவாயு இணைப்பு + மானியம். அருகில் உள்ள எரிவாயு நிறுவனத்தில் விண்ணப்பிக்கவும்.",
    detail_hi: "पात्रता: गरीब महिलाएं। दस्तावेज: आधार, राशन कार्ड। लाभ: मुफ्त गैस कनेक्शन + सब्सिडी। नजदीकी गैस एजेंसी में आवेदन करें।",
  },
  { id: 2, icon: "💰", category: "Finance", regions: ["all"],
    title: "Sukanya Samriddhi Yojana", title_ta: "சுகன்யா சம்ருத்தி யோஜனா", title_hi: "सुकन्या समृद्धि योजना",
    desc: "Savings scheme for the girl child with high interest.", desc_ta: "பெண் குழந்தைகளுக்கான சேமிப்பு திட்டம்.", desc_hi: "बालिकाओं के लिए उच्च ब्याज बचत योजना।",
    detail: "For girls below 10 years. Open account at any bank or post office. Interest: 8.2% p.a. Minimum deposit ₹250/year. Tax-free maturity.",
    detail_ta: "10 வயதிற்கு கீழ் உள்ள பெண் குழந்தைகளுக்கு. வங்கி அல்லது அஞ்சல் நிலையத்தில் கணக்கு திறக்கவும். வட்டி: 8.2%. குறைந்தபட்ச வைப்பு ₹250/ஆண்டு.",
    detail_hi: "10 साल से कम उम्र की बच्चियों के लिए। बैंक या पोस्ट ऑफिस में खाता खुलवाएं। ब्याज: 8.2%। न्यूनतम ₹250/वर्ष।",
  },
  { id: 3, icon: "👶", category: "Employment", regions: ["all"],
    title: "Maternity Benefit Act", title_ta: "மகப்பேறு நலத் திட்டம்", title_hi: "मातृत्व लाभ अधिनियम",
    desc: "26 weeks paid maternity leave for working women.", desc_ta: "பணிபுரியும் பெண்களுக்கு 26 வார சம்பளத்துடன் மகப்பேறு விடுப்பு.", desc_hi: "कामकाजी महिलाओं के लिए 26 सप्ताह का सवेतन मातृत्व अवकाश।",
    detail: "Applicable to all women employed in organisations with 10+ workers. 26 weeks paid leave for first 2 children, 12 weeks for 3rd+. Also covers adoption.",
    detail_ta: "10+ தொழிலாளர்கள் உள்ள அமைப்புகளில் பணிபுரியும் அனைத்து பெண்களுக்கும். முதல் 2 குழந்தைகளுக்கு 26 வார சம்பள விடுப்பு.",
    detail_hi: "10+ कर्मचारियों वाली कंपनियों की महिलाओं के लिए। पहले 2 बच्चों के लिए 26 सप्ताह, 3रे के लिए 12 सप्ताह।",
  },
  { id: 4, icon: "💜", category: "Finance", regions: ["tamil nadu", "chennai", "coimbatore", "madurai", "trichy", "salem"],
    title: "Tamilnadu Magalir Urimai Thittam", title_ta: "மகளிர் உரிமைத் திட்டம்", title_hi: "तमिलनाडु महिला अधिकार योजना",
    desc: "Monthly ₹1000 for women heads of household in Tamil Nadu.", desc_ta: "தமிழ்நாட்டில் குடும்பத் தலைவிகளுக்கு மாதம் ₹1000 நிதியுதவி.", desc_hi: "तमिलनाडु में महिला परिवार प्रमुखों को मासिक ₹1000।",
    detail: "For women who are heads of family in Tamil Nadu. ₹1000/month directly to bank account. Apply at Amma service centres with Aadhaar and ration card.",
    detail_ta: "தமிழ்நாட்டில் குடும்பத் தலைவிகளுக்கு மாதம் ₹1000 நேரடியாக வங்கி கணக்கில். அம்மா சேவை மையங்களில் விண்ணப்பிக்கவும்.",
    detail_hi: "तमिलनाडु में परिवार की मुखिया महिलाओं को बैंक में ₹1000/माह। अम्मा सेवा केंद्र में आवेदन करें।",
  },
  { id: 5, icon: "📚", category: "Education", regions: ["all"],
    title: "Beti Bachao Beti Padhao", title_ta: "பெண் காப்போம் பெண் படிப்போம்", title_hi: "बेटी बचाओ बेटी पढ़ाओ",
    desc: "Welfare and education for girl children.", desc_ta: "பெண் குழந்தைகளின் நலன் மற்றும் கல்வி.", desc_hi: "बालिकाओं का कल्याण और शिक्षा।",
    detail: "Focus on preventing female foeticide, ensuring education and participation of girl children. Covers scholarships and school enrolment drives.",
    detail_ta: "பெண் குழந்தைகள் கல்வி மற்றும் பாதுகாப்பு. உதவித்தொகை மற்றும் பள்ளி சேர்க்கை.",
    detail_hi: "बालिकाओं की शिक्षा और सुरक्षा। छात्रवृत्ति और स्कूल नामांकन।",
  },
  { id: 6, icon: "🏠", category: "Housing", regions: ["all"],
    title: "PM Awas Yojana (Women Priority)", title_ta: "பி.எம். ஆவாஸ் யோஜனா", title_hi: "PM आवास योजना",
    desc: "Housing scheme giving priority ownership to women.", desc_ta: "பெண்களுக்கு முன்னுரிமை அளிக்கும் வீட்டு உதவித் திட்டம்.", desc_hi: "महिलाओं को प्राथमिकता देने वाली आवास योजना।",
    detail: "Home must be registered in woman's name (sole or co-ownership). Subsidy up to ₹2.67 lakh. Apply at your local municipality or gram panchayat.",
    detail_ta: "வீடு பெண்ணின் பெயரில் பதிவு செய்யப்பட வேண்டும். ₹2.67 லட்சம் வரை மானியம். நகராட்சி அல்லது பஞ்சாயத்தில் விண்ணப்பிக்கவும்.",
    detail_hi: "घर महिला के नाम पर हो। ₹2.67 लाख तक सब्सिडी। नगरपालिका या पंचायत में आवेदन करें।",
  },
  { id: 7, icon: "✨", category: "Skills", regions: ["tamil nadu", "chennai", "coimbatore", "madurai", "trichy"],
    title: "Tamilnadu Kalaignar Magalir Urimai", title_ta: "கலைஞர் மகளிர் உரிமை", title_hi: "कलैगनार महिला अधिकार",
    desc: "Support and skill development for women in Tamil Nadu.", desc_ta: "தமிழ்நாட்டு பெண்களுக்கு திறன் மேம்பாடு மற்றும் உதவி.", desc_hi: "तमिलनाडु महिलाओं के लिए कौशल विकास और सहायता।",
    detail: "Free vocational training, self-employment loans and skill development for women in Tamil Nadu. Apply at TAHDCO offices.",
    detail_ta: "இலவச தொழிற் பயிற்சி, சுய வேலைவாய்ப்பு கடன். TAHDCO அலுவலகத்தில் விண்ணப்பிக்கவும்.",
    detail_hi: "मुफ्त व्यावसायिक प्रशिक्षण, स्वरोजगार ऋण। TAHDCO कार्यालय में आवेदन करें।",
  },
  { id: 8, icon: "📞", category: "Safety", regions: ["all"],
    title: "National Women's Helpline 181", title_ta: "தேசிய மகளிர் உதவி எண் 181", title_hi: "राष्ट्रीय महिला हेल्पलाइन 181",
    desc: "24x7 helpline for women in distress.", desc_ta: "துன்பத்தில் உள்ள பெண்களுக்கு 24x7 உதவி.", desc_hi: "संकट में महिलाओं के लिए 24x7 हेल्पलाइन।",
    detail: "Call 181 anytime for free. Covers domestic violence, legal support, medical assistance, shelter homes. Confidential and multilingual.",
    detail_ta: "எப்போதும் 181 என்று அழைக்கவும். குடும்ப வன்முறை, சட்ட உதவி, மருத்துவ உதவி. இரகசியமானது.",
    detail_hi: "किसी भी समय 181 पर कॉल करें। घरेलू हिंसा, कानूनी सहायता, चिकित्सा। गोपनीय।",
  },
];

const ALERTS = [
  { id: 1, title: "Tamil Nadu Kalaignar Scheme Extended", title_ta: "கலைஞர் திட்டம் நீட்டிக்கப்பட்டது", title_hi: "कलैगनार योजना विस्तारित",
    body: "Registration open until December 2026.", body_ta: "பதிவு டிசம்பர் 2026 வரை திறந்துள்ளது.", body_hi: "दिसंबर 2026 तक पंजीकरण खुला है।",
    date: "Oct 1, 2026", tag: "New", tagColor: "bg-green-100 text-green-700" },
  { id: 2, title: "PM Ujjwala Phase 3 Launched", title_ta: "PM உஜ்வாலா நிலை 3 தொடங்கியது", title_hi: "PM उज्ज्वला चरण 3 शुरू",
    body: "75 lakh new beneficiaries targeted.", body_ta: "75 லட்சம் புதிய பயனாளிகளை இலக்காகக் கொண்டது.", body_hi: "75 लाख नए लाभार्थी लक्षित।",
    date: "Sep 28, 2026", tag: "Update", tagColor: "bg-blue-100 text-blue-700" },
  { id: 3, title: "Free Legal Aid for Women", title_ta: "பெண்களுக்கு இலவச சட்ட உதவி", title_hi: "महिलाओं के लिए मुफ्त कानूनी सहायता",
    body: "District Legal Services offering free aid.", body_ta: "மாவட்ட சட்ட சேவைகள் இலவச உதவி வழங்குகின்றன.", body_hi: "जिला कानूनी सेवाएं मुफ्त सहायता दे रही हैं।",
    date: "Sep 25, 2026", tag: "Alert", tagColor: "bg-orange-100 text-orange-700" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

type UILang = "ta" | "hi" | "en";
type AppView = "home" | "schemes" | "scheme-detail" | "alerts";
type SchemeType = typeof SCHEMES[0];

// ── Helpers ───────────────────────────────────────────────────────────────────

const REG_STEPS = [
  { field: "name",
    question_ta: "வணக்கம்! நான் நிலா. உங்கள் பெயர் என்ன?",
    question_hi: "नमस्ते! मैं NILA हूँ। आपका नाम क्या है?",
    question_en: "Hello! I'm NILA. What is your name?",
    placeholder_ta: "உங்கள் பெயரை தட்டச்சு செய்யவும்...",
    placeholder_hi: "अपना नाम लिखें...", placeholder_en: "Type your name..." },
  { field: "dob",
    question_ta: "உங்கள் வயது அல்லது பிறந்த தேதி என்ன?",
    question_hi: "आपकी उम्र या जन्म तिथि क्या है?",
    question_en: "What is your age or date of birth?",
    placeholder_ta: "உங்கள் வயது அல்லது தேதி...",
    placeholder_hi: "आपकी उम्र या जन्म तिथि...", placeholder_en: "Your age or date of birth..." },
  { field: "address",
    question_ta: "நீங்கள் எந்த ஊரில் வசிக்கிறீர்கள்?",
    question_hi: "आप किस शहर में रहते हैं?",
    question_en: "Which town or district do you live in?",
    placeholder_ta: "உங்கள் ஊர் / மாவட்டம்...",
    placeholder_hi: "आपका शहर / जिला...", placeholder_en: "Your town or district..." },
  { field: "mobile",
    question_ta: "உங்கள் தொலைபேசி எண் என்ன?",
    question_hi: "आपका फ़ोन नंबर क्या है?",
    question_en: "What is your phone number?",
    placeholder_ta: "உங்கள் தொலைபேசி எண்...",
    placeholder_hi: "आपका फ़ोन नंबर...", placeholder_en: "Your phone number..." },
];

function getQ(cfg: typeof REG_STEPS[0], l: UILang) {
  return l === "hi" ? cfg.question_hi : l === "en" ? cfg.question_en : cfg.question_ta;
}
function getPH(cfg: typeof REG_STEPS[0], l: UILang) {
  return l === "hi" ? cfg.placeholder_hi : l === "en" ? cfg.placeholder_en : cfg.placeholder_ta;
}
function getSchemeText(s: SchemeType, key: "title" | "desc" | "detail", l: UILang) {
  if (l === "ta") return (s as Record<string, string>)[`${key}_ta`] ?? s[key];
  if (l === "hi") return (s as Record<string, string>)[`${key}_hi`] ?? s[key];
  return s[key];
}
function detectLang(text: string): UILang | null {
  const tamilChars = (text.match(/[\u0B80-\u0BFF]/g) || []).length;
  const hindiChars  = (text.match(/[\u0900-\u097F]/g) || []).length;
  const total = text.length || 1;
  if (tamilChars / total > 0.2) return "ta";
  if (hindiChars  / total > 0.2) return "hi";
  if (/[a-zA-Z]/.test(text) && tamilChars === 0 && hindiChars === 0) return "en";
  return null;
}

// ── Main Component ────────────────────────────────────────────────────────────

export function NILAShell() {
  const { session, isLoading, init, processInput, markComplete, setVoiceState, addMessage } = useNILA();

  // ── Core state ────────────────────────────────────────────────────────────
  const [isSpeaking,   setIsSpeaking]   = useState(false);
  const [textInput,    setTextInput]    = useState("");
  const [uiLang,       setUiLang]       = useState<UILang>("ta");

  // ── Registration state ────────────────────────────────────────────────────
  const [regStep,    setRegStep]    = useState(0);
  const [answers,    setAnswers]    = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState<{ field: string; value: string } | null>(null);
  const [registered, setRegistered] = useState(false);

  // ── Navigation state ──────────────────────────────────────────────────────
  const [view,            setView]           = useState<AppView>("home");
  const [activeScheme,    setActiveScheme]   = useState<SchemeType | null>(null);
  const [schemeChat,      setSchemeChat]     = useState<{ role: "nila" | "user"; text: string }[]>([]);
  const [schemeChatInput, setSchemeChatInput] = useState("");
  const [schemeLoading,   setSchemeLoading]  = useState(false);
  const [showAlerts,      setShowAlerts]     = useState(false);
  const [showRestReminder,setShowRestReminder] = useState(false);
  const [showRangoli,     setShowRangoli]    = useState(false);
  const [showLangDrop,    setShowLangDrop]   = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const spokenKey     = useRef("");
  const lastNilaRef   = useRef(0);

  const lang = session?.language ?? "ta";

  const { isListening, startListening, stopListening, speak } = useSpeech({
    language: uiLang,
    onResult: (text) => {
      const detected = detectLang(text);
      if (detected && registered) setUiLang(detected);
      if (registered) { processInput(text); }
      else { handleAnswer(text); }
    },
    onStateChange: (listening) => setVoiceState(listening ? "listening" : "idle"),
  });

  const { resetTimer } = useScreenTime({
    onReminder: useCallback(() => setShowRestReminder(true), []),
  });

  useEffect(() => { init(); /* eslint-disable-next-line */ }, []);

  // ── Auto-speak registration question ─────────────────────────────────────
  useEffect(() => {
    if (!session || registered || regStep >= REG_STEPS.length) return;
    const key = `${regStep}-${uiLang}`;
    if (spokenKey.current === key) return;
    spokenKey.current = key;
    const q = getQ(REG_STEPS[regStep], uiLang);
    setIsSpeaking(true); setVoiceState("speaking");
    speak(q, uiLang, () => { setIsSpeaking(false); setVoiceState("idle"); });
  }, [regStep, uiLang, registered, session, speak, setVoiceState]);

  // ── Auto-speak NILA replies after registration ────────────────────────────
  useEffect(() => {
    if (!session || !registered) return;
    const msgs = session.conversation.filter(m => m.role === "nila");
    if (msgs.length > lastNilaRef.current) {
      const last = msgs[msgs.length - 1];
      const detected = detectLang(last.text);
      if (detected) setUiLang(detected);
      setIsSpeaking(true); setVoiceState("speaking");
      speak(last.text, detected ?? uiLang, () => { setIsSpeaking(false); setVoiceState("idle"); });
      lastNilaRef.current = msgs.length;
    }
  }, [session?.conversation, registered, speak, setVoiceState, uiLang]);

  // ── Auto-scroll scheme chat ───────────────────────────────────────────────
  useEffect(() => { chatBottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [schemeChat]);

  // ── Registration handlers ─────────────────────────────────────────────────
  function handleAnswer(value: string) {
    if (!value.trim() || regStep >= REG_STEPS.length) return;
    setConfirming({ field: REG_STEPS[regStep].field, value: value.trim() });
    const msg = uiLang === "ta" ? `"${value.trim()}" — சரியா?`
              : uiLang === "hi" ? `"${value.trim()}" — क्या यह सही है?`
              : `"${value.trim()}" — correct?`;
    speak(msg, uiLang);
  }

  function handleConfirmYes() {
    if (!confirming) return;
    const next = { ...answers, [confirming.field]: confirming.value };
    setAnswers(next); setConfirming(null);
    const nextStep = regStep + 1;
    if (nextStep >= REG_STEPS.length) {
      const done = uiLang === "ta" ? "நன்றி! பதிவு முடிந்தது. இப்போது நான் உங்களுக்கு உதவ தயார்."
                 : uiLang === "hi" ? "धन्यवाद! पंजीकरण पूरा हुआ। अब मैं आपकी मदद के लिए तैयार हूँ।"
                 : "Thank you! Registration complete. I'm ready to help you.";
      addMessage("nila", done); speak(done, uiLang);
      processInput(`Name: ${next.name}, Age: ${next.dob}, Region: ${next.address}, Phone: ${next.mobile}`);
      setRegistered(true);
    } else {
      setRegStep(nextStep); spokenKey.current = "";
    }
    setTextInput("");
  }

  function handleConfirmNo() {
    setConfirming(null);
    speak(getQ(REG_STEPS[regStep], uiLang), uiLang);
    setTextInput("");
  }

  function switchLang(l: UILang) {
    setUiLang(l); spokenKey.current = ""; setShowLangDrop(false);
  }

  function handleTextSubmit() {
    const val = textInput.trim(); if (!val) return;
    const detected = detectLang(val);
    if (detected && registered) setUiLang(detected);
    if (registered) processInput(val);
    else handleAnswer(val);
    setTextInput("");
  }

  function handleMicPress() {
    if (!session) return;
    if (isSpeaking) { speak("", uiLang); setIsSpeaking(false); return; }
    if (isListening) stopListening();
    else { speak("", uiLang); startListening(); }
  }

  // ── Scheme chat ───────────────────────────────────────────────────────────
  async function sendSchemeChat(text: string) {
    if (!text.trim() || !activeScheme) return;
    const userMsg = { role: "user" as const, text };
    setSchemeChat(p => [...p, userMsg]);
    setSchemeChatInput(""); setSchemeLoading(true);
    const detected = detectLang(text);
    if (detected) setUiLang(detected);
    try {
      const res = await fetch("/api/ai/understand", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userText: text,
          currentStep: "COMPLETE",
          language: detected ?? uiLang,
          applicationData: answers,
          simplifyLevel: 0,
          conversationHistory: schemeChat.slice(-6).map(m => ({
            role: m.role, text: m.text, timestamp: Date.now()
          })),
        }),
      });
      const data = await res.json();
      const reply = data?.result?.reply || (uiLang === "ta" ? "மன்னிக்கவும், மீண்டும் முயற்சி செய்யவும்." : "Sorry, please try again.");
      const lang = (detected ?? uiLang) as UILang;
      setSchemeChat(p => [...p, { role: "nila", text: reply }]);
      speak(reply, lang);
    } catch {
      const err = uiLang === "ta" ? "இணைப்பு பிழை." : uiLang === "hi" ? "कनेक्शन त्रुटि।" : "Connection error.";
      setSchemeChat(p => [...p, { role: "nila", text: err }]);
    } finally { setSchemeLoading(false); }
  }

  function openScheme(s: SchemeType) {
    setActiveScheme(s);
    const intro = uiLang === "ta"
      ? `${getSchemeText(s, "title", "ta")} பற்றி உங்களுக்கு என்ன தெரிய வேண்டும்?`
      : uiLang === "hi"
      ? `${getSchemeText(s, "title", "hi")} के बारे में आप क्या जानना चाहते हैं?`
      : `What would you like to know about ${s.title}?`;
    setSchemeChat([{ role: "nila", text: intro }]);
    speak(intro, uiLang);
    setView("scheme-detail");
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!session) return (
    <main className="min-h-dvh flex items-center justify-center bg-[#FDF8F3]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-[#ef533f]/20 animate-pulse" />
        <p className="text-sm text-gray-400">NILA is starting...</p>
      </div>
    </main>
  );

  const isSummary = session.step === "SUMMARY" || session.step === "CONFIRM_ALL";
  const isComplete = session.step === "COMPLETE";
  const userRegion = (answers.address || "").toLowerCase();
  const filteredSchemes = SCHEMES.filter(s => s.regions.includes("all") || s.regions.some(r => userRegion.includes(r)));
  const langLabel = uiLang === "ta" ? "தமிழ்" : uiLang === "hi" ? "हिन्दी" : "English";
  const orbActive = isListening || isSpeaking || isLoading;

  // ── SCHEME DETAIL PAGE ────────────────────────────────────────────────────
  if (view === "scheme-detail" && activeScheme) {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#FDF8F3] overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 lg:px-8 pt-4 pb-3 border-b border-gray-100 shrink-0">
          <button onClick={() => { setView("schemes"); setSchemeChat([]); }}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="text-2xl">{activeScheme.icon}</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-[#29221C] truncate">{getSchemeText(activeScheme, "title", uiLang)}</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ef533f]/10 text-[#ef533f]">{activeScheme.category}</span>
          </div>
        </header>

        {/* Scheme detail card */}
        <div className="px-4 lg:px-8 py-3 shrink-0">
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-600 leading-relaxed">{getSchemeText(activeScheme, "detail", uiLang)}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="px-4 lg:px-8 mb-2 shrink-0">
          <p className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
            {uiLang === "ta" ? "இந்த திட்டம் பற்றி கேளுங்கள்" : uiLang === "hi" ? "इस योजना के बारे में पूछें" : "Ask about this scheme"}
          </p>
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 space-y-3 pb-2 min-h-0">
          {schemeChat.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed font-medium ${
                m.role === "user" ? "bg-[#ef533f] text-white rounded-br-sm" : "bg-white border border-gray-100 shadow-sm text-[#29221C] rounded-tl-sm"}`}>
                {m.text}
              </div>
            </div>
          ))}
          {schemeLoading && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                {[0,150,300].map(d => <span key={d} className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{animationDelay:`${d}ms`}}/>)}
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 px-4 lg:px-8 pb-4 pt-2 shrink-0">
          <input value={schemeChatInput} onChange={e => setSchemeChatInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { sendSchemeChat(schemeChatInput); } }}
            placeholder={uiLang === "ta" ? "இங்கே கேளுங்கள்..." : uiLang === "hi" ? "यहाँ पूछें..." : "Ask anything..."}
            className="flex-1 rounded-full border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:border-[#ef533f] focus:ring-2 focus:ring-[#ef533f]/20 shadow-sm" />
          <button onClick={() => sendSchemeChat(schemeChatInput)} disabled={!schemeChatInput.trim() || schemeLoading}
            className="w-11 h-11 rounded-full bg-[#ef533f] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#d94834] transition-colors shrink-0">
            <Send size={16} />
          </button>
          <button onClick={handleMicPress}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 transition-all ${isListening ? "bg-[#d94834] scale-110" : "bg-[#29221C] hover:bg-[#3a2e26]"}`}>
            <Mic size={16} className={isListening ? "animate-pulse" : ""} />
          </button>
        </div>
      </div>
    );
  }

  // ── SCHEMES FULL PAGE ─────────────────────────────────────────────────────
  if (view === "schemes") {
    return (
      <div className="flex flex-col h-[100dvh] bg-[#FDF8F3] overflow-hidden">
        <header className="flex items-center gap-3 px-4 lg:px-8 pt-4 pb-3 border-b border-gray-100 shrink-0">
          <button onClick={() => setView("home")}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <LayoutGrid size={18} className="text-[#ef533f]" />
          <h1 className="font-bold text-base text-[#29221C] flex-1">
            {uiLang === "ta" ? "உரிமைகள் & திட்டங்கள்" : uiLang === "hi" ? "अधिकार और योजनाएं" : "Rights & Schemes"}
          </h1>
          {userRegion && (
            <span className="text-[10px] text-gray-400 hidden md:block">
              {uiLang === "ta" ? `${answers.address} க்கு` : uiLang === "hi" ? `${answers.address} के लिए` : `For ${answers.address}`}
            </span>
          )}
        </header>
        <div className="flex-1 overflow-y-auto px-4 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredSchemes.map(s => (
              <button key={s.id} onClick={() => openScheme(s)}
                className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left group">
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="font-bold text-xs text-[#29221C] leading-snug mb-1 group-hover:text-[#ef533f] transition-colors">
                  {getSchemeText(s, "title", uiLang)}
                </p>
                <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">
                  {getSchemeText(s, "desc", uiLang)}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#ef533f]/10 text-[#ef533f]">{s.category}</span>
                  <ChevronRight size={12} className="text-gray-300 group-hover:text-[#ef533f] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── HOME PAGE ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[100dvh] bg-[#FDF8F3] text-[#2c221a] font-sans overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{ backgroundImage: "url(/doodle.svg)", backgroundSize: "400px", backgroundRepeat: "repeat" }} />

      {/* ── Header ── */}
      <header className="flex justify-between items-center z-20 px-4 lg:px-8 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#29221C] text-[#FDF8F3] rounded-full flex items-center justify-center font-bold text-base shadow-md">N</div>
          <div>
            <p className="font-extrabold text-sm leading-tight tracking-widest text-[#29221C]">NILA</p>
            <p className="text-[9px] text-gray-400 font-bold tracking-[0.2em] uppercase">VOICE HELPER</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Language dropdown */}
          <div className="relative">
            <button onClick={() => setShowLangDrop(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:border-gray-400 transition-all shadow-sm">
              {langLabel} <ChevronDown size={12} className={`transition-transform ${showLangDrop ? "rotate-180" : ""}`} />
            </button>
            {showLangDrop && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50 min-w-[110px]">
                {(["ta", "hi", "en"] as UILang[]).map(l => (
                  <button key={l} onClick={() => switchLang(l)}
                    className={`w-full px-4 py-2.5 text-left text-xs font-bold hover:bg-gray-50 transition-colors ${uiLang === l ? "text-[#ef533f] bg-[#ef533f]/5" : "text-gray-600"}`}>
                    {l === "ta" ? "தமிழ்" : l === "hi" ? "हिन्दी" : "English"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bell */}
          <button onClick={() => setShowAlerts(true)}
            className="relative w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#ef533f] transition-colors shadow-sm">
            <BellRing size={16} strokeWidth={2.5} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ef533f] border-2 border-white" />
          </button>

          {/* Grid */}
          <button onClick={() => setView("schemes")}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-[#ef533f] transition-colors shadow-sm">
            <LayoutGrid size={16} strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      {isComplete ? (
        <main className="flex-1 flex justify-center items-center overflow-y-auto px-6">
          <CompletionView language={lang as SupportedLanguage} name={answers.name} />
        </main>
      ) : isSummary ? (
        <main className="flex-1 overflow-y-auto px-4 lg:px-8">
          <ApplicationSummary data={{ ...session.applicationData, ...answers } as Record<string, string>}
            language={lang as SupportedLanguage}
            onConfirm={() => markComplete()}
            onEdit={(field: string) => processInput(`${field} மீண்டும் சொல்கிறேன்`)} />
        </main>
      ) : (
        <main className="flex-1 flex flex-col lg:flex-row min-h-0 px-4 lg:px-8 gap-4 lg:gap-8 pb-4">

          {/* LEFT: Registration or Chat */}
          <div className="flex-1 flex flex-col min-h-0 justify-between">
            {!registered ? (
              <div className="flex flex-col h-full justify-between">
                {/* Progress bar */}
                <div className="flex gap-1.5 mt-2 mb-5">
                  {REG_STEPS.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${i < regStep ? "bg-[#ef533f]" : i === regStep ? "bg-[#ef533f]/50" : "bg-gray-200"}`} />
                  ))}
                </div>

                {/* Question */}
                <div className="flex-1 flex flex-col justify-center">
                  <p className="text-[10px] font-bold tracking-widest text-[#ef533f] uppercase mb-2">
                    {uiLang === "ta" ? `கேள்வி ${regStep + 1} / ${REG_STEPS.length}` : uiLang === "hi" ? `प्रश्न ${regStep + 1} / ${REG_STEPS.length}` : `Question ${regStep + 1} of ${REG_STEPS.length}`}
                  </p>
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#29221C] leading-snug mb-5">
                    {getQ(REG_STEPS[regStep], uiLang)}
                  </h2>

                  {confirming ? (
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <p className="text-xs text-gray-400 mb-1">
                        {uiLang === "ta" ? "நீங்கள் சொன்னது:" : uiLang === "hi" ? "आपने कहा:" : "You said:"}
                      </p>
                      <p className="text-xl font-bold text-[#29221C] mb-4">"{confirming.value}"</p>
                      <div className="flex gap-3">
                        <button onClick={handleConfirmYes}
                          className="flex-1 py-2.5 rounded-full bg-[#ef533f] text-white font-bold text-sm hover:bg-[#d94834] flex items-center justify-center gap-1.5 transition-colors">
                          <CheckCircle2 size={15} />
                          {uiLang === "ta" ? "ஆம், சரி" : uiLang === "hi" ? "हाँ, सही" : "Yes, correct"}
                        </button>
                        <button onClick={handleConfirmNo}
                          className="flex-1 py-2.5 rounded-full border border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors">
                          {uiLang === "ta" ? "மீண்டும்" : uiLang === "hi" ? "फिर से" : "Redo"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {Object.entries(answers).map(([k, v]) => (
                        <div key={k} className="flex items-center gap-2 text-sm text-gray-500">
                          <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                          <span className="font-semibold capitalize">{k}:</span> <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Text input */}
                {!confirming && (
                  <div className="flex gap-2 mt-4 shrink-0">
                    <input type={REG_STEPS[regStep]?.field === "mobile" ? "tel" : "text"}
                      value={textInput} onChange={e => setTextInput(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleTextSubmit(); }}
                      placeholder={getPH(REG_STEPS[regStep], uiLang)}
                      disabled={isLoading || isSpeaking}
                      className="flex-1 rounded-full border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:border-[#ef533f] focus:ring-2 focus:ring-[#ef533f]/20 disabled:bg-gray-50 shadow-sm" />
                    <button onClick={handleTextSubmit} disabled={!textInput.trim() || isLoading}
                      className="w-11 h-11 rounded-full bg-[#ef533f] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#d94834] transition-colors shadow-sm shrink-0">
                      <Send size={15} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Post-registration chat */
              <div className="flex flex-col h-full min-h-0">
                <div className="overflow-y-auto flex-1 space-y-3 pb-2">
                  {session.conversation.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm font-medium leading-relaxed ${
                        m.role === "user" ? "bg-[#ef533f] text-white rounded-br-sm" : "bg-white border border-gray-100 shadow-sm text-[#29221C] rounded-tl-sm"}`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="px-4 py-2.5 bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                        {[0,150,300].map(d => <span key={d} className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{animationDelay:`${d}ms`}}/>)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-2 shrink-0">
                  <input value={textInput} onChange={e => setTextInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleTextSubmit(); }}
                    placeholder={uiLang === "ta" ? "தட்டச்சு செய்யவும்..." : uiLang === "hi" ? "यहाँ लिखें..." : "Type here..."}
                    disabled={isLoading || isSpeaking}
                    className="flex-1 rounded-full border border-gray-200 px-5 py-3 text-sm focus:outline-none focus:border-[#ef533f] focus:ring-2 focus:ring-[#ef533f]/20 disabled:bg-gray-50 shadow-sm" />
                  <button onClick={handleTextSubmit} disabled={!textInput.trim() || isLoading}
                    className="w-11 h-11 rounded-full bg-[#ef533f] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#d94834] transition-colors shrink-0">
                    <Send size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Mic orb */}
          <div className="flex flex-col items-center justify-center shrink-0 lg:w-64">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[#ef533f] mb-3 h-4">
              {isListening ? (uiLang === "ta" ? "கேட்கிறது..." : uiLang === "hi" ? "सुन रही हूँ..." : "LISTENING...")
                : isLoading  ? (uiLang === "ta" ? "யோசிக்கிறது..." : uiLang === "hi" ? "सोच रही हूँ..." : "THINKING...")
                : isSpeaking ? (uiLang === "ta" ? "பேசுகிறது..." : uiLang === "hi" ? "बोल रही हूँ..." : "SPEAKING...")
                : ""}
            </p>

            <div className="relative flex items-center justify-center w-40 h-40 md:w-48 md:h-48">
              {orbActive && <>
                <div className={`absolute inset-0 rounded-full ${isSpeaking ? "bg-[#FBBB75]/25" : "bg-[#ef533f]/10"} animate-ping`} style={{animationDuration:"2s"}} />
                <div className={`absolute inset-4 rounded-full ${isSpeaking ? "bg-[#FBBB75]/35" : "bg-[#ef533f]/15"} animate-ping`} style={{animationDuration:"2s", animationDelay:"0.5s"}} />
              </>}
              {isLoading && <div className="absolute inset-8 rounded-full border-4 border-dashed border-[#FBBB75] animate-spin" style={{animationDuration:"4s"}} />}
              <div className={`absolute inset-10 rounded-full transition-all ${isSpeaking ? "bg-[#FBBB75]/30" : "bg-[#ef533f]/15"}`} />
              <button onClick={handleMicPress} disabled={isLoading && !isListening}
                className={`relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 ${
                  isListening ? "bg-[#d94834] scale-110" : isLoading ? "bg-gray-400 cursor-wait" : "bg-[#ef533f] hover:bg-[#d94834]"}`}>
                <Mic size={28} strokeWidth={2.5} className={isListening ? "animate-pulse" : ""} />
              </button>
            </div>

            <p className="text-xs text-gray-400 font-medium mt-3">
              {uiLang === "ta" ? (isListening ? "பேசுங்கள்..." : "மைக்கை அழுத்துங்கள்")
               : uiLang === "hi" ? (isListening ? "बोलिए..." : "माइक दबाएं")
               : (isListening ? "Speak now..." : "Tap to speak")}
            </p>

            {!registered && (
              <div className="flex gap-1.5 mt-4 flex-wrap justify-center">
                {REG_STEPS.map((s, i) => (
                  <div key={i} className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    i < regStep ? "bg-green-50 border-green-200 text-green-600"
                    : i === regStep ? "bg-[#ef533f]/10 border-[#ef533f]/30 text-[#ef533f]"
                    : "bg-gray-50 border-gray-200 text-gray-400"}`}>
                    {uiLang === "ta" ? (s.field === "name" ? "பெயர்" : s.field === "dob" ? "வயது" : s.field === "address" ? "இடம்" : "தொலைபேசி")
                     : uiLang === "hi" ? (s.field === "name" ? "नाम" : s.field === "dob" ? "उम्र" : s.field === "address" ? "क्षेत्र" : "फ़ोन")
                     : (s.field === "name" ? "Name" : s.field === "dob" ? "Age" : s.field === "address" ? "Region" : "Phone")}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ── Click away for lang dropdown ── */}
      {showLangDrop && <div className="fixed inset-0 z-10" onClick={() => setShowLangDrop(false)} />}

      {/* ── Alerts modal ── */}
      {showAlerts && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowAlerts(false); }}>
          <div className="bg-[#FDF8F3] rounded-3xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <BellRing size={16} className="text-[#ef533f]" />
                <h2 className="font-bold text-sm text-[#29221C]">
                  {uiLang === "ta" ? "அறிவிப்புகள்" : uiLang === "hi" ? "सूचनाएं" : "Notifications"}
                </h2>
                <span className="w-5 h-5 rounded-full bg-[#ef533f] text-white text-[10px] font-bold flex items-center justify-center">{ALERTS.length}</span>
              </div>
              <button onClick={() => setShowAlerts(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"><X size={15} /></button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {ALERTS.map(a => (
                <div key={a.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex justify-between items-start mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.tagColor}`}>{a.tag}</span>
                    <span className="text-[10px] text-gray-400">{a.date}</span>
                  </div>
                  <h3 className="font-bold text-xs text-[#29221C] mb-1">
                    {uiLang === "ta" ? a.title_ta : uiLang === "hi" ? a.title_hi : a.title}
                  </h3>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {uiLang === "ta" ? a.body_ta : uiLang === "hi" ? a.body_hi : a.body}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-[#ef533f] text-[10px] font-bold">
                    <span>{uiLang === "ta" ? "மேலும் அறிக" : uiLang === "hi" ? "और जानें" : "Learn more"}</span>
                    <ChevronRight size={11} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Times-up ── */}
      {showRestReminder && (
        <RestReminder language={lang as SupportedLanguage}
          onAccept={() => { setShowRestReminder(false); setShowRangoli(true); }}
          onDismiss={() => { setShowRestReminder(false); resetTimer(); }} />
      )}
      {showRangoli && (
        <RangoliActivity language={lang as SupportedLanguage} onClose={() => { setShowRangoli(false); resetTimer(); }} />
      )}
    </div>
  );
}
