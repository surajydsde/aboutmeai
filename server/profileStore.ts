import { get, list, put } from '@vercel/blob';
import type { UserProfileData } from '../src/types.js';
import { SURAJ_PROFILE } from '../src/data/surajProfile.js';
import { normalizeProfile } from '../src/lib/profile.js';

// The live profile is one JSON file in a Vercel Blob store.
// Connecting a Blob store to the Vercel project adds BLOB_READ_WRITE_TOKEN automatically.
// Without it (e.g. local dev), edits are kept in memory until the server restarts.
//
// Blob stores can be created as private or public. We prefer private, and fall back to
// public automatically, remembering whichever the store accepts.
const BLOB_PATH = 'profile/profile.json';
const CACHE_MS = 10_000;
type Access = 'private' | 'public';

let cache: { profile: UserProfileData; at: number } | null = null;
let memoryProfile: UserProfileData | null = null;
let workingAccess: Access | null = null;
let lastStorageError: string | null = null;

export function hasPersistentStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function accessOrder(): Access[] {
  const preferred = (process.env.BLOB_ACCESS === 'public' ? 'public' : workingAccess) || 'private';
  return preferred === 'public' ? ['public', 'private'] : ['private', 'public'];
}

function describe(err: any): string {
  return String(err?.message || err || 'Unknown storage error');
}

async function streamToText(stream: unknown): Promise<string> {
  return new Response(stream as ReadableStream).text();
}

/** Returns the stored profile, null if nothing has been saved yet, or throws if storage can't be read. */
async function readFromBlob(): Promise<UserProfileData | null> {
  const { blobs } = await list({ prefix: BLOB_PATH, limit: 5 });
  const blob = blobs.find((b) => b.pathname === BLOB_PATH);
  if (!blob) return null;

  const errors: string[] = [];
  for (const access of accessOrder()) {
    try {
      const result = await get(blob.url, { access, useCache: false });
      if (!result || !result.stream) continue;
      const profile = normalizeProfile(JSON.parse(await streamToText(result.stream)));
      workingAccess = access;
      return profile;
    } catch (err) {
      errors.push(`${access}: ${describe(err)}`);
    }
  }

  // Last resort for public stores: fetch the URL directly, bypassing the CDN cache.
  try {
    const res = await fetch(`${blob.url}${blob.url.includes('?') ? '&' : '?'}v=${Date.now()}`, { cache: 'no-store' });
    if (res.ok) return normalizeProfile(await res.json());
    errors.push(`direct fetch: HTTP ${res.status}`);
  } catch (err) {
    errors.push(`direct fetch: ${describe(err)}`);
  }
  throw new Error(`Could not read saved profile (${errors.join('; ')})`);
}

export async function getProfile(): Promise<UserProfileData> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.profile;

  let profile: UserProfileData | null = null;
  if (hasPersistentStorage()) {
    try {
      profile = await readFromBlob();
      lastStorageError = null;
    } catch (err) {
      lastStorageError = describe(err);
      console.error('Profile read failed:', lastStorageError);
      // Serve the last good copy if we have one, rather than flipping back to defaults.
      if (cache) return cache.profile;
    }
  } else {
    profile = memoryProfile;
  }

  const resolved = profile || SURAJ_PROFILE;
  cache = { profile: resolved, at: Date.now() };
  return resolved;
}

export async function saveProfile(raw: unknown): Promise<UserProfileData> {
  const profile = normalizeProfile(raw);

  if (hasPersistentStorage()) {
    const body = JSON.stringify(profile, null, 2);
    const errors: string[] = [];
    let saved = false;
    for (const access of accessOrder()) {
      try {
        await put(BLOB_PATH, body, {
          access,
          addRandomSuffix: false,
          allowOverwrite: true,
          contentType: 'application/json',
          cacheControlMaxAge: 60,
        });
        workingAccess = access;
        saved = true;
        break;
      } catch (err) {
        errors.push(`${access}: ${describe(err)}`);
        console.warn(`Profile save with ${access} access failed:`, describe(err));
      }
    }
    if (!saved) {
      lastStorageError = errors.join('; ');
      throw new Error(`STORAGE_WRITE_FAILED: ${lastStorageError}`);
    }
  } else if (process.env.VERCEL) {
    throw new Error('STORAGE_NOT_CONFIGURED');
  } else {
    memoryProfile = profile;
  }

  lastStorageError = null;
  cache = { profile, at: Date.now() };
  return profile;
}

/** Owner-only diagnostics: can we read storage, and what does it hold? */
export async function storageStatus() {
  if (!hasPersistentStorage()) {
    return { configured: false, saved: false, access: null, error: null };
  }
  try {
    cache = null;
    const stored = await readFromBlob();
    return { configured: true, saved: Boolean(stored), access: workingAccess, error: null };
  } catch (err) {
    return { configured: true, saved: false, access: workingAccess, error: describe(err) };
  }
}

export function getLastStorageError() {
  return lastStorageError;
}

/** For tests. */
export function __resetProfileStoreForTests() {
  cache = null;
  memoryProfile = null;
  workingAccess = null;
  lastStorageError = null;
}
