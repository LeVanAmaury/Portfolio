"use client";

/**
 * GenerativeUI – Composants visuels pour les résultats d'outils IA
 */

import { motion } from "framer-motion";
import { LayoutGrid, Cpu, User, Mail, CheckCircle2, Github, Linkedin, Download, Globe } from "lucide-react";

import { ProjectCard } from "@/components/ui/ProjectCard";
import { ProjectModal } from "@/components/ui/ProjectModal";
import { ExperienceModal } from "@/components/ui/ExperienceModal";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import type { Project, Skill, ResumeResponse, Experience } from "@/lib/types";
import { useState } from "react";

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

  if (!resume || typeof resume !== 'object') {
    return <p className="text-sm text-stone-400 dark:text-zinc-500 italic">Données du CV indisponibles.</p>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full space-y-4">
      {/* Profil */}
      <div className="rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <SectionHeader icon={User} label="Profil" />
            <h3 className="font-bold text-stone-900 dark:text-white text-base">{resume.name}</h3>
            <p className="text-orange-600 dark:text-orange-300 text-sm mt-0.5">{resume.title}</p>
          </div>
          {resume.resume_url && (
            <a
              href={resume.resume_url}
              target="_blank"
              rel="noopener noreferrer"
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
            <a href={resume.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-white transition-colors">
              <Github size={12} /> GitHub
            </a>
          )}
          {resume.linkedin && (
            <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-stone-900 dark:hover:text-white transition-colors">
              <Linkedin size={12} /> LinkedIn
            </a>
          )}
        </div>
      </div>

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
    </motion.div>
  );
}

export function ContactSuccess() {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-green-500/10 border border-emerald-200 dark:border-green-500/20 text-emerald-700 dark:text-green-400">
        <CheckCircle2 size={20} />
        <div className="flex flex-col">
          <span className="text-sm font-bold">Message envoyé ! 🎉</span>
          <span className="text-[11px] opacity-80">Amaury vous recontactera très vite.</span>
        </div>
      </div>

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
