export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface SuggestionChip {
  id: string;
  text: string;
  category?: 'skills' | 'experience' | 'projects' | 'contact' | 'education';
}

export interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  location?: string;
  highlights: string[];
}

export interface ProjectItem {
  title: string;
  subtitle: string;
  description: string;
  impact?: string;
  technologies: string[];
}

export interface UserProfileData {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  summary: string;
  skills: {
    frontend: string[];
    backend: string[];
    databases: string[];
    cloudDevOps: string[];
    aiGenAi: string[];
    testing: string[];
    security: string[];
  };
  experiences: ExperienceItem[];
  projects: ProjectItem[];
  awards: string[];
  certifications: string[];
  education: string;
}
