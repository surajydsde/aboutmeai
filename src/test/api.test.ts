import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SURAJ_PROFILE } from '../data/surajProfile';
import { buildProfileContext, normalizeProfile, ProfileValidationError } from '../lib/profile';
import { checkPasscode, issueToken, verifyToken, tokenFromHeader } from '../../server/auth';
import { rateLimit, __resetRateLimitsForTests } from '../../server/rateLimit';
import { getProfile, saveProfile, __resetProfileStoreForTests } from '../../server/profileStore';
import { classifyGeminiError, buildSystemInstruction, CANDIDATE_MODELS } from '../../api/index';

describe('profile normalization', () => {
  it('accepts the bundled profile unchanged', () => {
    expect(normalizeProfile(SURAJ_PROFILE)).toEqual(SURAJ_PROFILE);
  });

  it('trims text, drops empty list items and strips https from LinkedIn', () => {
    const p = normalizeProfile({ ...SURAJ_PROFILE, name: '  Suraj  ', awards: ['A', '  ', 'B'], linkedin: 'https://linkedin.com/in/x' });
    expect(p.name).toBe('Suraj');
    expect(p.awards).toEqual(['A', 'B']);
    expect(p.linkedin).toBe('linkedin.com/in/x');
  });

  it('rejects bad input with a readable message', () => {
    expect(() => normalizeProfile({ ...SURAJ_PROFILE, name: '' })).toThrow(ProfileValidationError);
    expect(() => normalizeProfile({ ...SURAJ_PROFILE, summary: 'x'.repeat(5000) })).toThrow(/Summary is too long/);
    expect(() => normalizeProfile({ ...SURAJ_PROFILE, experiences: [{ company: 'X' }] })).toThrow(/Experience #1 role is required/);
    expect(() => normalizeProfile(null)).toThrow();
  });
});

describe('AI context built from the profile', () => {
  it('includes every section of the resume', () => {
    const ctx = buildProfileContext(SURAJ_PROFILE);
    for (const text of ['Suraj Yadav', 'PROFESSIONAL SUMMARY', 'Tata Consultancy Services', 'PayPal', '10,671', 'TUM', 'University of Mumbai', 'Mocha']) {
      expect(ctx).toContain(text);
    }
  });

  it('reflects edits, including private AI notes', () => {
    const ctx = buildProfileContext({ ...SURAJ_PROFILE, title: 'Principal Engineer', aiNotes: 'Notice period 60 days', phone: '' });
    expect(ctx).toContain('Role: Principal Engineer');
    expect(ctx).toContain('Notice period 60 days');
    expect(ctx).not.toContain('Phone:');
  });

  it('system instruction uses the profile name and forbids invention', () => {
    const si = buildSystemInstruction({ ...SURAJ_PROFILE, name: 'Test Person' });
    expect(si).toContain('representing Test Person');
    expect(si).toMatch(/Never invent/);
  });
});

describe('owner auth', () => {
  beforeEach(() => vi.stubEnv('OWNER_PASSCODE', 'correct horse'));
  afterEach(() => vi.unstubAllEnvs());

  it('checks the passcode from the environment', () => {
    expect(checkPasscode('correct horse')).toBe(true);
    expect(checkPasscode(' correct horse ')).toBe(true);
    expect(checkPasscode('wrong')).toBe(false);
    expect(checkPasscode(undefined)).toBe(false);
  });

  it('refuses everything when no passcode is configured', () => {
    vi.stubEnv('OWNER_PASSCODE', '');
    expect(checkPasscode('')).toBe(false);
    expect(verifyToken('a.b')).toBe(false);
  });

  it('issues tokens that verify, expire and cannot be forged', () => {
    const now = Date.now();
    const { token } = issueToken(now);
    expect(verifyToken(token, now + 1000)).toBe(true);
    expect(verifyToken(token, now + 13 * 60 * 60 * 1000)).toBe(false);
    const [payload] = token.split('.');
    expect(verifyToken(`${payload}.forged`, now)).toBe(false);
    vi.stubEnv('OWNER_PASSCODE', 'rotated');
    expect(verifyToken(token, now)).toBe(false);
  });

  it('reads bearer tokens', () => {
    expect(tokenFromHeader('Bearer abc.def')).toBe('abc.def');
    expect(tokenFromHeader('abc')).toBeNull();
  });
});

describe('profile store (no Blob token: in-memory)', () => {
  beforeEach(() => __resetProfileStoreForTests());

  it('returns the bundled profile until something is saved', async () => {
    expect((await getProfile()).name).toBe('Suraj Yadav');
    await saveProfile({ ...SURAJ_PROFILE, title: 'Edited Title' });
    expect((await getProfile()).title).toBe('Edited Title');
  });

  it('refuses to save on Vercel without storage', async () => {
    vi.stubEnv('VERCEL', '1');
    await expect(saveProfile(SURAJ_PROFILE)).rejects.toThrow('STORAGE_NOT_CONFIGURED');
    vi.unstubAllEnvs();
  });
});

describe('rate limiting and error handling', () => {
  beforeEach(() => __resetRateLimitsForTests());

  it('blocks after the limit within a window', () => {
    const now = 1_000_000;
    for (let i = 0; i < 3; i++) expect(rateLimit('k', 3, 60_000, now).ok).toBe(true);
    expect(rateLimit('k', 3, 60_000, now).ok).toBe(false);
    expect(rateLimit('k', 3, 60_000, now + 60_001).ok).toBe(true);
  });

  it('classifies Gemini errors', () => {
    expect(classifyGeminiError({ status: 429 })).toBe('quota');
    expect(classifyGeminiError({ message: 'RESOURCE_EXHAUSTED' })).toBe('quota');
    expect(classifyGeminiError({ status: 403 })).toBe('auth');
    expect(classifyGeminiError(new Error('AI_NOT_CONFIGURED'))).toBe('auth');
    expect(classifyGeminiError({ status: 404 })).toBe('model');
    expect(classifyGeminiError(new Error('socket hang up'))).toBe('other');
  });

  it('uses current models, newest first', () => {
    expect(CANDIDATE_MODELS[0]).toBe('gemini-3.8-flash');
    expect(CANDIDATE_MODELS.some((m) => m.startsWith('gemini-2.5'))).toBe(false);
  });
});
