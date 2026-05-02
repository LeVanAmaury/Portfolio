"""
Routes FastAPI pour le Portfolio d'Amaury.
Expose les endpoints /api/projects, /api/skills et /api/resume.
"""

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query

from app.models import Project, Skill, SkillCategory, ResumeResponse, Experience
from app.supabase_client import supabase

router = APIRouter(prefix="/api", tags=["Portfolio"])

# Les fonctions de chargement JSON sont conservées en secours ou supprimées.
# Ici nous passons directement à Supabase.


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
    
    # 2. Charger les expériences
    exp_res = supabase.table("experiences").select("*").order("order_index").execute()
    profile["experiences"] = exp_res.data
    
    # 3. Éducation (vide pour l'instant ou chargé depuis une table)
    profile["education"] = []
    
    return ResumeResponse.model_validate(profile)


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
def post_contact(name: str, email: str, message: str):
    """Enregistre une demande de contact dans la base de données."""
    supabase.table("contact_requests").insert({
        "name": name,
        "email": email,
        "message": message
    }).execute()
    # Ici, on pourrait ajouter un envoi d'email via Resend/SendGrid
    return {"status": "success"}
