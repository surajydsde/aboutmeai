import { describe, it, expect } from 'vitest';
import { SURAJ_PROFILE, DEFAULT_SUGGESTION_CHIPS } from '../data/surajProfile';

describe('Suraj Profile Data Integrity', () => {
  it('contains valid candidate contact and title info', () => {
    expect(SURAJ_PROFILE.name).toBe('Suraj Yadav');
    expect(SURAJ_PROFILE.title).toContain('Full-Stack Developer');
    expect(SURAJ_PROFILE.email).toBe('surajyadav.sde@gmail.com');
    expect(SURAJ_PROFILE.phone).toBe('+91 8286683658');
    expect(SURAJ_PROFILE.linkedin).toContain('linkedin.com/in/surajyadavsde');
    expect(SURAJ_PROFILE.location).toBe('Mumbai, India');
  });

  it('includes key metrics and achievements in summary and projects', () => {
    expect(SURAJ_PROFILE.summary).toContain('7+ years');
    expect(SURAJ_PROFILE.summary).toContain('50%');

    const projectImpacts = SURAJ_PROFILE.projects.map((p) => p.impact).join(' ');
    expect(projectImpacts).toContain('40%');
    expect(projectImpacts).toContain('10,671');
  });

  it('verifies TUM Generative AI certification is included', () => {
    const certNames = SURAJ_PROFILE.certifications.join(' ');
    expect(certNames).toContain('Generative AI');
    expect(certNames).toContain('TUM');
  });

  it('verifies RAG AI Agent project details', () => {
    const ragProject = SURAJ_PROFILE.projects.find((p) =>
      p.title.toLowerCase().includes('rag')
    );
    expect(ragProject).toBeDefined();
    expect(ragProject?.technologies).toContain('Gemini LLM');
    expect(ragProject?.technologies).toContain('LangGraph');
  });

  it('verifies suggestion chips list is non-empty and well structured', () => {
    expect(DEFAULT_SUGGESTION_CHIPS.length).toBeGreaterThanOrEqual(4);
    for (const chip of DEFAULT_SUGGESTION_CHIPS) {
      expect(chip.id).toBeDefined();
      expect(chip.text.length).toBeGreaterThan(5);
    }
  });
});
