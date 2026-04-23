"use client";

import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, Sparkles } from "lucide-react";
import { useRef, useEffect } from "react";
import { MarkdownText } from "./MarkdownText";
import { ProjectsGrid, SkillsGrid, ResumeDisplay } from "@/components/GenerativeUI";
import type { Project, Skill, ResumeResponse } from "@/lib/types";

const SUGGESTIONS = [
  "Quels sont tes projets ?",
  "Ton rôle à la CCMO ?",
  "Tes compétences techniques ?",
  "Parle-moi de ton alternance",
];

// ─── Rendu d'un message individuel ───────────────────────────────────────────

function MessageBubble({ role, content, toolInvocations, isLast, isLoading }: {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: Array<{ toolName: string; state: string; result?: unknown }>;
  isLast: boolean;
  isLoading: boolean;
}) {
  const isUser = role === "user";
  
  // On n'affiche les résultats des outils que si :
  // 1. Ce n'est pas le dernier message (donc il est fini)
  // 2. OU c'est le dernier message mais le chargement est terminé
  const showTools = !isLast || !isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border
        ${isUser
          ? "bg-indigo-500/20 border-indigo-500/30"
          : "bg-violet-500/20 border-violet-500/30"}`}
      >
        {isUser ? <User size={14} className="text-indigo-400" /> : <Bot size={14} className="text-violet-400" />}
      </div>

      {/* Contenu */}
      <div className={`flex flex-col gap-3 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Texte */}
        {content && (
          <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed
            ${isUser
              ? "bg-indigo-500/20 text-indigo-50 border border-indigo-500/30 rounded-tr-sm"
              : "bg-white/8 text-zinc-100 border border-white/10 rounded-tl-sm"}`}
          >
            {!isUser ? <MarkdownText content={content} /> : content}
          </div>
        )}

        {/* Composants Générés (Tool Results) */}
        {showTools && toolInvocations?.map((tool, i) => {
          if (tool.state !== "result" || !tool.result) return null;
          return (
            <div key={i} className="w-full max-w-2xl">
              {tool.toolName === "get_projects" && (
                <ProjectsGrid projects={tool.result as Project[]} />
              )}
              {tool.toolName === "get_skills" && (
                <SkillsGrid skills={tool.result as Skill[]} />
              )}
              {tool.toolName === "get_resume" && (
                <ResumeDisplay resume={tool.result as ResumeResponse} />
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ─── Composant principal du Chat ──────────────────────────────────────────────

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput } = useChat({
    api: "/api/chat",
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSuggestion = (text: string) => {
    setInput(text);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">

      {/* Zone des messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        <AnimatePresence>
          {isEmpty ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center gap-4 pt-16"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/30 to-violet-500/30 border border-white/10 flex items-center justify-center">
                <Sparkles size={28} className="text-indigo-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Bonjour, je suis Amaury !</h2>
                <p className="text-zinc-400 text-sm max-w-sm">
                  Posez-moi n&apos;importe quelle question sur mon parcours, mes projets ou mes compétences.
                </p>
              </div>
              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSuggestion(s)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/10 hover:border-indigo-500/40 hover:text-white transition-all duration-200"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            messages.map((m) => (
              <MessageBubble
                key={m.id}
                role={m.role as "user" | "assistant"}
                content={m.content}
                toolInvocations={m.toolInvocations as Array<{ toolName: string; state: string; result?: unknown }>}
                isLast={messages.indexOf(m) === messages.length - 1}
                isLoading={isLoading}
              />
            ))
          )}
        </AnimatePresence>

        {/* Indicateur de frappe */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-violet-400" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white/8 border border-white/10 px-4 py-2.5 flex items-center gap-2">
              <Loader2 size={14} className="text-violet-400 animate-spin" />
              <span className="text-zinc-400 text-xs">En train de réfléchir…</span>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions rapides (après premier message) */}
      {!isEmpty && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSuggestion(s)}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-zinc-400 hover:bg-white/10 hover:text-white transition-all duration-200"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Barre de saisie */}
      <div className="px-4 pb-4">
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 backdrop-blur-md
                     focus-within:border-indigo-500/50 focus-within:bg-white/8 transition-all duration-200"
        >
          <input
            id="chat-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Posez votre question…"
            autoComplete="off"
            className="flex-1 bg-transparent text-sm text-white placeholder-zinc-500 outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            id="chat-send-btn"
            aria-label="Envoyer"
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-500 hover:bg-indigo-400
                       disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 shrink-0"
          >
            <Send size={14} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
