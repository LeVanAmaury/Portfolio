"use client";

import { motion } from "framer-motion";
import { Github, Zap } from "lucide-react";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  index?: number;
  onClick?: () => void;
}

export function ProjectCard({ project, index = 0, onClick }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      onClick={onClick}
      className={`group relative flex flex-col rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden
                 hover:border-orange-300 dark:hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300
                 ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Image */}
      {project.image_url && (
        <div className="w-full h-32 overflow-hidden border-b border-stone-200 dark:border-white/10 bg-stone-100 dark:bg-zinc-900/50">
          <img
            src={project.image_url}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).parentElement?.remove();
            }}
          />
        </div>
      )}

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Contenu */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-stone-900 dark:text-white text-sm leading-tight">{project.title}</h3>
          <div className="flex gap-2 shrink-0">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-stone-400 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                aria-label="GitHub"
                onClick={(e) => e.stopPropagation()}
              >
                <Github size={15} />
              </a>
            )}
          </div>
        </div>

        <p className="text-stone-500 dark:text-zinc-400 text-xs leading-relaxed mb-4 flex-1">{project.description}</p>

        {project.highlights.length > 0 && (
          <ul className="mb-4 space-y-1">
            {project.highlights.slice(0, 3).map((h, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-stone-600 dark:text-zinc-300">
                <Zap size={11} className="text-orange-500 dark:text-orange-400 mt-0.5 shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-1.5 mt-auto">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full bg-orange-100 dark:bg-orange-500/15 px-2.5 py-0.5 text-[10px] font-medium text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/20"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
