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
  location?: string;
  website_url?: string;
  narrative_detail?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  duration: string;
  description: string;
  location?: string;
}

export interface Reference {
  id: string;
  name: string;
  role: string;
  company: string;
  quote: string;
  relationship: string;
}

export interface PortfolioNarrative {
  title: string;
  objective: string;
  specialty: string;
  target_job: string;
  personal_quote: string;
  narrative_text: string;
  skills_reflection: string;
  difficulties_overcome: string;
  pn_competencies: Array<{
    competence: string;
    level: string;
    evidence: string;
  }>;
}

export interface ResumeResponse {
  name: string;
  title: string;
  summary: string;
  email: string | null;
  phone: string | null;
  github: string | null;
  linkedin: string | null;
  location: string;
  experiences: Experience[];
  education: Education[];
  resume_url: string | null;
}
