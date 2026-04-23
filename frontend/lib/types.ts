/**
 * Types TypeScript miroirs des modèles Pydantic du backend FastAPI.
 * Mis à jour ici si les modèles Python évoluent.
 */

export type SkillCategory = "Backend" | "Frontend" | "DevOps" | "Data" | "Autre";

export interface Skill {
  id: string;
  name: string;
  level: number; // 1–5
  category: SkillCategory;
  icon: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  stack: string[];
  github_url: string | null;
  image_url: string | null;
  highlights: string[];
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  is_current: boolean;
  achievements: string[];
  tags: string[];
}

export interface ResumeResponse {
  name: string;
  title: string;
  summary: string;
  email: string | null;
  github: string | null;
  linkedin: string | null;
  location: string;
  experiences: Experience[];
  education: Record<string, unknown>[];
}
