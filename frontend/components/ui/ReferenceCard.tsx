"use client";

import { motion } from "framer-motion";
import { Quote, Building2, UserCircle } from "lucide-react";
import type { Reference } from "@/lib/types";

interface ReferenceCardProps {
  reference: Reference;
  index?: number;
}

export function ReferenceCard({ reference, index = 0 }: ReferenceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      className="group relative rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 p-5 shadow-sm
                 hover:border-emerald-300 dark:hover:border-emerald-500/40 transition-all duration-300"
    >
      {/* Quote icon */}
      <div className="absolute top-4 right-4 text-emerald-200 dark:text-emerald-500/20">
        <Quote size={28} />
      </div>

      {/* Citation */}
      <blockquote className="text-sm text-stone-600 dark:text-zinc-300 leading-relaxed italic mb-4 pr-8">
        &ldquo;{reference.quote}&rdquo;
      </blockquote>

      {/* Separator */}
      <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-200 dark:from-emerald-500 dark:to-emerald-700 rounded-full mb-4" />

      {/* Author */}
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/20 p-2.5 shrink-0">
          <UserCircle size={16} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h4 className="font-semibold text-stone-900 dark:text-white text-sm">{reference.name}</h4>
          <p className="text-emerald-600 dark:text-emerald-300 text-xs mt-0.5">{reference.role}</p>
          <p className="flex items-center gap-1 text-stone-400 dark:text-zinc-500 text-xs mt-1">
            <Building2 size={10} />
            {reference.company}
          </p>
          <p className="text-stone-400 dark:text-zinc-500 text-[10px] mt-1 italic">{reference.relationship}</p>
        </div>
      </div>
    </motion.div>
  );
}
