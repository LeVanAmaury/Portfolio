"use client";

import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, Sparkles, Trash2, AlertCircle } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { MarkdownText } from "./MarkdownText";
import { ProjectsGrid, SkillsGrid, ResumeDisplay, ContactSuccess } from "@/components/GenerativeUI";
import type { ResumeResponse } from "@/lib/types";

const SUGGESTIONS = [
  { text: "Quels sont tes projets ?", emoji: "🚀" },
  { text: "Ton rôle à la CCMO ?", emoji: "💼" },
  { text: "Tes compétences techniques ?", emoji: "⚡" },
  { text: "Parle-moi de ton alternance", emoji: "🎓" },
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
          ? "bg-orange-100 dark:bg-orange-500/20 border-orange-200 dark:border-orange-500/30"
          : "bg-purple-100 dark:bg-violet-500/20 border-purple-200 dark:border-violet-500/30"}`}
      >
        {isUser
          ? <User size={14} className="text-orange-600 dark:text-orange-400" />
          : <Bot size={14} className="text-purple-600 dark:text-violet-400" />
        }
      </div>

      {/* Contenu */}
      <div className={`flex flex-col gap-3 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Texte */}
        {(content || (toolInvocations && toolInvocations.length > 0)) ? (
          <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed
            ${isUser
              ? "bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm shadow-lg shadow-orange-500/20"
              : "bg-white dark:bg-white/10 text-stone-800 dark:text-slate-100 border border-stone-200 dark:border-white/10 rounded-tl-sm shadow-sm"}`}
          >
            {isUser
              ? content
              : (content
                ? <MarkdownText content={content} />
                : <span className="text-stone-400 dark:text-zinc-500 italic">Analyse en cours...</span>
              )
            }
          </div>
        ) : null}

        {/* Composants Générés (Tool Results) */}
        {showTools && toolInvocations?.map((tool, i) => {
          if (tool.state === "call") {
            return (
              <div key={i} className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-zinc-500 animate-pulse">
                <Loader2 size={10} className="animate-spin" />
                Récupération des données ({tool.toolName})...
              </div>
            );
          }

          if (tool.state !== "result" || !tool.result) return null;

          return (
            <div key={i} className="w-full max-w-2xl mt-2">
              {tool.toolName === "get_projects" && (
                <ProjectsGrid projects={(tool.result as any).projects || tool.result} />
              )}
              {tool.toolName === "get_skills" && (
                <SkillsGrid skills={(tool.result as any).skills || tool.result} />
              )}
              {tool.toolName === "get_resume" && (
                <ResumeDisplay resume={tool.result as ResumeResponse} />
              )}
              {tool.toolName === "submit_contact_form" && (
                <ContactSuccess />
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
  const [error, setError] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error("Chat error:", err);
      setError("L'IA n'a pas pu répondre. Réessayez dans quelques secondes ! 🔄");
      setTimeout(() => setError(null), 5000);
    },
    onFinish: () => {
      setError(null);
    },
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Charger les messages sauvegardés
  useEffect(() => {
    const saved = localStorage.getItem("portfolio-chat-history");
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        localStorage.removeItem("portfolio-chat-history");
      }
    }
    setIsInitialLoad(false);
  }, [setMessages]);

  // Sauvegarder les messages
  useEffect(() => {
    if (!isInitialLoad && messages.length > 0) {
      localStorage.setItem("portfolio-chat-history", JSON.stringify(messages));
    }
  }, [messages, isInitialLoad]);

  const clearChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem("portfolio-chat-history");
  }, [setMessages]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll intelligent
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 150;
    if (isAtBottom || isLoading) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: isLoading ? "auto" : "smooth",
          block: "end"
        });
      });
    }
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-full">

      {/* Zone des messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-6"
      >
        <AnimatePresence>
          {isEmpty ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full text-center gap-5 pt-16"
            >
              {/* Icône animée */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-600 flex items-center justify-center shadow-xl shadow-orange-500/25 animate-float">
                  <Sparkles size={32} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                  <span className="text-[10px]">👋</span>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-stone-900 dark:text-white mb-2">
                  Hey ! Moi c&apos;est Amaury 🔥
                </h2>
                <p className="text-stone-500 dark:text-slate-400 text-sm max-w-md">
                  Curieux, passionné et toujours prêt à apprendre. Posez-moi n&apos;importe quelle question sur mon parcours, mes projets ou mes compétences !
                </p>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.text}
                    onClick={() => setInput(s.text)}
                    className="rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-xs text-stone-700 dark:text-slate-300
                               hover:bg-orange-50 dark:hover:bg-white/10 hover:border-orange-300 dark:hover:border-orange-500/40 hover:text-orange-700 dark:hover:text-orange-300
                               transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <span className="mr-1.5">{s.emoji}</span>
                    {s.text}
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
            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-violet-500/20 border border-purple-200 dark:border-violet-500/30 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-purple-600 dark:text-violet-400" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-white/10 border border-stone-200 dark:border-white/10 px-4 py-2.5 flex items-center gap-2 shadow-sm">
              <Loader2 size={14} className="text-purple-500 dark:text-violet-400 animate-spin" />
              <span className="text-stone-500 dark:text-slate-400 text-xs">En train de réfléchir…</span>
            </div>
          </motion.div>
        )}

        {/* Message d'erreur */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 text-xs"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions rapides & Reset (après premier message) */}
      {!isEmpty && (
        <div className="px-4 pb-2 flex items-center justify-between gap-2">
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1 flex-1 mask-linear-right pr-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.text}
                onClick={() => setInput(s.text)}
                className="shrink-0 rounded-full border border-stone-200 dark:border-white/10 bg-white dark:bg-white/5 px-3 py-1 text-[11px]
                           text-stone-500 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-white/10 hover:text-orange-600 dark:hover:text-orange-300
                           transition-all duration-200"
              >
                {s.emoji} {s.text}
              </button>
            ))}
          </div>

          <button
            onClick={clearChat}
            title="Effacer la conversation"
            className="shrink-0 p-1.5 rounded-lg text-stone-400 dark:text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Barre de saisie */}
      <div className="px-4 pb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              handleSubmit(e);
            }
          }}
          className="flex items-center gap-3 rounded-2xl border border-stone-200 dark:border-white/15 bg-white dark:bg-white/5 px-4 py-3
                     backdrop-blur-md shadow-sm focus-within:border-orange-400 dark:focus-within:border-orange-500/50 focus-within:shadow-md
                     focus-within:shadow-orange-500/10 transition-all duration-200"
        >
          <input
            id="chat-input"
            value={input}
            onChange={handleInputChange}
            placeholder="Posez votre question…"
            autoComplete="off"
            className="flex-1 bg-transparent text-sm text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-slate-500 outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            id="chat-send-btn"
            aria-label="Envoyer"
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600
                       hover:from-orange-400 hover:to-orange-500 shadow-lg shadow-orange-500/25
                       disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 shrink-0"
          >
            <Send size={14} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
