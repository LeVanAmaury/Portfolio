"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Mail, Github, Linkedin, Briefcase, Sparkles } from 'lucide-react';
import type { ResumeResponse } from '@/lib/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: ResumeResponse;
}

export function ProfileModal({ isOpen, onClose, resume }: ProfileModalProps) {
  if (!isOpen || !resume) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/40 dark:bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-3xl shadow-2xl shadow-orange-500/10 scrollbar-none"
        >
          {/* Header Image Area */}
          <div className="relative h-48 w-full bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500/20 dark:to-orange-600/20">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors z-10"
            >
              <X size={20} />
            </button>
          </div>

          <div className="px-8 pb-8">
            {/* Avatar & Title */}
            <div className="relative flex justify-between items-end -mt-16 mb-6">
              <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 bg-stone-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden shadow-lg">
                <img src="/avatar.jpg" alt="Amaury" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://ui-avatars.com/api/?name=Amaury+Le+Van&background=f97316&color=fff" }} />
              </div>
            </div>

            <h2 className="text-3xl font-bold text-stone-900 dark:text-white mb-2">{resume.name}</h2>
            <p className="text-lg font-medium text-orange-600 dark:text-orange-400 mb-4">{resume.title}</p>

            <div className="flex flex-wrap gap-4 text-sm text-stone-600 dark:text-zinc-400 mb-8">
              {resume.location && <span className="flex items-center gap-1.5"><MapPin size={16} /> {resume.location}</span>}
              <span className="flex items-center gap-1.5"><Mail size={16} /> levanamaury@gmail.com</span>
              {resume.github && (
                <a href={resume.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                  <Github size={16} /> GitHub
                </a>
              )}
              {resume.linkedin && (
                <a href={resume.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-orange-500 transition-colors">
                  <Linkedin size={16} /> LinkedIn
                </a>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <User size={16} /> À propos de moi
                </h3>
                <p className="text-stone-700 dark:text-zinc-300 leading-relaxed text-sm">
                  {resume.summary}
                </p>
                {/* Citation – À COMPLÉTER par Amaury avec sa propre citation */}
                <div className="mt-4 p-4 rounded-xl bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10">
                  <div className="flex items-start gap-2">
                    <Sparkles size={14} className="text-orange-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-stone-700 dark:text-zinc-300 italic">
                      {/* À COMPLÉTER – Remplace cette citation par une qui te représente vraiment */}
                      &ldquo;Exister est un fait, vivre est un art - Frédéric Lenoir.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-stone-500 dark:text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Briefcase size={16} /> Ma vision & Parcours
                </h3>
                <p className="text-stone-700 dark:text-zinc-300 leading-relaxed text-sm">
                  {/* À COMPLÉTER – Enrichis ce texte avec ta vraie vision */}
                  Passionné par l&apos;innovation et la résolution de problèmes, je cherche toujours à rendre les processus plus intelligents. J&apos;apprends continuellement de nouvelles technologies, notamment Python, React, et l&apos;IA, pour construire des expériences modernes et performantes. Mon objectif est d&apos;intégrer des équipes dynamiques où je peux contribuer activement au développement de solutions ambitieuses.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
