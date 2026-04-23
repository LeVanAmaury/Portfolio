# Portfolio Intelligent – Amaury Levan

Portfolio interactif sous forme de **chatbot IA**. Le visiteur pose des questions et le bot génère dynamiquement des composants visuels (cartes de projets, grilles de compétences, fiche de profil) via **Google Gemini** et le **Vercel AI SDK**.

---

## 🏗️ Architecture

```
Portfolio/
├── backend/          # FastAPI (Python 3.11+) – API REST données
│   ├── app/
│   │   ├── main.py       # Point d'entrée + CORS
│   │   ├── models.py     # Modèles Pydantic (Skill, Project, Experience)
│   │   ├── routes.py     # Endpoints /api/projects, /api/skills, /api/resume
│   │   └── data/         # Données JSON mockées
│   ├── tests/
│   │   └── test_api.py   # Tests pytest
│   ├── pyproject.toml    # Config uv / dépendances
│   └── Dockerfile
└── frontend/         # Next.js 15 – Interface & Generative UI
    ├── app/
    │   ├── api/chat/route.ts  # LLM Gemini + Tool Calling
    │   ├── page.tsx           # Page principale
    │   └── layout.tsx         # Layout + SEO
    ├── components/
    │   ├── Chat.tsx           # Interface de conversation
    │   ├── GenerativeUI.tsx   # Dispatcher de composants visuels
    │   └── ui/
    │       ├── ProjectCard.tsx
    │       ├── SkillBadge.tsx
    │       └── ExperienceCard.tsx
    └── lib/
        └── types.ts           # Types TypeScript (miroir des modèles Pydantic)
```

---

## 🚀 Installation & Démarrage

### Prérequis
- **Python 3.11+** avec [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- **Node.js 20+** et **npm**
- Une clé API **Google Gemini** : [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

### 1. Backend Python (FastAPI)

```bash
# Se placer dans le dossier backend
cd backend

# Créer l'environnement virtuel et installer les dépendances
uv sync

# Copier et remplir le fichier .env
cp .env.example .env

# Lancer le serveur de développement
uv run uvicorn app.main:app --reload
```

➡️ API disponible sur `http://localhost:8000`  
➡️ Documentation Swagger : `http://localhost:8000/docs`

#### Lancer les tests
```bash
cd backend
uv run pytest -v
```

---

### 2. Frontend Next.js

```bash
# Se placer dans le dossier frontend
cd frontend

# Installer les dépendances
npm install

# Copier et remplir le fichier .env.local
cp .env.example .env.local
# → Renseigner GOOGLE_GENERATIVE_AI_API_KEY

# Lancer le serveur de développement
npm run dev
```

➡️ Interface disponible sur `http://localhost:3000`

---

## 🐳 Docker (Backend)

```bash
cd backend
docker build -t portfolio-backend .
docker run -p 8000:8000 portfolio-backend
```

---

## 🌐 Déploiement

| Composant | Plateforme | Notes |
|-----------|-----------|-------|
| **Frontend** | [Vercel](https://vercel.com) | Déploiement automatique depuis GitHub |
| **Backend** | [Railway](https://railway.app) / [Render](https://render.com) | Via Dockerfile |

Variables d'environnement à configurer sur Vercel :
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `BACKEND_API_URL` → URL publique du backend déployé

---

## ✅ Critères de Réussite

- [x] API Python documentée et typée (zéro `Any`)
- [x] Tool Calling fonctionnel (Gemini appelle les endpoints FastAPI)
- [x] Composants visuels générés dynamiquement dans le chat
- [x] Tests unitaires pytest (couverture > 80%)
- [x] Dockerisation du backend
- [ ] Déploiement Vercel + Railway
- [ ] Migration données vers Supabase
=======
# Portfolio
A *PORTFOLIO*
>>>>>>> 42426d5d177cfd18d2804a94fc66acddb97febdd
