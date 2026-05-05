"use client";

import { Github, MapPin, GraduationCap, Briefcase, Sun, Moon, Linkedin } from "lucide-react";
import { Chat } from "@/components/Chat";
import { useState, useEffect } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Changer le thème"
      className="p-2 rounded-xl bg-stone-200/80 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 transition-all duration-200"
    >
      {dark ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-600" />}
    </button>
  );
}

export default function HomePage() {
  // Réveil du backend Render (gratuit) dès l'ouverture de la page
  useEffect(() => {
    // URL publique ou fallback
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "https://portfolio-backend-s2w9.onrender.com";
    fetch(`${backendUrl}/health`).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">

      {/* ─── Arrière-plan décoratif ─────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        {/* Orbe chaud haut-gauche */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-orange-400/15 dark:bg-orange-500/10 blur-[120px]" />
        {/* Orbe violet bas-droite */}
        <div className="absolute -bottom-32 -right-20 w-[400px] h-[400px] rounded-full bg-purple-400/15 dark:bg-violet-600/10 blur-[100px]" />
        {/* Orbe émeraude centre */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-emerald-400/8 dark:bg-emerald-500/5 blur-[80px]" />
        {/* Grille subtile */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full border-b border-stone-200/80 dark:border-white/10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl flex justify-center">
        <div className="w-full max-w-5xl px-6 py-4 flex items-center justify-between gap-4">

          {/* Identité */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg shadow-orange-500/25 dark:shadow-orange-500/15">
              A
            </div>
            <div>
              <h1 className="text-stone-900 dark:text-white font-semibold text-sm leading-none">Amaury Levan</h1>
              <p className="text-stone-500 dark:text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                <Briefcase size={10} className="text-orange-500" />
                Apprenti Développeur · CCMO Mutuelle
              </p>
            </div>
          </div>

          {/* Badges & Liens */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-stone-500 dark:text-slate-500">
              <MapPin size={10} />
              Amiens
            </span>
            <span className="hidden sm:flex items-center gap-1 rounded-full bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 px-2.5 py-1 text-[10px] font-medium text-orange-700 dark:text-orange-300">
              <GraduationCap size={10} />
              BUT Info · UPJV
            </span>
            <a
              href="https://github.com/LeVanAmaury"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="p-2 rounded-xl bg-stone-200/80 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white transition-all"
            >
              <Github size={16} />
            </a>
            <a
              href="https://www.linkedin.com/in/amaury-le-van-6ab822346/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="p-2 rounded-xl bg-stone-200/80 dark:bg-white/10 hover:bg-stone-300 dark:hover:bg-white/20 text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white transition-all"
            >
              <Linkedin size={16} />
            </a>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─── Zone de Chat (Main) ─────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto flex flex-col" style={{ height: "calc(100vh - 65px)" }}>
        <Chat />
      </main>

    </div>
  );
}
