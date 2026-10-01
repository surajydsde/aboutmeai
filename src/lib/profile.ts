// Shared by the browser and the server (api/ + server/).
// Keep this file free of browser- or Node-only APIs, and keep imports type-only.
import type { UserProfileData, ExperienceItem, ProjectItem } from '../types';

export const SKILL_GROUPS: { key: keyof UserProfileData['skills']; label: string }[] = [
  { key: 'frontend', label: 'Frontend' },
  { key: 'backend', label: 'Backend & APIs' },
  { key: 'databases', label: 'Databases' },
  { key: 'cloudDevOps', label: 'Cloud & DevOps' },
  { key: 'aiGenAi', label: 'AI / GenAI' },
  { key: 'testing', label: 'Testing' },
  { key: 'security', label: 'Security' },
];

const LIMITS = {
  short: 200,
  long: 4000,
  listItems: 60,
  sectionItems: 30,
};

export class ProfileValidationError extends Error {}

function str(value: unknown, field: string, max: number, required = false): string {
  if (value === undefined || value === null) {
    if (required) throw new ProfileValidationError(`${field} is required`);
    return '';
  }
  if (typeof value !== 'string') throw new ProfileValidationError(`${field} must be text`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new ProfileValidationError(`${field} is required`);
  if (trimmed.length > max) throw new ProfileValidationError(`${field} is too long (max ${max} characters)`);
  return trimmed;
}

function strList(value: unknown, field: string, maxItems = LIMITS.listItems, maxLen = LIMITS.long): string[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new ProfileValidationError(`${field} must be a list`);
  if (value.length > maxItems) throw new ProfileValidationError(`${field} has too many items (max ${maxItems})`);
  return value
    .map((item, i) => str(item, `${field} #${i + 1}`, maxLen))
    .filter((item) => item.length > 0);
}

/**
 * Checks untrusted input (from the owner editor or from storage) and returns a clean profile.
 * Throws ProfileValidationError with a readable message when something is wrong.
 */
export function normalizeProfile(raw: unknown): UserProfileData {
  if (!raw || typeof raw !== 'object') throw new ProfileValidationError('Profile must be an object');
  const r = raw as Record<string, any>;
  const skillsRaw = (r.skills && typeof r.skills === 'object' ? r.skills : {}) as Record<string, unknown>;

  const skills = Object.fromEntries(
    SKILL_GROUPS.map(({ key, label }) => [key, strList(skillsRaw[key], `Skills: ${label}`, LIMITS.listItems, LIMITS.short)])
  ) as UserProfileData['skills'];

  if (r.experiences !== undefined && !Array.isArray(r.experiences)) throw new ProfileValidationError('Experience must be a list');
  if (r.projects !== undefined && !Array.isArray(r.projects)) throw new ProfileValidationError('Projects must be a list');
  if ((r.experiences || []).length > LIMITS.sectionItems) throw new ProfileValidationError('Too many experience entries');
  if ((r.projects || []).length > LIMITS.sectionItems) throw new ProfileValidationError('Too many projects');

  const experiences: ExperienceItem[] = (r.experiences || []).map((e: any, i: number) => {
    const n = `Experience #${i + 1}`;
    if (!e || typeof e !== 'object') throw new ProfileValidationError(`${n} is invalid`);
    const location = str(e.location, `${n} location`, LIMITS.short);
    return {
      company: str(e.company, `${n} company`, LIMITS.short, true),
      role: str(e.role, `${n} role`, LIMITS.short, true),
      period: str(e.period, `${n} period`, LIMITS.short),
      ...(location ? { location } : {}),
      highlights: strList(e.highlights, `${n} highlights`),
    };
  });

  const projects: ProjectItem[] = (r.projects || []).map((p: any, i: number) => {
    const n = `Project #${i + 1}`;
    if (!p || typeof p !== 'object') throw new ProfileValidationError(`${n} is invalid`);
    const impact = str(p.impact, `${n} impact`, LIMITS.long);
    return {
      title: str(p.title, `${n} title`, LIMITS.short, true),
      subtitle: str(p.subtitle, `${n} subtitle`, LIMITS.short),
      description: str(p.description, `${n} description`, LIMITS.long),
      ...(impact ? { impact } : {}),
      technologies: strList(p.technologies, `${n} technologies`, LIMITS.listItems, LIMITS.short),
    };
  });

  return {
    name: str(r.name, 'Name', LIMITS.short, true),
    title: str(r.title, 'Title', LIMITS.short),
    location: str(r.location, 'Location', LIMITS.short),
    email: str(r.email, 'Email', LIMITS.short),
    phone: str(r.phone, 'Phone', LIMITS.short),
    linkedin: str(r.linkedin, 'LinkedIn', LIMITS.short).replace(/^https?:\/\//i, ''),
    summary: str(r.summary, 'Summary', LIMITS.long),
    experienceYears: str(r.experienceYears, 'Years of experience', 20),
    skills,
    experiences,
    projects,
    awards: strList(r.awards, 'Awards'),
    certifications: strList(r.certifications, 'Certifications'),
    education: str(r.education, 'Education', LIMITS.long),
    aiNotes: str(r.aiNotes, 'Notes for the AI', LIMITS.long * 2),
  };
}

/** Turns the structured profile into the plain-text knowledge the AI reads. */
export function buildProfileContext(p: UserProfileData): string {
  const lines: string[] = [];
  const section = (title: string) => lines.push('', `${title}:`);

  lines.push(`Candidate Profile: ${p.name}`);
  if (p.title) lines.push(`Role: ${p.title}`);
  if (p.experienceYears) lines.push(`Experience: ${p.experienceYears} years`);
  if (p.location) lines.push(`Location: ${p.location}`);
  if (p.phone) lines.push(`Phone: ${p.phone}`);
  if (p.email) lines.push(`Email: ${p.email}`);
  if (p.linkedin) lines.push(`LinkedIn: ${p.linkedin}`);

  if (p.summary) {
    section('PROFESSIONAL SUMMARY');
    lines.push(p.summary);
  }

  const skillLines = SKILL_GROUPS.filter(({ key }) => p.skills[key]?.length).map(
    ({ key, label }) => `- ${label}: ${p.skills[key].join(', ')}`
  );
  if (skillLines.length) {
    section('TECHNICAL SKILLS');
    lines.push(...skillLines);
  }

  if (p.experiences.length) {
    section('WORK EXPERIENCE');
    p.experiences.forEach((e, i) => {
      const meta = [e.period, e.location].filter(Boolean).join(', ');
      lines.push(`${i + 1}. ${e.role} — ${e.company}${meta ? ` (${meta})` : ''}`);
      e.highlights.forEach((h) => lines.push(`   - ${h}`));
    });
  }

  if (p.projects.length) {
    section('FEATURED PROJECTS');
    p.projects.forEach((proj) => {
      lines.push(`- ${proj.title}${proj.subtitle ? ` (${proj.subtitle})` : ''}`);
      if (proj.description) lines.push(`  ${proj.description}`);
      if (proj.impact) lines.push(`  Impact: ${proj.impact}`);
      if (proj.technologies.length) lines.push(`  Technologies: ${proj.technologies.join(', ')}`);
    });
  }

  if (p.awards.length) {
    section('AWARDS & RECOGNITION');
    p.awards.forEach((a) => lines.push(`- ${a}`));
  }

  if (p.certifications.length) {
    section('CERTIFICATIONS');
    p.certifications.forEach((c) => lines.push(`- ${c}`));
  }

  if (p.education) {
    section('EDUCATION');
    lines.push(`- ${p.education}`);
  }

  if (p.aiNotes) {
    section('ADDITIONAL NOTES FROM THE OWNER');
    lines.push(p.aiNotes);
  }

  return lines.join('\n').trim();
}
