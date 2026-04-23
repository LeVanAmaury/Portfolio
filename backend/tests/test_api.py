"""
Tests unitaires pour l'API Portfolio.

Lancer les tests :
    uv run pytest
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.models import Project, Skill, SkillCategory, ResumeResponse

client = TestClient(app)


# ─── /health ─────────────────────────────────────────────────────────────────

def test_health_check() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


# ─── /api/projects ───────────────────────────────────────────────────────────

def test_get_projects_returns_list() -> None:
    response = client.get("/api/projects")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_get_projects_valid_schema() -> None:
    """Chaque projet doit correspondre au modèle Pydantic Project."""
    response = client.get("/api/projects")
    for item in response.json():
        project = Project.model_validate(item)
        assert project.id
        assert project.title
        assert isinstance(project.stack, list)


def test_get_projects_filter_by_stack() -> None:
    response = client.get("/api/projects?stack=Python")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    for project in data:
        assert any("python" in s.lower() for s in project["stack"])


def test_get_projects_filter_unknown_stack() -> None:
    response = client.get("/api/projects?stack=COBOL")
    assert response.status_code == 200
    assert response.json() == []


# ─── /api/skills ─────────────────────────────────────────────────────────────

def test_get_skills_returns_list() -> None:
    response = client.get("/api/skills")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_skills_valid_schema() -> None:
    """Chaque compétence doit correspondre au modèle Pydantic Skill."""
    response = client.get("/api/skills")
    for item in response.json():
        skill = Skill.model_validate(item)
        assert 1 <= skill.level <= 5
        assert skill.category in SkillCategory


def test_get_skills_sorted_by_level_desc() -> None:
    response = client.get("/api/skills")
    levels = [s["level"] for s in response.json()]
    assert levels == sorted(levels, reverse=True)


def test_get_skills_filter_by_category() -> None:
    response = client.get("/api/skills?category=Backend")
    assert response.status_code == 200
    for skill in response.json():
        assert skill["category"] == "Backend"


# ─── /api/resume ─────────────────────────────────────────────────────────────

def test_get_resume_returns_object() -> None:
    response = client.get("/api/resume")
    assert response.status_code == 200
    resume = ResumeResponse.model_validate(response.json())
    assert resume.name
    assert resume.location


def test_get_resume_has_experiences() -> None:
    response = client.get("/api/resume")
    data = response.json()
    assert "experiences" in data
    assert len(data["experiences"]) > 0
    exp = data["experiences"][0]
    assert "company" in exp
    assert "role" in exp
    assert isinstance(exp["achievements"], list)
