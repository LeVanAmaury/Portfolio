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

RÈGLES DE PRÉSENTATION DU PARCOURS (Quand on demande de parler d'Amaury) :
- Raconte une histoire (narratif) de ses expériences les plus réussies.
- Mets en avant sa spécialité, son domaine de prédilection et le métier envisagé.
- Ajoute une réflexion sur son parcours : compétences acquises, difficultés surmontées (adaptation, autonomie, innovation, relationnel).
- Analyse le "comment et pourquoi" de ses choix.
- Parle des recommandations ou références (tuteurs, enseignants, collègues) de manière subtile.
- L'objectif est de montrer le "Moi social" d'Amaury de façon attrayante et pratique pour un recruteur.
- Ajoute une citation ou une réflexion qui le résume et le représente.

RÈGLES GÉNÉRALES :
1. COMPÉTENCES → appelle 'get_skills' immédiatement.
2. PROJETS → appelle 'get_projects' immédiatement.
3. PARCOURS/CV/ALTERNANCE → appelle 'get_resume' immédiatement (utilise le filtre si on demande un poste précis).
4. N'écris AUCUN texte d'intro avant d'appeler un outil.
5. Après réception des données, fais une réponse structurée, aérée et chaleureuse.
6. CONTACT → utilise 'submit_contact_form'.
7. Pour les questions simples, réponds directement sans outil.`;

// ─── Modèles gratuits OpenRouter ────────────────────────────────────────────
const MODELS = {
  // Modèle principal très performant et stable pour le tool calling
  primary: "meta-llama/llama-3.3-70b-instruct:free",
  // Fallback
  fallback: "google/gemini-2.0-flash-exp:free",
};

// Timeout de 60s pour la fonction Vercel (pour laisser le temps à Render de se réveiller)
export const maxDuration = 60;

// ─── Fetch avec timeout ─────────────────────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 55000) {
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
    description: "Récupère le profil d'Amaury. Peut filtrer par entreprise ou poste.",
    parameters: z.object({ filter: z.string().optional().describe("Filtrer par entreprise ou poste (ex: 'CCMO', 'Alternance'). Optionnel.") }),
    execute: async ({ filter }) => {
      console.log("[Tool] get_resume", filter ? `(${filter})` : "");
      try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/resume`);
        const data = await res.json();
        
        if (filter && data.experiences) {
            const f = filter.toLowerCase();
            data.experiences = data.experiences.filter((exp: any) => 
                exp.company.toLowerCase().includes(f) || exp.title.toLowerCase().includes(f) || exp.description.toLowerCase().includes(f)
            );
        }
        return data;
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
