"use client";

import { motion } from "framer-motion";
import type { Skill, SkillCategory } from "@/lib/types";

interface SkillBadgeProps {
  skill: Skill;
  index?: number;
}

const CATEGORY_COLORS: Record<SkillCategory, string> = {
  Backend:  "from-orange-100 dark:from-orange-500/20 to-orange-50 dark:to-orange-600/10 border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-300",
  Frontend: "from-purple-100 dark:from-violet-500/20 to-purple-50 dark:to-violet-600/10 border-purple-200 dark:border-violet-500/30 text-purple-700 dark:text-violet-300",
  DevOps:   "from-cyan-100 dark:from-cyan-500/20 to-cyan-50 dark:to-cyan-600/10 border-cyan-200 dark:border-cyan-500/30 text-cyan-700 dark:text-cyan-300",
  Data:     "from-amber-100 dark:from-amber-500/20 to-amber-50 dark:to-amber-600/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-300",
  Autre:    "from-stone-100 dark:from-zinc-500/20 to-stone-50 dark:to-zinc-600/10 border-stone-200 dark:border-zinc-500/30 text-stone-700 dark:text-zinc-300",
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
                  ${colorClass} hover:scale-105 transition-transform duration-200 cursor-default shadow-sm`}
      title={`${LEVEL_LABELS[skill.level]} – ${skill.category}`}
    >
      <span className="text-sm font-semibold leading-none">{skill.name}</span>

      <div className="flex gap-1.5" aria-label={`Niveau ${skill.level}/5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.04 + i * 0.06, duration: 0.25, ease: "easeOut" }}
            className={`h-2 w-2 rounded-full ${
              i < skill.level ? "bg-current opacity-80" : "bg-current opacity-15"
            }`}
          />
        ))}
      </div>

      <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-stone-800 dark:bg-zinc-900 border border-stone-700 dark:border-white/10 px-2 py-0.5 text-[10px] text-white dark:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
        {LEVEL_LABELS[skill.level]}
      </span>
    </motion.div>
  );
}
