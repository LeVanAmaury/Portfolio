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

CONSIGNES DE RÉPONSE :
1. AFFICHAGE VISUEL OBLIGATOIRE : Chaque fois que tu parles d'un projet, d'une compétence ou d'une expérience, tu DOIS appeler l'outil correspondant (get_projects, get_skills ou get_resume) pour que l'utilisateur voie la fiche cliquable à l'écran.
2. PRÉCISION DES COMPÉTENCES : Si on te demande "connais-tu Docker ?", utilise 'get_skills' avec le filtre correspondant pour n'afficher que les cartes pertinentes, ne donne pas toute la liste si ce n'est pas demandé.
3. FOCUS EXPÉRIENCE : Si on te demande "parle-moi de ton alternance", appelle 'get_resume' pour afficher la fiche CCMO Mutuelle et explique oralement tes missions principales.
4. CONTACT : Si un visiteur veut te contacter, demande poliment Nom, Email et Message, puis utilise 'submit_contact_form'.`;

// ─── Handler ─────────────────────────────────────────────────────────────────
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    console.log(">>> Requête reçue pour Gemini");

    const result = streamText({
      model: google("gemini-1.5-flash"),
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
