"""
Routes FastAPI pour le Portfolio d'Amaury.
Expose les endpoints /api/projects, /api/skills et /api/resume.
"""

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Query

from app.models import Project, Skill, SkillCategory, ResumeResponse, Experience

router = APIRouter(prefix="/api", tags=["Portfolio"])

# Chemin vers les fichiers de données JSON
DATA_DIR = Path(__file__).parent / "data"


def _load_json(filename: str) -> list | dict:
    """Charge un fichier JSON depuis le répertoire de données."""
    filepath = DATA_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=500, detail=f"Fichier de données manquant : {filename}")
    with open(filepath, encoding="utf-8") as f:
        return json.load(f)


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
    raw = _load_json("projects.json")
    projects = [Project.model_validate(p) for p in raw]
    if stack:
        stack_lower = stack.lower()
        projects = [p for p in projects if any(stack_lower in s.lower() for s in p.stack)]
    return projects


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
    raw = _load_json("skills.json")
    skills = [Skill.model_validate(s) for s in raw]
    if category:
        skills = [s for s in skills if s.category == category]
    return sorted(skills, key=lambda s: s.level, reverse=True)


@router.get(
    "/resume",
    response_model=ResumeResponse,
    summary="Récupérer le résumé du profil",
    description="Retourne le profil complet d'Amaury : informations personnelles, "
                "expériences professionnelles et formation.",
)
def get_resume() -> ResumeResponse:
    raw = _load_json("resume.json")
    raw["experiences"] = [Experience.model_validate(e) for e in raw.get("experiences", [])]
    return ResumeResponse.model_validate(raw)
