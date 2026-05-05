"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, Calendar, MapPin, CheckCircle2, ExternalLink } from "lucide-react";
import type { Experience } from "@/lib/types";
import { useEffect } from "react";

interface ExperienceModalProps {
  experience: Experience | null;
  onClose: () => void;
}

export function ExperienceModal({ experience, onClose }: ExperienceModalProps) {
  useEffect(() => {
    if (experience) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [experience]);

  return (
    <AnimatePresence>
      {experience && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col"
            >
              <div className="relative p-6 sm:p-8 border-b border-stone-200 dark:border-white/5 bg-gradient-to-br from-orange-50 dark:from-orange-500/10 to-transparent">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0">
                      <Briefcase className="text-orange-600 dark:text-orange-400" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-stone-900 dark:text-white leading-tight">{experience.role}</h2>
                      <p className="text-orange-600 dark:text-orange-300 font-medium">{experience.company}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-500 dark:text-zinc-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mt-6 text-xs text-stone-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-orange-500/70" />
                    {experience.duration}
                  </div>
                  {experience.location && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-orange-500/70" />
                      {experience.location}
                    </div>
                  )}
                  {experience.website_url && (
                    <a
                      href={experience.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
                    >
                      <ExternalLink size={14} className="text-orange-500/70" />
                      Site web
                    </a>
                  )}
                  {experience.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-white/5 border border-stone-200 dark:border-white/10 text-stone-600 dark:text-zinc-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest">Missions & Réalisations</h4>
                  <div className="space-y-3">
                    {experience.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-start gap-3 group">
                        <div className="mt-1.5 shrink-0">
                          <CheckCircle2 size={14} className="text-orange-400/60 group-hover:text-orange-500 transition-colors" />
                        </div>
                        <p className="text-sm text-stone-600 dark:text-zinc-300 leading-relaxed">{achievement}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
