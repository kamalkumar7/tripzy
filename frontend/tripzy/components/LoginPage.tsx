'use client';

/**
 * LoginPage — full-screen Google Sign-In, matching the Tripzy dark aesthetic.
 * Uses the Google Identity Services (GIS) library loaded via a <script> tag.
 */

import { useEffect, useRef, useState } from 'react';
import { Plane, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthContext';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const DARK_BG   = '#020617';
const CYAN      = '#38bdf8';
const GOLD      = '#e9c349';

// Extend Window to include the Google Identity Services API
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (element: HTMLElement, config: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const { login } = useAuth();
  const btnRef     = useRef<HTMLDivElement>(null);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [gisReady, setGisReady] = useState(false);

  // Load the GIS script once
  useEffect(() => {
    if (document.getElementById('gis-script')) {
      setGisReady(true);
      return;
    }
    const script  = document.createElement('script');
    script.id     = 'gis-script';
    script.src    = 'https://accounts.google.com/gsi/client';
    script.async  = true;
    script.defer  = true;
    script.onload = () => setGisReady(true);
    document.head.appendChild(script);
  }, []);

  // Once the library is ready, render the styled button
  useEffect(() => {
    if (!gisReady || !btnRef.current || !CLIENT_ID) return;

    window.google?.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: async (response: { credential: string }) => {
        setError('');
        setLoading(true);
        try {
          await login(response.credential);
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Sign-in failed. Please try again.';
          setError(msg);
        } finally {
          setLoading(false);
        }
      },
    });

    window.google?.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_black',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      logo_alignment: 'left',
      width: 300,
    });
  }, [gisReady, login]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: DARK_BG }}
    >
      {/* Background radial glows */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 55% at 20% 50%, rgba(14,165,233,0.09) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 80% 50%, rgba(233,195,73,0.06) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 40% 30% at 50% 90%, rgba(56,189,248,0.04) 0%, transparent 70%)' }} />

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-sm flex flex-col items-center rounded-3xl px-8 py-10"
        style={{
          background: 'rgba(10,18,40,0.75)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.07)',
        }}
      >
        {/* Logo */}
        <div className="relative mb-6">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{
              background: 'rgba(15,23,42,0.9)',
              border: `1.5px solid rgba(56,189,248,0.35)`,
              boxShadow: `0 0 40px rgba(56,189,248,0.12)`,
            }}
          >
            <Plane size={34} style={{ color: CYAN }} />
          </div>
          {/* Pulse ring */}
          <div
            className="absolute -inset-1 rounded-3xl opacity-30 animate-ping"
            style={{ background: 'rgba(56,189,248,0.2)' }}
          />
        </div>

        {/* Brand */}
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: 'Georgia, serif', color: '#ffffff' }}
          >
            Tripzy
          </span>
        </div>
        <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: GOLD }}>
          Elite Concierge
        </p>
        <p className="text-sm text-center mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
          AI-powered travel planning, curated for discerning travellers
        </p>

        {/* Divider */}
        <div className="w-full h-px mb-8" style={{ background: 'rgba(255,255,255,0.07)' }} />

        <p className="text-xs font-semibold tracking-widest uppercase mb-5" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Sign in to continue
        </p>

        {/* Google button */}
        {loading ? (
          <div className="flex items-center gap-3 py-3 px-6 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Loader2 size={16} style={{ color: CYAN }} className="animate-spin" />
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>Signing you in…</span>
          </div>
        ) : (
          <div ref={btnRef} className="flex items-center justify-center" />
        )}

        {/* Error */}
        {error && (
          <div
            className="mt-5 flex items-start gap-2.5 p-3.5 rounded-xl w-full"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
            }}
          >
            <AlertCircle size={15} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs leading-relaxed" style={{ color: '#fca5a5' }}>{error}</p>
          </div>
        )}

        {!CLIENT_ID && (
          <div
            className="mt-5 flex items-start gap-2.5 p-3.5 rounded-xl w-full"
            style={{
              background: 'rgba(234,179,8,0.08)',
              border: '1px solid rgba(234,179,8,0.25)',
            }}
          >
            <AlertCircle size={15} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 1 }} />
            <p className="text-xs leading-relaxed" style={{ color: '#fde68a' }}>
              Google Client ID not configured. Set{' '}
              <code className="font-mono">NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in your{' '}
              <code className="font-mono">.env</code>.
            </p>
          </div>
        )}

        {/* Footer note */}
        <p className="text-xs mt-8 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
          By continuing you agree to our{' '}
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>Terms &amp; Privacy Policy</span>
        </p>
      </div>

      {/* Bottom tagline */}
      <p className="mt-8 text-xs z-10 relative" style={{ color: 'rgba(255,255,255,0.2)' }}>
        © {new Date().getFullYear()} Tripzy — All rights reserved
      </p>
    </div>
  );
}
