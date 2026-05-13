"use client";

import { motion } from "framer-motion";
import { GraduationCap, Calendar, MapPin } from "lucide-react";
import type { Education } from "@/lib/types";

interface EducationCardProps {
  education: Education;
  index?: number;
}

export function EducationCard({ education, index = 0 }: EducationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="relative rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm
                 hover:border-amber-300 dark:hover:border-amber-500/40 transition-colors duration-300"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="rounded-xl bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/20 p-2.5 shrink-0">
          <GraduationCap size={16} className="text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h3 className="font-semibold text-stone-900 dark:text-white text-sm">{education.degree}</h3>
          <p className="text-amber-600 dark:text-amber-300 text-xs mt-0.5">{education.institution}</p>
          <div className="flex items-center gap-3 mt-1">
            <p className="flex items-center gap-1 text-stone-400 dark:text-zinc-500 text-xs">
              <Calendar size={10} />
              {education.duration}
            </p>
            {education.location && (
              <p className="flex items-center gap-1 text-stone-400 dark:text-zinc-500 text-xs">
                <MapPin size={10} />
                {education.location}
              </p>
            )}
          </div>
        </div>
      </div>

      {education.description && (
        <p className="text-stone-500 dark:text-zinc-400 text-xs leading-relaxed ml-14">
          {education.description}
        </p>
      )}
    </motion.div>
  );
}
