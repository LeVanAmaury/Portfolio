import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Amaury Levan – Portfolio Développeur Python",
  description:
    "Portfolio interactif d'Amaury Levan, apprenti développeur Python chez CCMO Mutuelle (Amiens). " +
    "Explorez ses projets et compétences via un chatbot IA.",
  keywords: ["portfolio", "développeur", "Python", "Next.js", "alternance", "CCMO"],
  openGraph: {
    title: "Amaury Levan – Portfolio Développeur Python",
    description: "Portfolio interactif avec chatbot IA – Apprenti développeur Python en alternance chez CCMO Mutuelle.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Script pour appliquer le thème avant le rendu (évite le flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-stone-50 dark:bg-slate-900 text-stone-900 dark:text-slate-100 antialiased transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
