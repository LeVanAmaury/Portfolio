"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github, Zap } from "lucide-react";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-md
                 hover:border-indigo-500/50 hover:bg-white/8 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10"
    >
      {/* Image de prévisualisation (si présente) */}
      {project.image_url && (
        <div className="w-full h-32 overflow-hidden border-b border-white/10 bg-zinc-900/50">
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Si l'image n'est pas trouvée, on masque la section
              (e.target as HTMLImageElement).parentElement?.remove();
            }}
          />
        </div>
      )}

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Contenu textuel - Ajout de padding ici */}
      <div className="p-5 flex flex-col flex-1">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-white text-sm leading-tight">{project.title}</h3>
          <div className="flex gap-2 shrink-0">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={15} />
              </a>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-zinc-400 text-xs leading-relaxed mb-4 flex-1">{project.description}</p>

        {/* Highlights */}
        {project.highlights.length > 0 && (
          <ul className="mb-4 space-y-1">
            {project.highlights.slice(0, 3).map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                <Zap size={11} className="text-indigo-400 mt-0.5 shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Stack badges */}
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-indigo-500/15 px-2.5 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/20"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
