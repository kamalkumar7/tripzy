'use client';

import { useState, useEffect } from 'react';
import type { TravelDetails } from '@/lib/api';

interface HeroSectionProps {
  travelDetails: TravelDetails;
}

export default function HeroSection({ travelDetails }: HeroSectionProps) {
  const { destination, duration, travel_type, overview } = travelDetails;
  const cityName = destination.split(',')[0].trim();

  const [imgSrc, setImgSrc] = useState(
    `https://source.unsplash.com/1600x900/?${encodeURIComponent(cityName)},cityscape,travel`
  );
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Reset animation when destination changes
    setLoaded(false);
    const t = setTimeout(() => setLoaded(true), 80);
    return () => clearTimeout(t);
  }, [destination]);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: '520px', minHeight: '380px' }}
    >
      {/* ── Background Image with Ken-Burns zoom ── */}
      <div className="absolute inset-0">
        <img
          src={imgSrc}
          alt={`${destination} travel destination`}
          onLoad={() => setLoaded(true)}
          onError={() =>
            setImgSrc(`https://picsum.photos/seed/${encodeURIComponent(cityName)}/1600/900`)
          }
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: loaded ? 'scale(1.08)' : 'scale(1)',
            transition: 'transform 8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            willChange: 'transform',
          }}
        />

        {/* Multi-layer gradient — matches landing dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(2,6,23,0.88) 0%, rgba(2,6,23,0.45) 50%, rgba(2,6,23,0.70) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to top, rgba(2,6,23,0.98) 0%, transparent 55%)',
          }}
        />

        {/* Subtle cyan radial glow — signature accent from landing */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 40% at 50% 80%, rgba(14,165,233,0.12) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── Animated particles overlay ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${4 + i * 2}px`,
              height: `${4 + i * 2}px`,
              background: 'rgba(14,165,233,0.25)',
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              animation: `float-particle ${3 + i * 0.7}s ease-in-out infinite alternate`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}
      </div>

      {/* ── Content ── */}
      <div
        className="relative z-10 h-full flex flex-col items-center justify-end pb-12 px-4 text-center"
        style={{
          opacity: loaded ? 1 : 0,
          transform: loaded ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}
      >
        {/* Travel type badge — cyan, matching landing AI chip style */}
        <div
          className="mb-5 px-4 py-1.5 rounded-full inline-flex items-center gap-2"
          style={{
            background: 'rgba(14,165,233,0.15)',
            border: '1px solid rgba(14,165,233,0.35)',
            color: '#38bdf8',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#38bdf8',
              display: 'inline-block',
              animation: 'pulse 2s infinite',
            }}
          />
          {travel_type} Trip
        </div>

        {/* Destination name */}
        <h1
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '1.25rem',
            textShadow: '0 2px 40px rgba(0,0,0,0.5)',
          }}
        >
          {destination}
        </h1>

        {/* Overview pill — glassmorphism matching landing search card */}
        <p
          style={{
            maxWidth: '680px',
            fontSize: '0.975rem',
            lineHeight: '1.75',
            textAlign: 'center',
            padding: '1rem 1.5rem',
            borderRadius: '1.25rem',
            color: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            background: 'rgba(15,23,42,0.65)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: '1rem',
          }}
        >
          {overview}
        </p>

        {/* Meta chips */}
        <div className="flex items-center gap-3 mt-1">
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              backdropFilter: 'blur(8px)',
            }}
          >
            {duration} {duration === 1 ? 'Day' : 'Days'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '18px' }}>·</span>
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '9999px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              backdropFilter: 'blur(8px)',
            }}
          >
            {cityName}
          </span>
        </div>
      </div>

      {/* Keyframe style injection */}
      <style>{`
        @keyframes float-particle {
          from { transform: translateY(0px) scale(1); opacity: 0.3; }
          to   { transform: translateY(-18px) scale(1.3); opacity: 0.7; }
        }
      `}</style>
    </section>
  );
}
