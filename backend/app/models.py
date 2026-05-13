"""
Modèles Pydantic pour le Portfolio d'Amaury.
Chaque modèle valide et documente la structure des données de l'API.
"""

from enum import Enum
from pydantic import BaseModel, Field, HttpUrl


class SkillCategory(str, Enum):
    """Catégorie d'une compétence technique."""
    BACKEND = "Backend"
    FRONTEND = "Frontend"
    DEVOPS = "DevOps"
    DATA = "Data"
    OTHER = "Autre"


class Skill(BaseModel):
    """Compétence technique d'Amaury."""
    id: str = Field(description="Identifiant unique de la compétence (slug)")
    name: str = Field(description="Nom de la compétence (ex: Python)")
    level: int = Field(ge=1, le=5, description="Niveau de maîtrise de 1 (débutant) à 5 (expert)")
    category: SkillCategory = Field(description="Catégorie de la compétence")
    icon: str | None = Field(default=None, description="Nom de l'icône (ex: 'python', 'react')")


class Project(BaseModel):
    """Projet réalisé par Amaury."""
    id: str = Field(description="Identifiant unique du projet (slug)")
    title: str = Field(description="Titre du projet")
    description: str = Field(description="Description courte du projet")
    stack: list[str] = Field(description="Liste des technologies utilisées")
    github_url: str | None = Field(default=None, description="URL du dépôt GitHub")
    image_url: str | None = Field(default=None, description="URL de l'image de prévisualisation")
    highlights: list[str] = Field(default_factory=list, description="Points clés / accomplissements")


class Experience(BaseModel):
    """Expérience professionnelle ou académique d'Amaury."""
    id: str = Field(description="Identifiant unique de l'expérience")
    company: str = Field(description="Nom de l'entreprise ou de l'institution")
    role: str = Field(description="Intitulé du poste")
    duration: str = Field(description="Durée (ex: Sept. 2024 – Août 2025)")
    is_current: bool = Field(default=False, description="True si c'est le poste actuel")
    achievements: list[str] = Field(description="Liste des réalisations / responsabilités")
    tags: list[str] = Field(default_factory=list, description="Tags (alternance, stage, etc.)")
    location: str | None = Field(default=None, description="Ville / Région")
    website_url: str | None = Field(default=None, description="Lien vers le site de l'entreprise")
    narrative_detail: str | None = Field(default=None, description="Récit narratif détaillé de l'expérience (introspection)")


class Education(BaseModel):
    """Formation académique d'Amaury."""
    id: str = Field(description="Identifiant unique de la formation")
    institution: str = Field(description="Nom de l'établissement")
    degree: str = Field(description="Intitulé du diplôme")
    duration: str = Field(description="Période (ex: 2023 – 2026)")
    description: str = Field(default="", description="Description de la formation")
    location: str | None = Field(default=None, description="Ville")


class Reference(BaseModel):
    """Personne pouvant attester des capacités d'Amaury (recommandation)."""
    id: str = Field(description="Identifiant unique")
    name: str = Field(description="Nom complet de la personne")
    role: str = Field(description="Rôle (ex: Tuteur d'entreprise, Enseignant)")
    company: str = Field(description="Entreprise ou institution")
    quote: str = Field(description="Citation / recommandation")
    relationship: str = Field(description="Relation avec Amaury (ex: Tuteur lors de l'alternance)")


class PortfolioNarrative(BaseModel):
    """Narratif introspectif du parcours d'Amaury pour l'évaluation portfolio."""
    title: str = Field(description="Titre du narratif")
    objective: str = Field(description="Objectif professionnel clair")
    specialty: str = Field(description="Spécialité / domaine de prédilection")
    target_job: str = Field(description="Métier envisagé")
    personal_quote: str = Field(description="Citation qui résume et représente Amaury")
    narrative_text: str = Field(description="Récit narratif introspectif (1 page)")
    skills_reflection: str = Field(description="Réflexion sur les acquis")
    difficulties_overcome: str = Field(description="Difficultés surmontées, adaptation, autonomie")
    pn_competencies: list[dict] = Field(default_factory=list, description="Compétences PN BUT Informatique")


class ResumeResponse(BaseModel):
    """Résumé complet du profil d'Amaury."""
    name: str
    title: str
    summary: str
    email: str | None = None
    phone: str | None = None
    github: str | None = None
    linkedin: str | None = None
    location: str
    experiences: list[Experience]
    education: list[Education]
    resume_url: str | None = Field(default=None, description="Lien vers le CV PDF")
