"use client";

import { motion } from "framer-motion";
import type { Skill, SkillCategory } from "@/lib/types";

interface SkillBadgeProps {
  skill: Skill;
  index?: number;
}

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Backend:  "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-300",
  Frontend: "from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-300",
  DevOps:   "from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-300",
  Data:     "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-300",
  Autre:    "from-zinc-500/20 to-zinc-600/10 border-zinc-500/30 text-zinc-300",
};

const LEVEL_LABELS: Record<number, string> = {
  1: "Découverte",
  2: "Notions",
  3: "Pratique",
  4: "Maîtrise",
  5: "Expert",
};

export function SkillBadge({ skill, index = 0 }: SkillBadgeProps) {
  const colorClass = CATEGORY_COLORS[skill.category] ?? CATEGORY_COLORS["Autre"];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "backOut" }}
      className={`group relative flex flex-col gap-2 rounded-xl border bg-gradient-to-br px-4 py-3
                  ${colorClass} backdrop-blur-sm hover:scale-105 transition-transform duration-200 cursor-default`}
      title={`${LEVEL_LABELS[skill.level]} – ${skill.category}`}
    >
      {/* Nom */}
      <span className="text-sm font-semibold leading-none">{skill.name}</span>

      {/* Barre de niveau */}
      <div className="flex gap-1" aria-label={`Niveau ${skill.level}/5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.04 + i * 0.06, duration: 0.25, ease: "easeOut" }}
            className={`h-1 flex-1 rounded-full origin-left ${
              i < skill.level ? "bg-current opacity-80" : "bg-current opacity-15"
            }`}
          />
        ))}
      </div>

      {/* Label niveau (au survol) */}
      <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-zinc-900 border border-white/10 px-2 py-0.5 text-[10px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        {LEVEL_LABELS[skill.level]}
      </span>
    </motion.div>
  );
}
