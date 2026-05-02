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
2. OUTILS : Utilise les outils (get_projects, get_skills, get_resume) dès que c'est pertinent. 
3. FLUX : Si tu appelles un outil, ne génère AUCUN texte dans le même message. Attends d'avoir le résultat de l'outil pour faire ta réponse finale.
4. TEXTE : Ne réponds JAMAIS par un message vide (sauf si tu appelles un outil).
5. CONTACT : Si on veut te contacter, demande Nom, Email et Message, puis utilise 'submit_contact_form'.`;

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
        description: "Récupère les projets d'Amaury. N'utilise le paramètre 'stack' QUE si l'utilisateur mentionne une technologie précise (ex: React, Python). Sinon, laisse vide.",
        parameters: z.object({ stack: z.string().optional() }),
        execute: async ({ stack }) => {
          const url = new URL(`${BACKEND_URL}/api/projects`);
          if (stack) url.searchParams.set("stack", stack);
          console.log(">>> Appel Backend Projets :", url.toString());
          
          let res = await fetchWithTimeout(url.toString());
          let data = await res.json();
          
          // Si on a filtré et que c'est vide, on renvoie tout par sécurité
          if (stack && (!data || data.length === 0)) {
            console.log(">>> Filtre vide, on récupère tout...");
            res = await fetchWithTimeout(`${BACKEND_URL}/api/projects`);
            data = await res.json();
          }
          
          console.log(">>> RÉSULTAT PROJETS :", JSON.stringify(data));
          return data;
        },
      }),
      get_skills: tool({
        description: "Récupère les compétences d'Amaury.",
        parameters: z.object({ category: z.string().optional() }),
        execute: async ({ category }) => {
          const url = new URL(`${BACKEND_URL}/api/skills`);
          if (category) url.searchParams.set("category", category);
          console.log(">>> Appel Backend Skills :", url.toString());
          const res = await fetchWithTimeout(url.toString());
          console.log(">>> Statut Backend Skills :", res.status);
          return await res.json();
        },
      }),
      get_resume: tool({
        description: "Récupère le profil complet d'Amaury (expériences, formation).",
        parameters: z.object({}),
        execute: async () => {
          const url = `${BACKEND_URL}/api/resume`;
          console.log(">>> Appel Backend CV :", url);
          const res = await fetchWithTimeout(url);
          console.log(">>> Statut Backend CV :", res.status);
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
          console.log(">>> Envoi Formulaire Contact :", url.toString());
          const res = await fetchWithTimeout(url.toString(), { method: "POST" });
          console.log(">>> Statut Backend Contact :", res.status);
          return await res.json();
        },
      }),
    };

    try {
      console.log(">>> Tentative avec Groq (Priorité)...");
      const result = await streamText({
        model: groq("llama-3.3-70b-versatile") as any,
        system: SYSTEM_PROMPT + "\nIMPORTANT : Tu DOIS utiliser un outil dès que l'utilisateur pose une question sur tes projets, compétences ou parcours.",
        messages,
        tools,
        maxSteps: 5,
        onFinish: (event) => {
          console.log(">>> TEXTE GÉNÉRÉ (Groq) :", event.text);
          if (event.toolCalls) console.log(">>> OUTILS APPELÉS :", event.toolCalls.map(tc => tc.toolName).join(", "));
          console.log(">>> Flux terminé (Groq)");
        },
      });
      return result.toDataStreamResponse();
    } catch (e: any) {
      console.error("!!! Erreur Groq, bascule sur Google...", e.message);

      const result = await streamText({
        model: google("gemini-1.5-flash-latest"),
        system: SYSTEM_PROMPT,
        messages,
        tools,
        maxSteps: 5,
        onFinish: (event) => {
          console.log(">>> TEXTE GÉNÉRÉ (Google) :", event.text);
          if (event.toolCalls) console.log(">>> OUTILS APPELÉS :", event.toolCalls.map(tc => tc.toolName).join(", "));
          console.log(">>> Flux terminé (Google)");
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
