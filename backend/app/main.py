"""
Point d'entrée de l'API FastAPI – Portfolio Intelligent d'Amaury.

Démarrer le serveur de développement :
    uv run uvicorn app.main:app --reload

Documentation Swagger disponible sur : http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import router

app = FastAPI(
    title="Portfolio API – Amaury Levan",
    description=(
        "API REST documentée servant les données du portfolio d'Amaury. "
        "Utilisée par le chatbot IA (Google Gemini) pour répondre aux questions des visiteurs "
        "via le mécanisme de Tool Calling du Vercel AI SDK."
    ),
    version="1.0.0",
    contact={
        "name": "Amaury Levan",
        "url": "https://github.com/LeVanAmaury",
    },
)

# ─── CORS ────────────────────────────────────────────────────────────────────
# Autoriser le frontend Next.js (dev + prod) à appeler l'API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev
        "https://*.vercel.app",  # Déploiement Vercel
    ],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ─── Routes ──────────────────────────────────────────────────────────────────
app.include_router(router)


@app.get("/health", tags=["Système"], summary="Vérifier l'état du service")
def health_check() -> dict[str, str]:
    """Endpoint de santé pour les health checks Docker / Railway."""
    return {"status": "ok", "service": "portfolio-api"}
