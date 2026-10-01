"use client";

import type { SupportedLanguage } from "@/lib/nila/types";

interface CompletionViewProps {
  language: SupportedLanguage;
  name?:    string;
}

const COMPLETE_TITLE: Record<SupportedLanguage, string> = {
  ta:    "முடிந்துவிட்டது! 🌸",
  hi:    "हो गया! 🌸",
  en:    "All done! 🌸",
  mixed: "All done! 🌸",
};

const COMPLETE_SUBTITLE: Record<SupportedLanguage, string> = {
  ta:    "உங்கள் தகவல்கள் தயாராகிவிட்டன.",
  hi:    "आपकी जानकारी तैयार है।",
  en:    "Your information is ready.",
  mixed: "Your information is ready.",
};

const COMPLETE_NEXT: Record<SupportedLanguage, string> = {
  ta:    "அருகிலுள்ள CSC மையத்திற்கு சென்று உண்மையான பதிவை முடிக்கலாம். இது ஒரு demo மட்டுமே.",
  hi:    "असली पंजीकरण के लिए पास के CSC केंद्र जाएं। यह केवल एक demo है।",
  en:    "Visit your nearest CSC centre to complete the real registration. This was a demo only.",
  mixed: "Visit your nearest CSC centre to complete real registration. This was a demo only.",
};

const COMPLETE_SAVE: Record<SupportedLanguage, string> = {
  ta:    "உங்கள் தகவல்களை சேமிக்க வேண்டுமா? (விரும்பினால் மட்டும்)",
  hi:    "क्या आप अपनी जानकारी सहेजना चाहते हैं? (वैकल्पिक)",
  en:    "Would you like to save your information? (Optional)",
  mixed: "Would you like to save your info? (Optional)",
};

interface Props {
  language: SupportedLanguage;
  name?:    string;
  onSave?:  () => void;
}

export function CompletionView({ language, name, onSave }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-4 animate-fade_in text-center">
      {/* Illustration */}
      <div className="text-7xl animate-bounce_gentle select-none" aria-hidden="true">
        🌸
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-text">
          {name ? `${name}! ` : ""}{COMPLETE_TITLE[language]}
        </h1>
        <p className="text-lg text-textMuted">{COMPLETE_SUBTITLE[language]}</p>
      </div>

      {/* Next steps card with Map */}
      <div className="card w-full px-5 py-4 text-left">
        <p className="text-base text-text leading-relaxed">
          📍 {COMPLETE_NEXT[language]}
        </p>
        
        <div className="mt-4 rounded-xl overflow-hidden shadow-sm border border-black/10">
            <iframe 
                width="100%" 
                height="200" 
                frameBorder="0" 
                scrolling="no" 
                src="https://www.openstreetmap.org/export/embed.html?bbox=79.1300%2C10.7600%2C79.1500%2C10.7800&layer=mapnik&marker=10.7700%2C79.1400" 
                style={{ border: 0 }}
            ></iframe>
            <div className="bg-primary-50 p-2 text-sm text-primary-700 text-center font-medium border-t border-primary-100">
                {language === "ta" ? "அருகிலுள்ள CSC மையம்" : language === "hi" ? "निकटतम CSC केंद्र" : "Nearest CSC Centre"}
            </div>
        </div>
      </div>

      {/* Optional save action */}
      {onSave && (
        <div className="w-full">
          <p className="text-sm text-textMuted text-center mb-3">
            {COMPLETE_SAVE[language]}
          </p>
          <button
            id="nila-save-btn"
            type="button"
            onClick={onSave}
            className="w-full h-14 rounded-2xl border-2 border-primary-400 text-primary-600 text-lg font-medium hover:bg-primary-50 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-500/50"
          >
            💾{" "}
            {language === "ta" ? "சேமிக்கவும்"
             : language === "hi" ? "सहेजें"
             : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
