"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Github, Zap, Rocket } from "lucide-react";
import type { Project } from "@/lib/types";
import { useEffect } from "react";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  useEffect(() => {
    if (project) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [project]);

  return (
    <AnimatePresence>
      {project && (
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
              className="w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 border border-stone-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl pointer-events-auto flex flex-col"
            >
              {/* Header Image */}
              <div className="relative w-full h-48 sm:h-64 bg-stone-100 dark:bg-zinc-900 overflow-hidden">
                {project.image_url ? (
                  <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-orange-500/20 to-purple-600/20 flex items-center justify-center">
                    <Rocket size={48} className="text-orange-400/40" />
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">{project.title}</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 text-[11px] font-medium text-orange-700 dark:text-orange-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <p className="text-stone-600 dark:text-zinc-300 text-sm leading-relaxed">{project.description}</p>
                </div>

                {project.highlights.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Zap size={14} className="text-orange-500" /> Points clés
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {project.highlights.map((h, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5">
                          <div className="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">{i + 1}</span>
                          </div>
                          <span className="text-xs text-stone-600 dark:text-zinc-300 leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center gap-4 pt-4 border-t border-stone-200 dark:border-white/5">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-900 dark:text-white text-sm font-medium border border-stone-200 dark:border-white/10 transition-all"
                    >
                      <Github size={18} /> Code source
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
