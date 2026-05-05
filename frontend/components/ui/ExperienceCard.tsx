"use client";

import { motion } from "framer-motion";
import { Building2, Calendar, CheckCircle2 } from "lucide-react";
import type { Experience } from "@/lib/types";

interface ExperienceCardProps {
  experience: Experience;
  index?: number;
  onClick?: () => void;
}

export function ExperienceCard({ experience, index = 0, onClick }: ExperienceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      onClick={onClick}
      className={`relative rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm
                 hover:border-purple-300 dark:hover:border-violet-500/40 transition-colors duration-300
                 ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Badge "En poste" */}
      {experience.is_current && (
        <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-green-500/15 border border-emerald-200 dark:border-green-500/30 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-green-400 animate-pulse" />
          En poste
        </span>
      )}

      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-xl bg-purple-100 dark:bg-violet-500/15 border border-purple-200 dark:border-violet-500/20 p-2.5 shrink-0">
          <Building2 size={16} className="text-purple-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-white text-sm">{experience.company}</h3>
          <p className="text-purple-600 dark:text-violet-300 text-xs mt-0.5">{experience.role}</p>
          <p className="flex items-center gap-1 text-stone-400 dark:text-zinc-500 text-xs mt-1">
            <Calendar size={10} />
            {experience.duration}
          </p>
        </div>
      </div>

      <ul className="space-y-1.5 mb-4">
        {experience.achievements.map((a, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-stone-600 dark:text-zinc-300">
            <CheckCircle2 size={11} className="text-purple-500 dark:text-violet-400 mt-0.5 shrink-0" />
            <span>{a}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-1.5">
        {experience.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-purple-100 dark:bg-violet-500/10 border border-purple-200 dark:border-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:text-violet-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
