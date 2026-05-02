import os
from pathlib import Path
import google.generativeai as genai
from dotenv import load_dotenv

# Charger les variables du fichier .env (en cherchant aussi dans les dossiers parents)
load_dotenv(Path(__file__).parent.parent / ".env")
load_dotenv() # Au cas où il soit localement dans backend

api_key = os.environ.get("GOOGLE_GENERATIVE_AI_API_KEY")

if not api_key:
    print("ERREUR : Pas de clé API trouvée dans le .env")
else:
    genai.configure(api_key=api_key)
    print("--- Modèles disponibles pour ta clé ---")
    try:
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                print(f"- {m.name}")
    except Exception as e:
        print(f"Erreur lors de la récupération : {e}")
