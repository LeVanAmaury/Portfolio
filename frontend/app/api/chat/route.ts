/**
 * Route API Next.js – Point d'entrée du chatbot IA
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY!,
});

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

// ─── Prompt Système ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'Amaury Le Van. Ton rôle est d'aider les visiteurs à découvrir son parcours, ses projets et ses compétences.

DIRECTIVES CRITIQUES :
1. COMPÉTENCES : Si on te demande ses compétences techniques, ce qu'il sait faire ou ses technos, appelle TOUJOURS 'get_skills'.
2. PROJETS : Si on te demande ses projets, réalisations ou ce qu'il a construit, appelle TOUJOURS 'get_projects'.
3. PARCOURS/EXPÉRIENCE : Si on te demande son parcours, son CV, ses études, son alternance, des informations sur sa vie,ses postes passés ou actuels appelle TOUJOURS 'get_resume'.
4. AUCUN BLA-BLA PRÉLIMINAIRE : Ne génère aucun texte d'introduction si tu vas appeler un outil. Appelle l'outil immédiatement.
5. SYNTHÈSE : Une fois les données reçues, fais une réponse structurée et chaleureuse.
6. CONTACT : Pour un message de contact ou si l'utilisateur veut écrire à Amaury, utilise 'submit_contact_form'.`;

// ─── Handler ─────────────────────────────────────────────────────────────────
export const maxDuration = 30;

export async function POST(req: Request) {
  // Vérification des clés API
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response(JSON.stringify({ error: "Clé API Google manquante" }), { status: 500 });
  }

  try {
    const { messages } = await req.json();
    console.log(`>>> Requête reçue (${messages.length} messages)`);

    const fetchWithTimeout = async (url: string, options: RequestInit = {}) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 10000);
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
        description: "Récupère les projets d'Amaury. Filtre par 'stack' si précisé.",
        parameters: z.object({ stack: z.string().optional() }),
        execute: async ({ stack }) => {
          const url = new URL(`${BACKEND_URL}/api/projects`);
          if (stack) url.searchParams.set("stack", stack);

          try {
            const res = await fetchWithTimeout(url.toString());
            let data = await res.json();

            if (stack && (!data || data.length === 0)) {
              const fallbackRes = await fetchWithTimeout(`${BACKEND_URL}/api/projects`);
              data = await fallbackRes.json();
            }
            return data;
          } catch (err) {
            console.error("Error fetching projects:", err);
            return { error: "Impossible de récupérer les projets" };
          }
        },
      }),
      get_skills: tool({
        description: "Récupère les compétences techniques d'Amaury.",
        parameters: z.object({ category: z.string().optional() }),
        execute: async ({ category }) => {
          const url = new URL(`${BACKEND_URL}/api/skills`);
          if (category) url.searchParams.set("category", category);
          try {
            const res = await fetchWithTimeout(url.toString());
            return await res.json();
          } catch (err) {
            console.error("Error fetching skills:", err);
            return { error: "Impossible de récupérer les compétences" };
          }
        },
      }),
      get_resume: tool({
        description: "Récupère le profil complet (expériences, formation).",
        parameters: z.object({}),
        execute: async () => {
          try {
            const res = await fetchWithTimeout(`${BACKEND_URL}/api/resume`);
            return await res.json();
          } catch (err) {
            console.error("Error fetching resume:", err);
            return { error: "Impossible de récupérer le CV" };
          }
        },
      }),
      submit_contact_form: tool({
        description: "Envoie un message de contact.",
        parameters: z.object({
          name: z.string(),
          email: z.string().email(),
          message: z.string(),
        }),
        execute: async (params) => {
          const url = new URL(`${BACKEND_URL}/api/contact`);
          Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
          try {
            const res = await fetchWithTimeout(url.toString(), { method: "POST" });
            return await res.json();
          } catch (err) {
            console.error("Error submitting contact form:", err);
            return { error: "Échec de l'envoi du message" };
          }
        },
      }),
    };

    // Stratégie : Essayer Groq d'abord, fallback sur Gemini si erreur (quota, etc.)
    const tryStream = async (provider: 'groq' | 'google') => {
      const model = provider === 'groq'
        ? groq("llama-3.3-70b-versatile")
        : google("gemini-1.5-flash");

      return streamText({
        model: model as any,
        system: SYSTEM_PROMPT + (provider === 'groq' ? "\nIMPORTANT : Utilise un outil pour les projets/compétences/CV." : ""),
        messages,
        tools,
        maxSteps: 5,
      });
    };

    try {
      if (!process.env.GROQ_API_KEY) throw new Error("No Groq Key");
      console.log(">>> Tentative Groq...");
      const result = await tryStream('groq');
      return result.toDataStreamResponse();
    } catch (e: any) {
      console.warn(">>> Groq en échec (quota ?), bascule sur Gemini...", e.message);
      try {
        const result = await tryStream('google');
        return result.toDataStreamResponse();
      } catch (geminiError: any) {
        console.error("!!! ÉCHEC FALLBACK GEMINI :", geminiError.message);
        throw geminiError;
      }
    }

  } catch (error: any) {
    console.error("!!! ERREUR CRITIQUE ROUTE CHAT :", error);
    return new Response(JSON.stringify({ error: "Une erreur interne est survenue" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
