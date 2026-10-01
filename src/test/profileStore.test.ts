import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SURAJ_PROFILE } from '../data/surajProfile';

// Fake Blob store whose access type we control.
const store: { access: 'public' | 'private'; data: string | null } = { access: 'public', data: null };
const URL_ = 'https://x.blob.vercel-storage.com/profile/profile.json';

vi.mock('@vercel/blob', () => ({
  put: vi.fn(async (_path: string, body: string, opts: { access: string }) => {
    if (opts.access !== store.access) throw new Error(`Vercel Blob: Cannot use ${opts.access} access on a ${store.access} store`);
    store.data = body;
    return { url: URL_ };
  }),
  list: vi.fn(async () => ({ blobs: store.data ? [{ pathname: 'profile/profile.json', url: URL_ }] : [] })),
  get: vi.fn(async (_url: string, opts: { access: string }) => {
    if (opts.access !== store.access) throw new Error('Vercel Blob: Access denied');
    return store.data ? { stream: new Response(store.data).body } : null;
  }),
}));

const mod = await import('../../server/profileStore');

describe.each(['public', 'private'] as const)('Blob store with %s access', (access) => {
  beforeEach(() => {
    store.access = access;
    store.data = null;
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'fake');
    mod.__resetProfileStoreForTests();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('returns the default before anything is saved', async () => {
    expect((await mod.getProfile()).title).toBe(SURAJ_PROFILE.title);
  });

  it('saves and a fresh server instance reads the saved version', async () => {
    await mod.saveProfile({ ...SURAJ_PROFILE, title: `Edited on ${access}` });
    mod.__resetProfileStoreForTests(); // simulate another serverless instance (no cache)
    expect((await mod.getProfile()).title).toBe(`Edited on ${access}`);
    const status = await mod.storageStatus();
    expect(status).toMatchObject({ configured: true, saved: true, access, error: null });
  });
});

describe('storage failures', () => {
  beforeEach(() => {
    vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'fake');
    mod.__resetProfileStoreForTests();
  });
  afterEach(() => vi.unstubAllEnvs());

  it('reports the real reason when every write fails', async () => {
    const { put } = await import('@vercel/blob');
    (put as any).mockRejectedValueOnce(new Error('This store has been suspended.')).mockRejectedValueOnce(new Error('This store has been suspended.'));
    await expect(mod.saveProfile(SURAJ_PROFILE)).rejects.toThrow(/STORAGE_WRITE_FAILED: .*suspended/);
  });
});
