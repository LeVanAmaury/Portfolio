"use client";

import { useChat } from "ai/react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, Sparkles, Trash2, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { MarkdownText } from "./MarkdownText";
import { ProjectsGrid, SkillsGrid, ResumeDisplay, ContactSuccess } from "@/components/GenerativeUI";
import type { Project, Skill, ResumeResponse } from "@/lib/types";

const SUGGESTIONS = [
  "Quels sont tes projets ?",
  "Ton rôle à la CCMO ?",
  "Tes compétences techniques ?",
  "Parle-moi de ton alternance",
];

// ─── Rendu d'un message individuel ───────────────────────────────────────────

function MessageBubble({ role, content, toolInvocations, isLast, isLoading, messageId }: {
  role: "user" | "assistant";
  content: string;
  toolInvocations?: Array<{ toolName: string; state: string; result?: unknown }>;
  isLast: boolean;
  isLoading: boolean;
  messageId: string;
}) {
  const isUser = role === "user";
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);

  const handleFeedback = async (isPositive: boolean) => {
    setFeedback(isPositive ? "positive" : "negative");
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    
    if (!backendUrl) return;

    // Avoid hitting localhost from production
    const isLocalhost = backendUrl.includes("localhost");
    const isProduction = typeof window !== "undefined" && !window.location.hostname.includes("localhost");
    if (isLocalhost && isProduction) return;

    try {
      await fetch(`${backendUrl}/api/feedback?message_id=${messageId}&is_positive=${isPositive}`, {
        method: "POST",
      });
    } catch (e) {
      // Log only in development or if it's not a fetch error
      if (!isProduction) {
        console.error("Erreur feedback:", e);
      }
    }
  };
  
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
      <div className={`group flex flex-col gap-3 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {/* Texte */}
        {(content || (toolInvocations && toolInvocations.length > 0)) ? (
          <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed
            ${isUser
              ? "bg-indigo-500/20 text-indigo-50 border border-indigo-500/30 rounded-tr-sm"
              : "bg-white/8 text-zinc-100 border border-white/10 rounded-tl-sm"}`}
          >
            {isUser ? content : (content ? <MarkdownText content={content} /> : <span className="text-zinc-500 italic">Analyse en cours...</span>)}
          </div>
        ) : null}

        {/* Composants Générés (Tool Results) */}
        {showTools && toolInvocations?.map((tool, i) => {
          if (tool.state === "call") {
            return (
              <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-500 animate-pulse">
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

        {/* Feedback buttons for assistant */}
        {!isUser && !isLoading && content && (
          <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleFeedback(true)}
              disabled={feedback !== null}
              className={`p-1 rounded hover:bg-white/5 transition-colors ${feedback === "positive" ? "text-green-400" : "text-zinc-500"}`}
            >
              {feedback === "positive" ? <Check size={12} /> : <ThumbsUp size={12} />}
            </button>
            <button
              onClick={() => handleFeedback(false)}
              disabled={feedback !== null}
              className={`p-1 rounded hover:bg-white/5 transition-colors ${feedback === "negative" ? "text-red-400" : "text-zinc-500"}`}
            >
              <ThumbsDown size={12} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Composant principal du Chat ──────────────────────────────────────────────

export function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, setMessages } = useChat({
    api: "/api/chat",
  });

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Charger les messages au montage (uniquement côté client)
  useEffect(() => {
    const savedMessages = localStorage.getItem("portfolio-chat-history");
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (e) {
        console.error("Erreur chargement historique:", e);
      }
    }
    setIsInitialLoad(false);
  }, [setMessages]);

  // Sauvegarder à chaque changement de messages
  useEffect(() => {
    if (!isInitialLoad && messages.length > 0) {
      localStorage.setItem("portfolio-chat-history", JSON.stringify(messages));
    }
  }, [messages, isInitialLoad]);

  const clearChat = () => {
    if (confirm("Voulez-vous vraiment effacer l'historique de la conversation ?")) {
      setMessages([]);
      localStorage.removeItem("portfolio-chat-history");
    }
  };

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
                messageId={m.id}
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

      {/* Suggestions rapides & Reset (après premier message) */}
      {!isEmpty && (
        <div className="px-4 pb-2 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex gap-2">
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
          
          <button
            onClick={clearChat}
            title="Effacer la conversation"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
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
              const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
              
              // Only attempt analytics if backend URL is configured and not pointing to localhost in production
              const isLocalhost = backendUrl?.includes("localhost") || !backendUrl;
              const isProduction = typeof window !== "undefined" && !window.location.hostname.includes("localhost");
              
              if (backendUrl && !(isLocalhost && isProduction)) {
                fetch(`${backendUrl}/api/analytics/question?question=${encodeURIComponent(input)}`, { 
                  method: "POST",
                  mode: 'no-cors' // Use no-cors to avoid some preflight issues if analytics is simple
                }).catch(() => {
                  // Silent fail for analytics to not pollute console
                });
              }
              
              handleSubmit(e);
            }
          }}
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
