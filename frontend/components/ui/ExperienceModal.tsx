"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Briefcase, Calendar, MapPin, CheckCircle2 } from "lucide-react";
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
    return () => {
      document.body.style.overflow = "unset";
    };
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-[#0f0f1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col"
            >
              <div className="relative p-6 sm:p-8 border-b border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                      <Briefcase className="text-indigo-400" size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white leading-tight">{experience.role}</h2>
                      <p className="text-indigo-300 font-medium">{experience.company}</p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mt-6 text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-indigo-400/70" />
                    {experience.duration}
                  </div>
                  {experience.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Missions & Réalisations</h4>
                  <div className="space-y-3">
                    {experience.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-start gap-3 group">
                        <div className="mt-1.5 shrink-0">
                          <CheckCircle2 size={14} className="text-indigo-500/60 group-hover:text-indigo-400 transition-colors" />
                        </div>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          {achievement}
                        </p>
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
