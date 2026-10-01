// ── NILA Conversation Script ─────────────────────────────────────────────────
// Deterministic questions & confirmations for each step.
// All strings provided in all three primary languages + a fallback.
// The AI uses these as context but the app renders them directly.

import type { AppStep, SupportedLanguage, ApplicationData } from "./types";

type LocalizedString = Record<SupportedLanguage, string>;

// Step → question map
export const STEP_QUESTIONS: Record<string, LocalizedString> = {
  COLLECT_NAME: {
    ta: "வணக்கம்! நான் நிலா. முதலில் உங்களை பதிவு செய்வோம். உங்கள் பெயர் என்ன?",
    hi: "नमस्ते! मैं निला हूँ। पहले आपको रजिस्टर करते हैं। आपका नाम क्या है?",
    en: "Hello! I'm NILA. Let's register you first. What is your name?",
    mixed: "Hello! I'm NILA. Let's register you first. What is your name?",
  },
  COLLECT_DOB: {
    ta: "உங்கள் பிறந்த தேதி அல்லது வயது என்ன?",
    hi: "आपकी जन्म तिथि या उम्र क्या है?",
    en: "What is your date of birth or age?",
    mixed: "What is your date of birth or age?",
  },
  COLLECT_ADDRESS: {
    ta: "நீங்கள் எந்த ஊர் அல்லது மாவட்டம்? (உங்கள் பகுதி)",
    hi: "आप किस क्षेत्र या जिले से हैं?",
    en: "Which region or district are you from?",
    mixed: "Which region or district are you from?",
  },
  COLLECT_MOBILE: {
    ta: "உங்கள் மொபைல் எண் என்ன?",
    hi: "आपका मोबाइल नंबर क्या है?",
    en: "What is your mobile phone number?",
    mixed: "What is your mobile number?",
  },
  CONFIRM_ALL: {
    ta: "நன்றாக இருக்கிறது! உங்கள் பதிவு வெற்றிகரமாக முடிந்தது.",
    hi: "बढ़िया! आपका पंजीकरण सफल रहा।",
    en: "Great! Your registration is complete.",
    mixed: "Great! Your registration is successfully complete.",
  },
};

// Simpler versions for simplify requests
export const STEP_QUESTIONS_SIMPLE: Partial<Record<string, LocalizedString>> = {
  COLLECT_AADHAAR: {
    ta: "உங்கள் ஆதார் அட்டையில் உள்ள 12 இலக்க எண்ணை சொல்லுங்கள் அல்லது அதன் புகைப்படத்தை எடுத்து அனுப்புங்கள்.",
    hi: "अपने आधार कार्ड पर लिखा 12 अंकों का नंबर बताएं, या उसकी फोटो खींच कर भेजें।",
    en: "Please tell me the 12-digit number on your Aadhaar card, or send a photo of it.",
    mixed: "Tell me your 12-digit Aadhaar number, or just take a photo of your Aadhaar card and send it.",
  },
  COLLECT_DOB: {
    ta: "நீங்கள் எந்த ஆண்டு, மாதம், தேதி பிறந்தீர்கள்? உதாரணம்: 12 மார்ச் 1990.",
    hi: "आप किस साल, महीने और तारीख को पैदा हुए? उदाहरण: 12 मार्च 1990।",
    en: "What year, month and day were you born? For example: 12 March 1990.",
    mixed: "What is your birth date? For example: 12 March 1990.",
  },
  COLLECT_ADDRESS: {
    ta: "உங்கள் கிராமம் அல்லது நகரம் என்ன? மாவட்டம் என்ன?",
    hi: "आपका गाँव या शहर कौन सा है? जिला क्या है?",
    en: "What is your village or city? What is your district?",
    mixed: "What is your village/city? What district?",
  },
};

// Confirmation question templates
export function getConfirmQuestion(
  field: keyof ApplicationData,
  value: string,
  lang: SupportedLanguage
): string {
  const templates: Record<keyof ApplicationData, LocalizedString> = {
    name: {
      ta: `உங்கள் பெயர் "${value}" என்று சொன்னீர்களா?`,
      hi: `क्या आपका नाम "${value}" है?`,
      en: `Your name is "${value}", is that correct?`,
      mixed: `Your name is "${value}" — correct?`,
    },
    dob: {
      ta: `உங்கள் பிறந்த தேதி "${value}" என்று சொன்னீர்களா?`,
      hi: `क्या आपकी जन्म तिथि "${value}" है?`,
      en: `Your date of birth is "${value}", is that right?`,
      mixed: `Your DOB is "${value}" — correct?`,
    },
    aadhaar: {
      ta: "உங்கள் ஆதார் எண் \"${value}\" என்று சொன்னீர்களா?",
      hi: `क्या आपका आधार नंबर "${value}" है?`,
      en: `Your Aadhaar number is "${value}", is that correct?`,
      mixed: `Your Aadhaar is "${value}" — correct?`,
    },
    mobile: {
      ta: `உங்கள் மொபைல் எண் "${value}" என்று சொன்னீர்களா?`,
      hi: `क्या आपका मोबाइल नंबर "${value}" है?`,
      en: `Your mobile number is "${value}", is that right?`,
      mixed: `Your mobile is "${value}" — correct?`,
    },
    address: {
      ta: `உங்கள் முகவரி "${value}" என்று சொன்னீர்களா?`,
      hi: `क்या आपका पता "${value}" है?`,
      en: `Your address is "${value}", is that correct?`,
      mixed: `Your address is "${value}" — correct?`,
    },
  };
  return templates[field][lang];
}

// Correction prompts
export const CORRECTION_PROMPTS: LocalizedString = {
  ta: "பரவாயில்லை. மீண்டும் சொல்லுங்கள்.",
  hi: "कोई बात नहीं। दोबारा बताइए।",
  en: "No problem! Please say it again.",
  mixed: "No problem, please say it again.",
};

