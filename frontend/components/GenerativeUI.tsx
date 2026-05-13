"use client";

/**
 * GenerativeUI – Composants visuels pour les résultats d'outils IA
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Cpu, User, Mail, CheckCircle2, Github, Linkedin, Download, Globe, Send, Loader2, BookOpen, Quote, Target, GraduationCap, Lightbulb, Shield, Sparkles } from "lucide-react";

import { ProjectCard } from "@/components/ui/ProjectCard";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { ExperienceModal } from "@/components/ui/ExperienceModal";
import { ProfileModal } from "@/components/ui/ProfileModal";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import { ReferenceCard } from "@/components/ui/ReferenceCard";
import { EducationCard } from "@/components/ui/EducationCard";
import type { Project, Skill, ResumeResponse, Experience, Reference, PortfolioNarrative, Education } from "@/lib/types";

// ─── Sous-composants ────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="rounded-lg bg-orange-100 dark:bg-white/10 p-1.5 border border-orange-200 dark:border-white/10">
        <Icon size={13} className="text-orange-600 dark:text-orange-400" />
      </div>
      <span className="text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// ─── Projets ──────────────────────────────────────────────────────────────────

export function ProjectsGrid({ projects }: { projects: Project[] }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!Array.isArray(projects) || !projects.length) {
    return <p className="text-sm text-stone-400 dark:text-zinc-500 italic">Aucun projet trouvé.</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
      <SectionHeader icon={LayoutGrid} label={`${projects.length} projet${projects.length > 1 ? "s" : ""}`} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} onClick={() => setSelectedProject(p)} />
        ))}
      </div>
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </motion.div>
  );
}

// ─── Compétences ──────────────────────────────────────────────────────────────

export function SkillsGrid({ skills }: { skills: Skill[] }) {
  if (!Array.isArray(skills)) {
    return <p className="text-sm text-stone-400 dark:text-zinc-500 italic">Données de compétences invalides.</p>;
  }

  const grouped = skills.reduce<Record<string, Skill[]>>((acc, s) => {
    acc[s.category] = [...(acc[s.category] ?? []), s];
    return acc;
  }, {});

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
      <SectionHeader icon={Cpu} label="Compétences techniques" />
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <p className="text-[10px] font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest mb-2">{category}</p>
            <div className="flex flex-wrap gap-2">
              {items.map((s, i) => (
                <SkillBadge key={s.id} skill={s} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Résumé ───────────────────────────────────────────────────────────────────

export function ResumeDisplay({ resume }: { resume: ResumeResponse }) {
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  if (!resume || typeof resume !== 'object') {
    return <p className="text-sm text-stone-400 dark:text-zinc-500 italic">Données du CV indisponibles.</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-4">
      {/* Profil */}
      <button
        onClick={() => setProfileModalOpen(true)}
        className="w-full text-left rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-md transition-all group"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <SectionHeader icon={User} label="Profil" />
            <h3 className="font-bold text-stone-900 dark:text-white text-base group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{resume.name}</h3>
            <p className="text-orange-600 dark:text-orange-300 text-sm mt-0.5">{resume.title}</p>
          </div>
          {resume.resume_url && (
            <a
              href={resume.resume_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-100 dark:bg-orange-500/20 border border-orange-200 dark:border-orange-500/30 text-[10px] text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-500/30 transition-all"
            >
              <Download size={12} />
              Mon CV
            </a>
          )}
        </div>
        <p className="text-stone-500 dark:text-zinc-400 text-xs mt-2 leading-relaxed">{resume.summary}</p>
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-stone-500 dark:text-zinc-500">
          {resume.location && <span>📍 {resume.location}</span>}
          {resume.github && (
            <a href={resume.github} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-white transition-colors">
              <Github size={12} /> GitHub
            </a>
          )}
          {resume.linkedin && (
            <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-white transition-colors">
              <Linkedin size={12} /> LinkedIn
            </a>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-white/5 flex justify-end">
          <span className="text-[10px] text-orange-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Voir la présentation complète &rarr;
          </span>
        </div>
      </button>

      {/* Éducation */}
      {resume?.education && Array.isArray(resume.education) && resume.education.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest mb-3">Formation</p>
          <div className="space-y-3">
            {resume.education.map((edu, i) => (
              <EducationCard key={edu.id} education={edu} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Expériences */}
      {resume?.experiences && Array.isArray(resume.experiences) && resume.experiences.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest mb-3">Expériences</p>
          <div className="space-y-3">
            {resume.experiences.map((e, i) => (
              <ExperienceCard
                key={e.id}
                experience={e}
                index={i}
                onClick={() => setSelectedExperience(e)}
              />
            ))}
          </div>
        </div>
      )}

      <ExperienceModal
        experience={selectedExperience}
        onClose={() => setSelectedExperience(null)}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        resume={resume}
      />
    </motion.div>
  );
}

// ─── Références / Recommandations ─────────────────────────────────────────────

export function ReferencesDisplay({ references }: { references: Reference[] }) {
  if (!Array.isArray(references) || !references.length) {
    return <p className="text-sm text-stone-400 dark:text-zinc-500 italic">Aucune référence disponible.</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
      <SectionHeader icon={Quote} label={`${references.length} recommandation${references.length > 1 ? "s" : ""}`} />
      <div className="grid grid-cols-1 gap-3">
        {references.map((ref, i) => (
          <ReferenceCard key={ref.id} reference={ref} index={i} />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Narratif introspectif ────────────────────────────────────────────────────

export function NarrativeDisplay({ narrative }: { narrative: PortfolioNarrative }) {
  if (!narrative || typeof narrative !== 'object') {
    return <p className="text-sm text-stone-400 dark:text-zinc-500 italic">Narratif indisponible.</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-4">

      {/* Citation personnelle */}
      <div className="rounded-2xl border border-orange-200 dark:border-orange-500/20 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-500/10 dark:to-amber-500/5 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-orange-100 dark:bg-orange-500/20 p-2 shrink-0">
            <Sparkles size={16} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-stone-700 dark:text-zinc-200 text-sm italic leading-relaxed">
              &ldquo;{narrative.personal_quote}&rdquo;
            </p>
            <p className="text-orange-600 dark:text-orange-400 text-xs font-medium mt-2">— Amaury Le Van</p>
          </div>
        </div>
      </div>

      {/* Objectif + Spécialité + Métier visé */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-orange-500" />
            <span className="text-[10px] font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest">Objectif</span>
          </div>
          <p className="text-stone-700 dark:text-zinc-300 text-xs leading-relaxed">{narrative.objective}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb size={14} className="text-purple-500" />
            <span className="text-[10px] font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest">Spécialité</span>
          </div>
          <p className="text-stone-700 dark:text-zinc-300 text-xs leading-relaxed">{narrative.specialty}</p>
        </div>
        <div className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap size={14} className="text-emerald-500" />
            <span className="text-[10px] font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest">Métier visé</span>
          </div>
          <p className="text-stone-700 dark:text-zinc-300 text-xs leading-relaxed">{narrative.target_job}</p>
        </div>
      </div>

      {/* Narratif principal */}
      <div className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={14} className="text-orange-500" />
          <span className="text-[10px] font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest">Mon parcours</span>
        </div>
        <div className="text-stone-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
          {narrative.narrative_text}
        </div>
      </div>

      {/* Réflexion sur les acquis */}
      {narrative.skills_reflection && (
        <div className="rounded-2xl border border-purple-200 dark:border-violet-500/20 bg-purple-50/50 dark:bg-violet-500/5 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-purple-500 dark:text-violet-400" />
            <span className="text-[10px] font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest">Réflexion sur mes acquis</span>
          </div>
          <div className="text-stone-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
            {narrative.skills_reflection}
          </div>
        </div>
      )}

      {/* Difficultés surmontées */}
      {narrative.difficulties_overcome && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-emerald-500 dark:text-emerald-400" />
            <span className="text-[10px] font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest">Difficultés surmontées</span>
          </div>
          <div className="text-stone-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
            {narrative.difficulties_overcome}
          </div>
        </div>
      )}

      {/* Compétences PN */}
      {narrative.pn_competencies && narrative.pn_competencies.length > 0 && (
        <div className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={14} className="text-orange-500" />
            <span className="text-[10px] font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest">Compétences PN – BUT Informatique</span>
          </div>
          <div className="space-y-3">
            {narrative.pn_competencies.map((comp, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5">
                <div className="w-6 h-6 rounded-md bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">{i + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-white">{comp.competence}</h4>
                  <p className="text-xs text-purple-600 dark:text-violet-300 font-medium mt-0.5">Niveau : {comp.level}</p>
                  <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 leading-relaxed">{comp.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Formulaire de contact ────────────────────────────────────────────────────

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      const res = await fetch(`${backendUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) setStatus("success");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-md w-full">
      {status === "success" ? (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-green-500/10 border border-emerald-200 dark:border-green-500/20 text-emerald-700 dark:text-green-400">
          <CheckCircle2 size={20} />
          <div className="flex flex-col">
            <span className="text-sm font-bold">Message envoyé ! 🎉</span>
            <span className="text-[11px] opacity-80">Amaury vous recontactera très vite.</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 space-y-3 shadow-sm">
          <h3 className="text-sm font-bold text-stone-800 dark:text-white mb-2">Envoyer un message</h3>
          <input 
            type="text" name="name" required placeholder="Votre nom" 
            className="w-full text-sm p-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
          />
          <input 
            type="email" name="email" required placeholder="Votre email" 
            className="w-full text-sm p-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all dark:text-white"
          />
          <textarea 
            name="message" required placeholder="Votre message..." rows={3}
            className="w-full text-sm p-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none dark:text-white"
          />
          {status === "error" && <p className="text-red-500 text-xs">Une erreur est survenue. Veuillez réessayer.</p>}
          <button 
            type="submit" disabled={status === "submitting"}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold transition-all disabled:opacity-50"
          >
            {status === "submitting" ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Envoyer
          </button>
        </form>
      )}

      <div className="p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 space-y-3 shadow-sm">
        <p className="text-[10px] font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest">En attendant, retrouvez-moi ici :</p>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Mail size={14} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-medium">Email</span>
              <span className="text-xs text-stone-700 dark:text-zinc-300 truncate">levanamaury@gmail.com</span>
            </div>
          </div>
          <a href="https://www.linkedin.com/in/amaury-le-van-6ab822346/" target="_blank" className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Linkedin size={14} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-medium">LinkedIn</span>
              <span className="text-xs text-stone-700 dark:text-zinc-300 truncate">Amaury Le Van</span>
            </div>
          </a>
          <a href="https://github.com/LeVanAmaury" target="_blank" className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5 hover:bg-stone-100 dark:hover:bg-white/10 transition-colors">
            <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-zinc-500/10 flex items-center justify-center text-stone-600 dark:text-zinc-300">
              <Github size={14} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-medium">GitHub</span>
              <span className="text-xs text-stone-700 dark:text-zinc-300 truncate">LeVanAmaury</span>
            </div>
          </a>
          <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-green-500/10 flex items-center justify-center text-emerald-600 dark:text-green-400">
              <Globe size={14} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-medium">Téléphone</span>
              <span className="text-xs text-stone-700 dark:text-zinc-300 truncate">06 46 29 15 39</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
