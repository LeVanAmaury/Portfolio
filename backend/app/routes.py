"""
Routes FastAPI pour le Portfolio d'Amaury.
Expose les endpoints /api/projects, /api/skills, /api/resume, /api/references, /api/narrative.
"""

import json
from pathlib import Path
import os
import resend
from fastapi import APIRouter, HTTPException, Query, Body

from app.models import Project, Skill, SkillCategory, ResumeResponse, Experience, Education, Reference, PortfolioNarrative
from app.supabase_client import supabase

router = APIRouter(prefix="/api", tags=["Portfolio"])

# Configuration Resend
resend.api_key = os.environ.get("RESEND_API_KEY")


# ─── Données de fallback (à compléter par Amaury) ─────────────────────────────
# Ces données sont utilisées si les tables Supabase n'existent pas encore.
# Elles permettent au portfolio de fonctionner immédiatement.

FALLBACK_EDUCATION = [
    {
        "id": "but-info",
        "institution": "UPJV – IUT d'Amiens",
        "degree": "BUT Informatique – Parcours Réalisation d'Applications en alternance",
        "duration": "2024 – 2027",
        "description": "Lors de ces années de formation en BUT Informatique j'ai appris a coder réellement, j'ai appris l'algorithmie, l'optimisation et j'ai surtout appris des nouveaux languages et la rigueur que certains demandent. Ce BUT m'a surtout appris à travailler en équipe sur les différents projets.",
        "location": "Amiens"
    },
    {
        "id": "bac",
        "institution": "Lycée Paul Langevin – Nom du lycée",
        "degree": "Baccalauréat STI2D (Technologique) – Baccalauréat (filière)",
        "duration": "2024 – Année d'obtention",
        "description": "J'ai eu ce bac STI2D (SIN) avec mention Bien. J'ai toujours aimé l'informatique par sa créativité et le fait que l'utilisation des skills informatiques est infini. Je me passione pour les nouvelles choses et les expériences et l'informatique me permet d'avoir ce que je recherche.",
        "location": "Beauvais"
    }
]

FALLBACK_REFERENCES = [
    {
        "id": "ref-tuteur-ccmo",
        "name": "Paul Mouchot – Nom du tuteur",
        "role": "Tuteur d'entreprise",
        "company": "CCMO Mutuelle",
        "quote": "Amaury est investi dans le travail et n'hésite pas à proposer de nouvelles idées qu'elles soient bonnes ou mauvaises, il propose et réajuste selon les remarques.",
        "relationship": "Tuteur lors de mon alternance en développement Python à CCMO Mutuelle (2025-2027)"
    }
]

