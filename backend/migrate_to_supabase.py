import json
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

# Charger les variables d'env
load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

DATA_DIR = Path(__file__).parent / "app" / "data"

def migrate_projects():
    print("Migrating projects...")
    with open(DATA_DIR / "projects.json", encoding="utf-8") as f:
        projects = json.load(f)
    
    for p in projects:
        # On utilise upsert pour pouvoir relancer le script sans erreurs
        supabase.table("projects").upsert(p).execute()
    print("Projects migrated!")

def migrate_skills():
    print("Migrating skills...")
    with open(DATA_DIR / "skills.json", encoding="utf-8") as f:
        skills = json.load(f)
    
    for s in skills:
        supabase.table("skills").upsert(s).execute()
    print("Skills migrated!")

def migrate_resume():
    print("Migrating resume/profile...")
    with open(DATA_DIR / "resume.json", encoding="utf-8") as f:
        resume = json.load(f)
    
    # Séparer le profil des expériences
    experiences = resume.pop("experiences", [])
    education = resume.pop("education", [])
    
    # Profil
    resume["id"] = "main"
    supabase.table("profile").upsert(resume).execute()
    
    # Expériences
    for i, exp in enumerate(experiences):
        exp["order_index"] = i
        supabase.table("experiences").upsert(exp).execute()
    
    print("Resume migrated!")

if __name__ == "__main__":
    try:
        migrate_projects()
        migrate_skills()
        migrate_resume()
        print("\nMigration terminee avec succes !")
    except Exception as e:
        print(f"\nErreur lors de la migration : {e}")
        print("\nIMPORTANT: Verifie que tu as desactive RLS sur tes tables Supabase")
        print("ou ajoute des politiques d'insertion pour le role 'anon'.")