// Error / retry prompts
export const ERROR_PROMPTS: LocalizedString = {
  ta: "மன்னிக்கவும். மீண்டும் முயற்சி செய்யலாமா?",
  hi: "माफ़ करें। क्या हम दोबारा कोशिश करें?",
  en: "Sorry about that. Shall we try again?",
  mixed: "Sorry! Shall we try again?",
};

// Completion message
export const COMPLETION_MESSAGES: LocalizedString = {
  ta: "முடிந்துவிட்டது! உங்கள் தகவல்கள் தயாராகிவிட்டன.",
  hi: "हो गया! आपकी जानकारी तैयार है।",
  en: "Done! Your information is ready.",
  mixed: "Done! Your information is ready.",
};

export const COMPLETION_NEXT_STEP: LocalizedString = {
  ta: "இந்த தகவல்கள் உஜ்வாலா யோஜனா பதிவுக்கு தயாராகிவிட்டன. இது ஒரு demo. உண்மையான அரசு பதிவுக்கு அருகிலுள்ள CSC மையத்திற்கு செல்லுங்கள்.",
  hi: "यह जानकारी उज्ज्वला योजना पंजीकरण के लिए तैयार है। यह एक demo है। असली सरकारी पंजीकरण के लिए अपने पास के CSC केंद्र जाएं।",
  en: "This information is ready for Ujjwala Yojana registration. This is a demo. For the real government registration, please visit your nearest CSC centre.",
  mixed: "Your info is ready for Ujjwala Yojana. Note: this is a demo. For real registration, visit your nearest CSC centre.",
};

// Summary field labels
export const SUMMARY_LABELS: Record<keyof ApplicationData, LocalizedString> = {
  name: {
    ta: "பெயர்",
    hi: "नाम",
    en: "Name",
    mixed: "Name",
  },
  dob: {
    ta: "பிறந்த தேதி",
    hi: "जन्म तिथि",
    en: "Date of Birth",
    mixed: "Date of Birth",
  },
  aadhaar: {
    ta: "ஆதார் எண்",
    hi: "आधार नंबर",
    en: "Aadhaar",
    mixed: "Aadhaar",
  },
  mobile: {
    ta: "மொபைல்",
    hi: "मोबाइल",
    en: "Mobile",
    mixed: "Mobile",
  },
  address: {
    ta: "முகவரி",
    hi: "पता",
    en: "Address",
    mixed: "Address",
  },
};

// Yes / No button labels
export const YES_LABEL: LocalizedString = {
  ta: "ஆம் ✓",
  hi: "हाँ ✓",
  en: "Yes ✓",
  mixed: "Yes ✓",
};

export const NO_LABEL: LocalizedString = {
  ta: "இல்லை",
  hi: "नहीं",
  en: "No",
  mixed: "No",
};

// Button labels
export const REPEAT_LABEL: LocalizedString = {
  ta: "மீண்டும் சொல்லுங்கள்",
  hi: "फिर से बताइए",
  en: "Repeat",
  mixed: "Repeat",
};

export const SIMPLIFY_LABEL: LocalizedString = {
  ta: "எளிமையாக சொல்லுங்கள்",
  hi: "आसान भाषा में बताइए",
  en: "Explain Simply",
  mixed: "Explain Simpler",
};

export const TYPE_INSTEAD_LABEL: LocalizedString = {
  ta: "தட்டச்சு செய்யலாம்",
  hi: "टाइप करें",
  en: "Type Instead",
  mixed: "Type instead",
};

// Step order for next-step resolution
export const STEP_ORDER: AppStep[] = [
  "COLLECT_NAME",
  "CONFIRM_NAME",
  "COLLECT_DOB",
  "CONFIRM_DOB",
  "COLLECT_ADDRESS",
  "CONFIRM_ADDRESS",
  "COLLECT_MOBILE",
  "CONFIRM_MOBILE",
  "CONFIRM_ALL",
  "SUMMARY",
  "COMPLETE",
];

export function nextStep(current: AppStep): AppStep {
  const idx = STEP_ORDER.indexOf(current);
  if (idx < 0 || idx >= STEP_ORDER.length - 1) return "COMPLETE";
  return STEP_ORDER[idx + 1];
}

export function prevCollectStep(current: AppStep): AppStep {
  // For "go back", find the previous COLLECT_ step
  const idx = STEP_ORDER.indexOf(current);
  for (let i = idx - 1; i >= 0; i--) {
    if (STEP_ORDER[i].startsWith("COLLECT_")) return STEP_ORDER[i];
  }
  return "COLLECT_NAME";
}

export function getQuestion(step: AppStep, lang: SupportedLanguage, simplify = 0): string {
  const key = step.replace("CONFIRM_", "COLLECT_");
  if (simplify > 0 && STEP_QUESTIONS_SIMPLE[step]) {
    return STEP_QUESTIONS_SIMPLE[step]![lang];
  }
  return STEP_QUESTIONS[step]?.[lang] ?? STEP_QUESTIONS[step]?.["en"] ?? "";
}

// Map step to application data field
export const STEP_TO_FIELD: Partial<Record<AppStep, keyof ApplicationData>> = {
  COLLECT_NAME:       "name",
  CONFIRM_NAME:       "name",
  COLLECT_DOB:        "dob",
  CONFIRM_DOB:        "dob",
  COLLECT_AADHAAR:    "aadhaar",
  CONFIRM_AADHAAR:    "aadhaar",
  COLLECT_MOBILE:     "mobile",
  CONFIRM_MOBILE:     "mobile",
  COLLECT_ADDRESS:    "address",
  CONFIRM_ADDRESS:    "address",
};
