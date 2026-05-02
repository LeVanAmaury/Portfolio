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
const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'Amaury Le Van. Ton rôle est d'aider les visiteurs à découvrir son parcours et ses projets.

CONSIGNES DE RÉPONSE :
1. TON : Sois professionnel, chaleureux et concis.
2. OUTILS : Utilise les outils (get_projects, get_skills, get_resume) pour illustrer tes propos par des fiches visuelles cliquables dès que c'est pertinent. 
3. TEXTE : Fournis TOUJOURS une réponse textuelle pour accompagner les fiches ou pour répondre aux messages de courtoisie (comme "Bonjour"). Ne réponds jamais par un message vide.
4. CONTACT : Si on veut te contacter, demande Nom, Email et Message, puis utilise 'submit_contact_form'.`;

// ─── Handler ─────────────────────────────────────────────────────────────────
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log(">>> Requête reçue pour Gemini");

    const fetchWithTimeout = async (url: string, options: any = {}) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 10000); // 10s timeout
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
          const url = new URL(`${BACKEND_URL}/api/projects`);
          if (stack) url.searchParams.set("stack", stack);
          const res = await fetchWithTimeout(url.toString());
          return await res.json();
        },
      }),
      get_skills: tool({
        description: "Récupère les compétences d'Amaury.",
        parameters: z.object({ category: z.string().optional() }),
        execute: async ({ category }) => {
          const url = new URL(`${BACKEND_URL}/api/skills`);
          if (category) url.searchParams.set("category", category);
          const res = await fetchWithTimeout(url.toString());
          return await res.json();
        },
      }),
      get_resume: tool({
        description: "Récupère le profil complet d'Amaury (expériences, formation).",
        parameters: z.object({}),
        execute: async () => {
          const res = await fetchWithTimeout(`${BACKEND_URL}/api/resume`);
          return await res.json();
        },
      }),
      submit_contact_form: tool({
        description: "Envoie un message de contact d'un visiteur à Amaury.",
        parameters: z.object({
          name: z.string().describe("Le nom du visiteur"),
          email: z.string().email().describe("L'email du visiteur"),
          message: z.string().describe("Le message ou la question"),
        }),
        execute: async ({ name, email, message }) => {
          const url = new URL(`${BACKEND_URL}/api/contact`);
          url.searchParams.set("name", name);
          url.searchParams.set("email", email);
          url.searchParams.set("message", message);
          const res = await fetchWithTimeout(url.toString(), { method: "POST" });
          return await res.json();
        },
      }),
    };

    try {
      console.log(">>> Tentative avec Google...");
      const result = await streamText({
        model: google("models/gemini-1.5-flash"), // Je remets 1.5 pour la stabilité
        system: SYSTEM_PROMPT,
        messages,
        tools,
        maxSteps: 5,
        onFinish: (event) => {
          console.log(">>> TEXTE GÉNÉRÉ :", event.text);
          console.log(">>> Flux terminé (Google)");
        },
      });
      return result.toDataStreamResponse();
    } catch (e: any) {
      console.error("!!! Erreur Google, bascule sur Groq...", e.message);

      // Roue de secours : Groq
      const result = await streamText({
        model: groq("llama-3.3-70b-versatile") as any,
        system: SYSTEM_PROMPT,
        messages,
        tools,
        maxSteps: 5,
        onFinish: (event) => {
          console.log(">>> TEXTE GÉNÉRÉ :", event.text);
          console.log(">>> Flux terminé (Groq)");
        },
      });
      return result.toDataStreamResponse();
    }
  } catch (error: any) {
    console.error("!!! ERREUR DANS LA ROUTE CHAT :", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
