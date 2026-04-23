import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Amaury Levan – Portfolio Développeur Python",
  description:
    "Portfolio interactif d'Amaury Levan, apprenti développeur Python chez CCMO Mutuelle (Amiens). " +
    "Explorez ses projets et compétences via un chatbot IA propulsé par Google Gemini.",
  keywords: ["portfolio", "développeur", "Python", "Next.js", "alternance", "CCMO"],
  openGraph: {
    title: "Amaury Levan – Portfolio Développeur Python",
    description: "Portfolio interactif avec chatbot IA – Apprenti développeur Python en alternance chez CCMO Mutuelle.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="bg-[#0a0a0f] text-white antialiased">{children}</body>
    </html>
  );
}
