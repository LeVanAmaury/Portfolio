/**
 * Route API Next.js – Point d'entrée du chatbot IA
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";

// ─── Configuration Gemini ─────────────────────────────────────────────────────
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
});

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

// ─── Prompt Système ───────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Tu es l'assistant virtuel d'Amaury Le Van, apprenti développeur en alternance chez CCMO Mutuelle Beauvais et étudiant en BUT 2 Informatique à l'UPJV (Amiens).
Ton rôle est d'aider les visiteurs à découvrir le profil, les projets et les compétences d'Amaury.
Si un visiteur veut contacter Amaury, demande-lui poliment son nom, son email et son message, puis utilise l'outil 'submit_contact_form' pour l'envoyer.
Utilise les autres outils (tools) pour afficher les projets et compétences.`;

// ─── Handler ─────────────────────────────────────────────────────────────────
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log(">>> Requête reçue pour Gemini");

    const result = streamText({
      model: google("gemini-2.0-flash"),
      system: SYSTEM_PROMPT,
      messages,
      onFinish: () => console.log(">>> Flux terminé avec succès"),
      onError: (error) => console.error("!!! ERREUR FLUX :", error),
      tools: {
        get_projects: tool({
          description: "Récupère les projets d'Amaury.",
          parameters: z.object({ stack: z.string().optional() }),
          execute: async ({ stack }) => {
            const url = new URL(`${BACKEND_URL}/api/projects`);
            if (stack) url.searchParams.set("stack", stack);
            const res = await fetch(url.toString());
            return await res.json();
          },
        }),
        get_skills: tool({
          description: "Récupère les compétences d'Amaury.",
          parameters: z.object({ category: z.string().optional() }),
          execute: async ({ category }) => {
            const url = new URL(`${BACKEND_URL}/api/skills`);
            if (category) url.searchParams.set("category", category);
            const res = await fetch(url.toString());
            return await res.json();
          },
        }),
        get_resume: tool({
          description: "Récupère le profil complet d'Amaury.",
          parameters: z.object({}),
          execute: async () => {
            const res = await fetch(`${BACKEND_URL}/api/resume`);
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
            const res = await fetch(url.toString(), { method: "POST" });
            return await res.json();
          },
        }),
      },
      maxSteps: 5,
    });

    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error("!!! ERREUR DANS LA ROUTE CHAT :", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
