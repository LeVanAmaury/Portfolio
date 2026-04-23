"use client";

import { motion } from "framer-motion";
import { Building2, Calendar, CheckCircle2 } from "lucide-react";
import type { Experience } from "@/lib/types";

interface ExperienceCardProps {
  experience: Experience;
  index?: number;
}

export function ExperienceCard({ experience, index = 0 }: ExperienceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="relative rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md
                 hover:border-violet-500/40 transition-colors duration-300"
    >
      {/* Badge "En poste" */}
      {experience.is_current && (
        <span className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-green-500/15 border border-green-500/30 px-2.5 py-0.5 text-[10px] font-medium text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          En poste
        </span>
      )}

      {/* En-tête */}
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-xl bg-violet-500/15 border border-violet-500/20 p-2.5 shrink-0">
          <Building2 size={16} className="text-violet-400" />
        </div>
        <div>
          <h3 className="font-semibold text-white text-sm">{experience.company}</h3>
          <p className="text-violet-300 text-xs mt-0.5">{experience.role}</p>
          <p className="flex items-center gap-1 text-zinc-500 text-xs mt-1">
            <Calendar size={10} />
            {experience.duration}
          </p>
        </div>
      </div>

      {/* Réalisations */}
      <ul className="space-y-1.5 mb-4">
        {experience.achievements.map((a, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
            <CheckCircle2 size={11} className="text-violet-400 mt-0.5 shrink-0" />
            <span>{a}</span>
          </li>
        ))}
      </ul>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {experience.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