FALLBACK_NARRATIVE = {
    "title": "Mon parcours vers le développement – Curiosité, persévérance et passion",
    "objective": "Mon objectif personnel c'est de toujours réussir à m'amuser dans mon travail et de faire en sorte que la vie de mes collègues devienne plus simple.",
    "specialty": "Le développement python basic (script d'automatisation par scheduler)",
    "target_job": "Chef de projet",
    "personal_quote": "Exister est un fait, vivre est un art. Fréderic Lenoir", 
    "narrative_text": """À COMPLÉTER – C'est le cœur de ton portfolio. Écris 1 page de narratif introspectif.

Guide pour l'écriture :

1. D'OÙ TU VIENS : Raconte comment tu es arrivé dans l'informatique. Qu'est-ce qui t'a donné envie ? Un événement déclencheur ? Une passion d'enfance ?

2. TON PARCOURS BUT : Les moments clés de BUT1 et BUT2. Qu'est-ce qui t'a marqué ? Un projet, un cours, une rencontre ?

3. TES EXPÉRIENCES LES PLUS RÉUSSIES (1-2 en détail) :
   - Le contexte : où, quand, avec qui
   - Ce que tu as fait concrètement
   - Les défis que tu as rencontrés
   - Ce que tu as appris
   - Pourquoi c'est ta fierté

4. L'ALTERNANCE À CCMO : Comment tu as vécu cette expérience. Ce que tu as apporté, ce que tu as reçu.

5. TA VISION : Où tu te vois dans 3-5 ans. Quel type de projets te passionnent.""",
    "skills_reflection": """À COMPLÉTER – Réflexion sur tes acquis.

Exemples de questions à te poser :
- Quelles compétences as-tu acquises que tu n'avais pas en arrivant en BUT ?
- Qu'est-ce qui te surprend dans ta propre progression ?
- Quelles sont les compétences que tu maîtrises le mieux et pourquoi ?
- Comment tes compétences techniques et humaines se complètent-elles ?""",
    "difficulties_overcome": """À COMPLÉTER – Difficultés surmontées.

Le prof attend de l'introspection sur :
- ADAPTATION : Comment tu t'es adapté à de nouveaux environnements (entreprise, projets inconnus)
- AUTONOMIE : Des moments où tu as dû te débrouiller seul
- INNOVATION : Des solutions créatives que tu as trouvées
- RELATIONNEL : Comment tu gères le travail en équipe, la communication
- CONNAISSANCE DES PARCOURS/MÉTIERS : Comment ta vision du métier a évolué""",
    "pn_competencies": [
        {
            "competence": "Réaliser un développement d'application",
            "level": "À COMPLÉTER – Ton niveau (Débutant/Intermédiaire/Avancé)",
            "evidence": "À COMPLÉTER – Exemples concrets de projets/réalisations qui prouvent cette compétence"
        },
        {
            "competence": "Optimiser des applications",
            "level": "À COMPLÉTER",
            "evidence": "À COMPLÉTER"
        },
        {
            "competence": "Administrer des systèmes informatiques",
            "level": "À COMPLÉTER",
            "evidence": "À COMPLÉTER"
        },
        {
            "competence": "Gérer des données",
            "level": "À COMPLÉTER",
            "evidence": "À COMPLÉTER"
        },
        {
            "competence": "Conduire un projet",
            "level": "À COMPLÉTER",
            "evidence": "À COMPLÉTER"
        },
        {
            "competence": "Collaborer au sein d'une équipe",
            "level": "À COMPLÉTER",
            "evidence": "À COMPLÉTER"
        }
    ]
}


@router.get(
    "/projects",
    response_model=list[Project],
    summary="Récupérer les projets",
    description="Retourne la liste de tous les projets réalisés par Amaury. "
                "Peut être filtré par technologie via le paramètre `stack`.",
)
def get_projects(
    stack: str | None = Query(default=None, description="Filtrer par technologie (ex: Python)")
) -> list[Project]:
    query = supabase.table("projects").select("*")
    
    if stack:
        # Supabase filtering for array containing element
        query = query.contains("stack", [stack])
        
    response = query.execute()
    return [Project.model_validate(p) for p in response.data]


@router.get(
    "/skills",
    response_model=list[Skill],
    summary="Récupérer les compétences",
    description="Retourne la liste des compétences techniques d'Amaury, "
                "optionnellement filtrées par catégorie.",
)
def get_skills(
    category: SkillCategory | None = Query(default=None, description="Filtrer par catégorie")
) -> list[Skill]:
    query = supabase.table("skills").select("*")
    
    if category:
        query = query.eq("category", category.value)
        
    response = query.execute()
    skills = [Skill.model_validate(s) for s in response.data]
    return sorted(skills, key=lambda s: s.level, reverse=True)


