/**
 * Lightweight auth utilities — no dependencies beyond the browser.
 * Token is stored in localStorage under TOKEN_KEY.
 */

const TOKEN_KEY = 'tripzy_jwt';

export interface AuthUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
  exp: number;
}

// ── Storage helpers ─────────────────────────────────────────────────────────

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// ── JWT decode (no signature verification — server already did that) ────────

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
  return atob(padded);
}

export function decodeToken(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    return payload as AuthUser;
  } catch {
    return null;
  }
}

// ── Session checks ──────────────────────────────────────────────────────────

export function getUser(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  const user = decodeToken(token);
  if (!user) return null;
  // Treat tokens expiring in less than 60 s as expired
  if (user.exp * 1000 < Date.now() + 60_000) {
    clearToken();
    return null;
  }
  return user;
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}
