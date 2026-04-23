# Dockerfile – Backend Portfolio (FastAPI)
# Build  : docker build -t portfolio-backend .
# Run    : docker run -p 8000:8000 portfolio-backend

FROM python:3.11-slim

WORKDIR /app

# Installer uv pour la gestion des dépendances
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copier les fichiers de configuration
COPY pyproject.toml ./

# Installer les dépendances (sans les dev)
RUN uv sync --no-dev

# Copier le code source
COPY app/ ./app/

# Exposer le port
EXPOSE 8000

# Démarrer Uvicorn
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