@router.get(
    "/resume",
    response_model=ResumeResponse,
    summary="Récupérer le résumé du profil",
    description="Retourne le profil complet d'Amaury : informations personnelles, "
                "expériences professionnelles et formation.",
)
def get_resume() -> ResumeResponse:
    # 1. Charger le profil
    profile_res = supabase.table("profile").select("*").eq("id", "main").single().execute()
    profile = profile_res.data
    
    # Enrichissement avec les nouveaux champs (si absents de la DB)
    profile.setdefault("phone", "06 46 29 15 39")
    profile.setdefault("resume_url", "/CV_Amaury_Le_Van.pdf") # Chemin par défaut
    
    # 2. Charger les expériences
    exp_res = supabase.table("experiences").select("*").order("order_index").execute()
    experiences = exp_res.data
    
    # Enrichissement spécifique (ex: CCMO)
    for exp in experiences:
        if "CCMO" in exp["company"]:
            exp.setdefault("location", "Beauvais, France")
            exp.setdefault("website_url", "https://www.ccmo.fr")
        elif "Amiens" in exp.get("location", "") or "UPJV" in exp["company"]:
             exp.setdefault("location", "Amiens, France")

    profile["experiences"] = experiences
    
    # 3. Éducation – Charger depuis Supabase ou utiliser le fallback
    try:
        edu_res = supabase.table("education").select("*").order("id").execute()
        if edu_res.data and len(edu_res.data) > 0:
            profile["education"] = edu_res.data
        else:
            profile["education"] = FALLBACK_EDUCATION
    except Exception:
        profile["education"] = FALLBACK_EDUCATION
    
    return ResumeResponse.model_validate(profile)


@router.get(
    "/references",
    response_model=list[Reference],
    summary="Récupérer les références / recommandations",
    description="Retourne la liste des personnes qui recommandent Amaury "
                "(tuteurs, enseignants, collègues).",
)
def get_references() -> list[Reference]:
    """Récupère les références depuis Supabase, avec fallback sur les données locales."""
    try:
        response = supabase.table("references").select("*").execute()
        if response.data and len(response.data) > 0:
            return [Reference.model_validate(r) for r in response.data]
    except Exception:
        pass
    
    # Fallback : données locales à compléter
    return [Reference.model_validate(r) for r in FALLBACK_REFERENCES]


@router.get(
    "/narrative",
    response_model=PortfolioNarrative,
    summary="Récupérer le narratif introspectif",
    description="Retourne le récit narratif du parcours d'Amaury : objectif, spécialité, "
                "réflexions, difficultés surmontées et compétences PN.",
)
def get_narrative() -> PortfolioNarrative:
    """Récupère le narratif depuis Supabase, avec fallback sur les données locales."""
    try:
        response = supabase.table("narrative").select("*").eq("id", "main").single().execute()
        if response.data:
            return PortfolioNarrative.model_validate(response.data)
    except Exception:
        pass
    
    # Fallback : données locales à compléter
    return PortfolioNarrative.model_validate(FALLBACK_NARRATIVE)


@router.post("/feedback", tags=["Interaction"], summary="Envoyer un feedback")
def post_feedback(message_id: str, is_positive: bool):
    """Enregistre un feedback (positif/négatif) pour une réponse du bot."""
    supabase.table("feedback").insert({
        "message_id": message_id,
        "is_positive": is_positive
    }).execute()
    return {"status": "success"}


@router.post("/analytics/question", tags=["Interaction"], summary="Log une question")
def post_question(question: str):
    """Enregistre une question posée pour analyse ultérieure."""
    supabase.table("analytics_questions").insert({"question": question}).execute()
    return {"status": "success"}


@router.post("/contact", tags=["Interaction"], summary="Envoyer un message de contact")
def post_contact(
    name: str = Body(...),
    email: str = Body(...),
    message: str = Body(...)
):
    """Enregistre une demande de contact et envoie un email."""
    # 1. Enregistrement en base de données (Supabase)
    supabase.table("contact_requests").insert({
        "name": name,
        "email": email,
        "message": message
    }).execute()
    
    # 2. Envoi de l'email réel (si la clé API est présente)
    if resend.api_key:
        try:
            resend.Emails.send({
                "from": "Portfolio <onboarding@resend.dev>",
                "to": "amaury24120606@gmail.com", # Remplace par ton vrai email si besoin
                "subject": f"Nouveau message de {name} via le Chatbot",
                "html": f"""
                    <h3>Nouveau message de contact</h3>
                    <p><strong>Nom :</strong> {name}</p>
                    <p><strong>Email :</strong> {email}</p>
                    <p><strong>Message :</strong></p>
                    <p>{message}</p>
                """
            })
        except Exception as e:
            print(f"Erreur d'envoi d'email : {e}")

    return {"status": "success"}
