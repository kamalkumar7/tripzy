'use client';

/**
 * AuthContext — wraps the app with { user, token, login, logout, loading }.
 *
 * login(googleIdToken): exchanges a Google credential for a Tripzy JWT.
 * logout(): clears token and resets state.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  type AuthUser,
  clearToken,
  getToken,
  getUser,
  setToken,
} from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

// ── Types ───────────────────────────────────────────────────────────────────

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (googleIdToken: string) => Promise<void>;
  logout: () => void;
}

// ── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthState>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: hydrate from localStorage
  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser(); // also validates expiry
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  // Exchange Google ID token for a Tripzy JWT
  const login = useCallback(async (googleIdToken: string) => {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_token: googleIdToken }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(err.error ?? 'Login failed');
    }

    const data = await res.json() as { token: string; user: Partial<AuthUser> };
    setToken(data.token);
    setTokenState(data.token);

    // Re-decode from the stored token to get full payload (incl. sub/exp)
    const decoded = getUser();
    setUser(decoded);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
