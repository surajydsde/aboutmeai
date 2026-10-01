import type { UserProfileData } from '../types';

const TOKEN_KEY = 'aboutmeai_owner_token_v1';

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, init);
  } catch {
    throw new ApiError('Network error. Check your connection and try again.', 0);
  }
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON response
  }
  if (!res.ok) {
    throw new ApiError(data?.reply || data?.error || `Request failed (${res.status})`, res.status);
  }
  return data as T;
}

export const ownerToken = {
  get(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      // ignore
    }
  },
  clear() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

export function fetchProfile() {
  return request<{ profile: UserProfileData; context: string }>('/api/profile');
}

export function saveProfileRequest(profile: UserProfileData, token: string) {
  return request<{ profile: UserProfileData; context: string }>('/api/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ profile }),
  });
}

export function loginRequest(passcode: string) {
  return request<{ token: string; expiresAt: number }>('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });
}

export async function verifyTokenRequest(token: string): Promise<boolean> {
  try {
    const data = await request<{ valid: boolean }>('/api/admin/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Boolean(data?.valid);
  } catch {
    return false;
  }
}

export function chatRequest(message: string, history: { role: string; text: string }[]) {
  return request<{ reply: string }>('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
}
