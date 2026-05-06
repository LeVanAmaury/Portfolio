/**
 * Route API Next.js – Chatbot IA
 * 
 * Stratégie : Groq Llama 3.3 70B (ultra-rapide) → OpenRouter Llama 3.3 (fallback) → openrouter/free (dernier recours)
 */

import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { z } from "zod";

// Groq via l'API compatible OpenAI (pas @ai-sdk/groq qui a un bug stream-start)
const groqProvider = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "dummy",
});

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
- Appelle 'get_resume' avec include_experiences=false.
- Raconte une histoire (narratif) de ses expériences les plus réussies.
- Mets en avant sa spécialité, son domaine de prédilection et le métier envisagé.
- Ajoute une réflexion sur son parcours : compétences acquises, difficultés surmontées (adaptation, autonomie, innovation, relationnel).
- Analyse le "comment et pourquoi" de ses choix.
- Parle des recommandations ou références (tuteurs, enseignants, collègues) de manière subtile.
- L'objectif est de montrer le "Moi social" d'Amaury de façon attrayante et pratique pour un recruteur.
- Ajoute une citation ou une réflexion qui le résume et le représente.

RÈGLES GÉNÉRALES :
1. COMPÉTENCES → appelle 'get_skills' immédiatement (utilise le filtre de catégorie si on demande un domaine précis).
2. PROJETS → appelle 'get_projects' immédiatement.
3. PARCOURS/CV/ALTERNANCE → appelle 'get_resume' immédiatement (utilise les filtres pour affiner).
4. N'écris AUCUN texte d'intro avant d'appeler un outil.
5. Après réception des données, fais une réponse TRÈS CONCISE (2 ou 3 phrases maximum), structurée et chaleureuse. Va droit au but.
6. CONTACT → utilise 'show_contact_form' pour afficher le formulaire interactif à l'utilisateur.
7. Pour les questions simples, réponds directement sans outil.
8. N'utilise PAS d'émojis (ou très exceptionnellement) dans le texte généré.
9. Ne fais JAMAIS de tableaux Markdown (utilise uniquement du texte ou des listes à puces).`;

// ─── Modèles IA ────────────────────────────────────────────
const MODELS = [
  // 1. Groq : Ultra-rapide (~800 tokens/s), gratuit, Llama 3.3 70B
  { provider: groqProvider, id: "llama-3.3-70b-versatile" },
  // 2. OpenRouter Llama 3.3 70B : Même modèle, routé par OpenRouter (plus lent mais stable)
  { provider: openrouter, id: "meta-llama/llama-3.3-70b-instruct:free" },
  // 3. OpenRouter Free : Dernier recours, routeur automatique
  { provider: openrouter, id: "openrouter/free" }
];

// Timeout de 60s pour la fonction Vercel (pour laisser le temps à Render de se réveiller)
export const maxDuration = 60;

// ─── Fetch avec timeout et cache ────────────────────────────────────────────
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 55000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    // On cache agressivement les requêtes (1 heure) pour que Vercel réponde instantanément 
    // sans avoir à attendre le backend Render !
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      next: { revalidate: 3600 }
    });
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
    description: "Récupère les compétences techniques d'Amaury. Peut filtrer par catégorie.",
    parameters: z.object({ category: z.string().optional().describe("Catégorie (ex: 'Backend', 'Frontend', 'Data'). Optionnel.") }),
    execute: async ({ category }) => {
      console.log("[Tool] get_skills", category ? `(${category})` : "");
      try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/skills`);
        const data = await res.json();

        if (category && Array.isArray(data)) {
          const catLower = category.toLowerCase();
          const filtered = data.filter((s: any) => s.category?.toLowerCase().includes(catLower));
          // Si le filtre ne trouve rien (ex: AI donne un nom bizarre), on renvoie tout
          return filtered.length > 0 ? filtered : data;
        }
        return data;
      } catch {
        return { error: "Les compétences sont temporairement indisponibles." };
      }
    },
  }),

  get_resume: tool({
    description: "Récupère le profil d'Amaury. Peut filtrer par entreprise ou poste.",
    parameters: z.object({
      filter: z.string().optional().describe("Filtrer par entreprise ou poste (ex: 'CCMO', 'Alternance'). Optionnel."),
      include_experiences: z.boolean().default(true).describe("Mettre à false si l'utilisateur demande juste une 'présentation' d'Amaury sans le détail de ses expériences.")
    }),
    execute: async ({ filter, include_experiences }) => {
      console.log("[Tool] get_resume", filter ? `(${filter})` : "", include_experiences ? "" : "(no exp)");
      try {
        const res = await fetchWithTimeout(`${BACKEND_URL}/api/resume`);
        const data = await res.json();

        if (!include_experiences) {
          data.experiences = [];
        } else if (filter && data.experiences) {
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

  show_contact_form: tool({
    description: "Affiche le formulaire de contact à l'utilisateur pour qu'il puisse envoyer un message à Amaury.",
    parameters: z.object({}),
    execute: async () => {
      console.log("[Tool] show_contact_form");
      return { success: true };
    },
  }),
};

// ─── Handler principal ──────────────────────────────────────────────────────
export async function POST(req: Request) {
  if (!process.env.OPENROUTER_API && !process.env.GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Clés API manquantes" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages } = await req.json();

    // Limiter à 8 messages max pour rester dans la limite de tokens Groq (64K)
    const recentMessages = messages.slice(-8);
    console.log(`>>> ${recentMessages.length}/${messages.length} messages envoyés`);

    // Essayer les modèles dans l'ordre (Groq → Llama OpenRouter → openrouter/free)
    for (const modelConfig of MODELS) {
      try {
        console.log(`>>> Essai avec ${modelConfig.id}...`);

        const result = await streamText({
          model: modelConfig.provider(modelConfig.id) as any,
          system: SYSTEM_PROMPT,
          messages: recentMessages,
          tools,
          maxSteps: 3,
          maxTokens: 1024,
          temperature: 0.7,
        });

        // Créer la réponse streaming
        const response = result.toDataStreamResponse();
        const body = response.body;
        if (!body) throw new Error("Pas de body dans la réponse");

        // CRITICAL: Lire le premier chunk pour vérifier que le stream fonctionne.
        // Timeout de 10s : si le modèle ne renvoie rien, on bascule sur le suivant.
        const reader = body.getReader();
        const firstRead = await Promise.race([
          reader.read(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout 10s: aucune donnée reçue")), 10000)
          ),
        ]);

        if (firstRead.done && !firstRead.value) {
          throw new Error("Stream vide");
        }

        // Le stream fonctionne ! Construire un nouveau stream qui commence
        // par le chunk déjà lu, puis continue avec le reste.
        const validatedStream = new ReadableStream({
          start(controller) {
            if (firstRead.value) controller.enqueue(firstRead.value);
            if (firstRead.done) controller.close();
          },
          async pull(controller) {
            try {
              const { value, done } = await reader.read();
              if (done) controller.close();
              else controller.enqueue(value);
            } catch { controller.close(); }
          },
          cancel() { reader.cancel(); }
        });

        return new Response(validatedStream, {
          headers: response.headers,
          status: response.status,
        });
      } catch (e: any) {
        console.warn(`>>> Échec ${modelConfig.id}:`, e.message);
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
