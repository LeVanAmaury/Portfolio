/**
 * Route API Next.js – Point d'entrée du chatbot IA (OpenRouter uniquement)
 */

import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

// Configuration OpenRouter
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API!,
  headers: {
    "HTTP-Referer": "https://github.com/LeVanAmaury/Portfolio",
    "X-Title": "Portfolio Amaury",
  }
});

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

// ─── Prompt Système ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'Amaury Le Van. Ton rôle est d'aider les visiteurs à découvrir son parcours, ses projets et ses compétences.

COORDONNÉES D'AMAURY :
- Email : levanamaury@gmail.com
- LinkedIn : https://www.linkedin.com/in/amaury-le-van-6ab822346/
- GitHub : github.com/LeVanAmaury
- Téléphone : 06 46 29 15 39
- Localisation : Amiens / Beauvais

DIRECTIVES CRITIQUES :
1. COMPÉTENCES : Si on te demande ses compétences techniques, ce qu'il sait faire ou ses technos, appelle TOUJOURS 'get_skills'.
2. PROJETS : Si on te demande ses projets, réalisations ou ce qu'il a construit, appelle TOUJOURS 'get_projects'.
3. PARCOURS/EXPÉRIENCE : Si on te demande son parcours, son CV, ses études, son alternance, appelle TOUJOURS 'get_resume'.
4. AUCUN BLA-BLA PRÉLIMINAIRE : Ne génère aucun texte d'introduction si tu vas appeler un outil.
5. SYNTHÈSE : Fais une réponse structurée, chaleureuse et CONCISE.
6. CONTACT : Pour un message de contact, utilise 'submit_contact_form'.`;

export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API) {
    return new Response(JSON.stringify({ error: "Clé API OpenRouter manquante" }), { status: 500 });
  }

  try {
    const { messages } = await req.json();
    console.log(`>>> Requête reçue (${messages.length} messages)`);

    const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 7000); 
      try {
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        return response;
      } catch (e) {
        clearTimeout(id);
        throw e;
      }
    };

    const tools = {
      get_projects: tool({
        description: "Récupère les projets d'Amaury.",
        parameters: z.object({ stack: z.string().optional() }),
        execute: async ({ stack }) => {
          console.log("[Tool] get_projects");
          const url = new URL(`${BACKEND_URL}/api/projects`);
          if (stack) url.searchParams.set("stack", stack);
          try {
            const res = await fetchWithTimeout(url.toString());
            return await res.json();
          } catch (err) {
            return { error: "Indisponible actuellement" };
          }
        },
      }),
      get_skills: tool({
        description: "Récupère les compétences techniques.",
        parameters: z.object({ category: z.string().optional() }),
        execute: async ({ category }) => {
          console.log("[Tool] get_skills");
          const url = new URL(`${BACKEND_URL}/api/skills`);
          if (category) url.searchParams.set("category", category);
          try {
            const res = await fetchWithTimeout(url.toString());
            return await res.json();
          } catch (err) {
            return { error: "Indisponible actuellement" };
          }
        },
      }),
      get_resume: tool({
        description: "Récupère le CV complet.",
        parameters: z.object({}),
        execute: async () => {
          console.log("[Tool] get_resume");
          try {
            const res = await fetchWithTimeout(`${BACKEND_URL}/api/resume`);
            return await res.json();
          } catch (err) {
            return { error: "Indisponible actuellement" };
          }
        },
      }),
      submit_contact_form: tool({
        description: "Envoie un message de contact.",
        parameters: z.object({ name: z.string(), email: z.string().email(), message: z.string() }),
        execute: async (params) => {
          console.log("[Tool] submit_contact_form");
          const url = new URL(`${BACKEND_URL}/api/contact`);
          Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
          try {
            const res = await fetchWithTimeout(url.toString(), { method: "POST" });
            return await res.json();
          } catch (err) {
            return { error: "Échec de l'envoi" };
          }
        },
      }),
    };

    const result = await streamText({
      model: openrouter("google/gemini-2.0-flash-lite-preview-02-05:free"), // Modèle gratuit, rapide et efficace
      system: SYSTEM_PROMPT,
      messages,
      tools,
      maxSteps: 5,
    });

    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error("!!! ERREUR CRITIQUE :", error);
    return new Response(JSON.stringify({ error: "Erreur serveur" }), { status: 500 });
  }
}
