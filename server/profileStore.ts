import { get, put } from '@vercel/blob';
import type { UserProfileData } from '../src/types.js';
import { SURAJ_PROFILE } from '../src/data/surajProfile.js';
import { normalizeProfile } from '../src/lib/profile.js';

// The live profile is one private JSON file in a Vercel Blob store.
// Connecting a Blob store to the Vercel project adds BLOB_READ_WRITE_TOKEN automatically.
// Without it (e.g. local dev), edits are kept in memory until the server restarts.
const BLOB_PATH = 'profile/profile.json';
const CACHE_MS = 15_000;

let cache: { profile: UserProfileData; at: number } | null = null;
let memoryProfile: UserProfileData | null = null;

export function hasPersistentStorage(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readFromBlob(): Promise<UserProfileData | null> {
  const result = await get(BLOB_PATH, { access: 'private', useCache: false });
  if (!result || !result.stream) return null;
  const text = await new Response(result.stream as ReadableStream).text();
  return normalizeProfile(JSON.parse(text));
}

export async function getProfile(): Promise<UserProfileData> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.profile;

  let profile: UserProfileData | null = null;
  if (hasPersistentStorage()) {
    try {
      profile = await readFromBlob();
    } catch (err: any) {
      console.error('Profile read failed, using default profile:', err?.message || err);
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
    await put(BLOB_PATH, JSON.stringify(profile, null, 2), {
      access: 'private',
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: 'application/json',
      cacheControlMaxAge: 60,
    });
  } else if (process.env.VERCEL) {
    throw new Error('STORAGE_NOT_CONFIGURED');
  } else {
    memoryProfile = profile;
  }

  cache = { profile, at: Date.now() };
  return profile;
}

/** For tests. */
export function __resetProfileStoreForTests() {
  cache = null;
  memoryProfile = null;
}
