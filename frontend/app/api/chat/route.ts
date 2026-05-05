/**
 * Route API Next.js – Chatbot IA via OpenRouter (modèles gratuits)
 * 
 * Stratégie : Llama 3.3 70B (principal) → Gemini 2.5 Flash (fallback)
 * Les deux sont gratuits, stables, et supportent le tool calling.
 */

import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API!,
  headers: {
    "HTTP-Referer": "https://www.portfolioamaurylevan.dev",
    "X-Title": "Portfolio Amaury",
  }
});

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_API_URL || "http://localhost:8000";

const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'Amaury Le Van, un apprenti développeur Python passionné et déterminé. Tu es chaleureux, enthousiaste et concis.

COORDONNÉES :
- Email : levanamaury@gmail.com
- LinkedIn : linkedin.com/in/amaury-le-van-6ab822346
- GitHub : github.com/LeVanAmaury
- Téléphone : 06 46 29 15 39
- Localisation : Amiens / Beauvais

RÈGLES :
1. COMPÉTENCES → appelle 'get_skills' immédiatement.
2. PROJETS → appelle 'get_projects' immédiatement.
3. PARCOURS/CV/ALTERNANCE → appelle 'get_resume' immédiatement.
4. N'écris AUCUN texte d'intro avant d'appeler un outil.
5. Après réception des données, fais une réponse structurée et CONCISE avec des puces (pas de tableaux).
6. CONTACT → utilise 'submit_contact_form'.
7. Pour les questions simples (bonjour, calculs, etc.), réponds directement sans outil.`;

// ─── Modèles gratuits OpenRouter ────────────────────────────────────────────
const MODELS = {
  // openrouter/free route automatiquement vers le meilleur modèle gratuit disponible
  primary: "openrouter/free",
  // Fallback fiable au cas où le routeur gratuit ne trouve rien
  fallback: "google/gemini-2.0-flash-lite-preview-02-05:free",
};

// ─── Fetch avec timeout ─────────────────────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 7000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

// ─── Définition des outils ──────────────────────────────────────────────────
const tools = {
  get_projects: tool({
    description: "Récupère les projets d'Amaury. Peut filtrer par technologie.",
    parameters: z.object({ stack: z.string().optional() }),
    execute: async ({ stack }) => {
      console.log("[Tool] get_projects", stack ? `(${stack})` : "");
      const url = new URL(`${BACKEND_URL}/api/projects`);
      if (stack) url.searchParams.set("stack", stack);
      try {
        const res = await fetchWithTimeout(url.toString());
        return await res.json();
      } catch {
        return { error: "Les projets sont temporairement indisponibles." };
      }
    },
  }),

  get_skills: tool({
    description: "Récupère les compétences techniques d'Amaury.",
    parameters: z.object({ category: z.string().optional() }),
    execute: async ({ category }) => {
      console.log("[Tool] get_skills", category ? `(${category})` : "");
      const url = new URL(`${BACKEND_URL}/api/skills`);
      if (category) url.searchParams.set("category", category);
      try {
        const res = await fetchWithTimeout(url.toString());
        return await res.json();
      } catch {
        return { error: "Les compétences sont temporairement indisponibles." };
      }
    },
  }),

  get_resume: tool({
    description: "Récupère le profil complet d'Amaury (expériences, formation, etc.).",
    parameters: z.object({}),
    execute: async () => {
      console.log("[Tool] get_resume");
      try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/resume`);
        return await res.json();
      } catch {
        return { error: "Le CV est temporairement indisponible." };
      }
    },
  }),

  submit_contact_form: tool({
    description: "Envoie un message de contact à Amaury.",
    parameters: z.object({
      name: z.string(),
      email: z.string().email(),
      message: z.string(),
    }),
    execute: async (params) => {
      console.log("[Tool] submit_contact_form");
      const url = new URL(`${BACKEND_URL}/api/contact`);
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
      try {
        const res = await fetchWithTimeout(url.toString(), { method: "POST" });
        return await res.json();
      } catch {
        return { error: "L'envoi du message a échoué. Réessayez plus tard." };
      }
    },
  }),
};

// ─── Handler principal ──────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API) {
    return new Response(
      JSON.stringify({ error: "Clé API OpenRouter manquante" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages } = await req.json();

    // Limiter à 12 messages max pour éviter les timeouts
    const recentMessages = messages.slice(-12);
    console.log(`>>> ${recentMessages.length}/${messages.length} messages envoyés`);

    // Essayer le modèle principal, puis le fallback
    for (const modelId of [MODELS.primary, MODELS.fallback]) {
      // 3 tentatives par modèle pour contrer l'instabilité des API gratuites
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`>>> Tentative ${attempt}/3 avec ${modelId}...`);
          const result = await streamText({
            model: openrouter(modelId) as any,
            system: SYSTEM_PROMPT,
            messages: recentMessages,
            tools,
            maxSteps: 5,
          });
          return result.toDataStreamResponse();
        } catch (e: any) {
          console.warn(`>>> Échec ${modelId} (tentative ${attempt}):`, e.message);
          // Attendre 1s avant de réessayer
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    // Si tous les modèles échouent
    return new Response(
      JSON.stringify({ error: "Tous les modèles IA sont temporairement indisponibles." }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("!!! ERREUR CRITIQUE :", error.message);
    return new Response(
      JSON.stringify({ error: "Erreur serveur interne" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
