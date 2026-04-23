import { Github, Linkedin, MapPin, GraduationCap, Briefcase } from "lucide-react";
import { Chat } from "@/components/Chat";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0f] relative overflow-hidden">

      {/* ─── Arrière-plan décoratif ─────────────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
        {/* Orbe haut-gauche indigo */}
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/15 blur-[120px]" />
        {/* Orbe bas-droite violet */}
        <div className="absolute -bottom-40 -right-20 w-80 h-80 rounded-full bg-violet-600/15 blur-[100px]" />
        {/* Grille subtile */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* ─── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full border-b border-white/8 bg-black/20 backdrop-blur-xl flex justify-center">
        <div className="w-full max-w-5xl px-6 py-4 flex items-center justify-between gap-4">

          {/* Identité */}
          <div className="flex items-center gap-3">
            {/* Avatar initial */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-base shrink-0 shadow-lg shadow-indigo-500/25">
              A
            </div>
            <div>
              <h1 className="text-white font-semibold text-sm leading-none">Amaury Levan</h1>
              <p className="text-zinc-400 text-xs mt-0.5 flex items-center gap-1.5">
                <Briefcase size={10} className="text-indigo-400" />
                Apprenti Développeur · CCMO Mutuelle
              </p>
            </div>
          </div>

          {/* Badges & Liens */}
          <div className="flex items-center gap-3">
            {/* Localisation */}
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-zinc-500">
              <MapPin size={10} />
              Amiens
            </span>
            {/* UPJV */}
            <span className="hidden sm:flex items-center gap-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 text-[10px] font-medium text-indigo-300">
              <GraduationCap size={10} />
              BUT Info · UPJV
            </span>
            {/* Liens sociaux */}
            <a
              href="https://github.com/LeVanAmaury"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub d'Amaury"
              className="text-zinc-500 hover:text-white transition-colors"
            >
              <Github size={16} />
            </a>
          </div>
        </div>
      </header>

      {/* ─── Zone de Chat (Main) ─────────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 w-full max-w-3xl mx-auto flex flex-col border-x border-white/5" style={{ height: "calc(100vh - 65px)" }}>
        <Chat />
      </main>

    </div>
  );
}
