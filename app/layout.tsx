import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "NILA — உங்கள் குரல். உங்கள் சேவை. உங்கள் சுதந்திரம்.",
  description:
    "NILA is a voice-first AI assistant that helps first-time digital users independently access government services — in Tamil, Hindi, or English.",
  keywords: ["NILA", "voice assistant", "Tamil", "government services", "e-Shram", "digital inclusion"],
  authors: [{ name: "NILA" }],
  icons: {
    icon: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#E8811A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ta">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Anek+Tamil:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
