'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, ArrowRight, Clock, X } from 'lucide-react';

interface TripSearchProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

const DESTINATIONS = [
  { name: 'Tokyo',      country: 'Japan',         img: '/destinations/tokyo.png',      label: 'Tokyo',    color: '#ff6b6b' },
  { name: 'Bali',       country: 'Indonesia',      img: '/destinations/bali.png',       label: 'Bali',     color: '#48dbfb' },
  { name: 'Paris',      country: 'France',         img: '/destinations/paris.png',      label: 'Paris',    color: '#f8b739' },
  { name: 'Santorini',  country: 'Greece',         img: '/destinations/santorini.png',  label: 'Greece',   color: '#54a0ff' },
  { name: 'Maldives',   country: 'Indian Ocean',   img: '/destinations/maldives.png',   label: 'Ocean',    color: '#00d2d3' },
  { name: 'Kyoto',      country: 'Japan',          img: '/destinations/kyoto.png',      label: 'Kyoto',    color: '#ff9f43' },
  { name: 'Rome',       country: 'Italy',          img: '/destinations/rome.png',       label: 'Rome',     color: '#feca57' },
  { name: 'London',     country: 'UK',             img: '/destinations/london.png',     label: 'London',   color: '#ff6348' },
  { name: 'Swiss Alps', country: 'Switzerland',    img: '/destinations/swiss_alps.png', label: 'Alps',     color: '#a29bfe' },
  { name: 'New York',   country: 'USA',            img: '/destinations/new_york.png',   label: 'NYC',      color: '#fd79a8' },
];

const QUICK_PROMPTS = [
  { label: 'Tokyo · 7 days',     prompt: 'Plan a 7-day trip to Tokyo for 2 people, budget $4500, interested in culture and food' },
  { label: 'Bali Adventure',     prompt: 'Adventure trip to Bali for 10 days, $5000 budget, love beaches and hiking' },
  { label: 'Paris Romance',      prompt: 'Romantic trip to Paris for 5 days with a budget of $3000' },
  { label: 'Santorini · 6 days', prompt: 'Luxury getaway to Santorini for 6 days, budget $5000, interested in sunsets and local food' },
  { label: 'Maldives Honeymoon', prompt: 'Relaxing Maldives trip for 7 days, $8000 budget, couple honeymoon' },
  { label: 'Swiss Alps · 8 days',prompt: 'Switzerland Alps adventure for 8 days, $6000 budget, skiing and hiking' },
];

const STORAGE_KEY = 'tripzy_recent_searches';

export default function TripSearch({ onSubmit, isLoading }: TripSearchProps) {
  const [input, setInput] = useState('');
  const [heroIdx, setHeroIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [activeDestHovered, setActiveDestHovered] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load recents
  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { setRecentSearches((JSON.parse(saved) as string[]).slice(0, 5)); }
      catch { setRecentSearches([]); }
    }
  }, []);

  // Auto-rotate hero
  const goToNext = useCallback((force?: number) => {
    setTransitioning(true);
    setPrevIdx(heroIdx);
    setTimeout(() => {
      setHeroIdx((prev) => force !== undefined ? force : (prev + 1) % DESTINATIONS.length);
      setTransitioning(false);
      setPrevIdx(null);
    }, 600);
  }, [heroIdx]);

  useEffect(() => {
    intervalRef.current = setInterval(() => goToNext(), 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [goToNext]);

  const jumpTo = (idx: number) => {
    if (idx === heroIdx || transitioning) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    goToNext(idx);
    intervalRef.current = setInterval(() => goToNext(), 5000);
  };

  const saveRecent = (val: string) => {
    const t = val.trim();
    if (!t) return;
    const filtered = recentSearches.filter((i) => i !== t);
    const updated = [t, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = input.trim();
    if (t && !isLoading) { saveRecent(t); onSubmit(t); }
  };

  const fill = (prompt: string) => {
    setInput(prompt);
    textareaRef.current?.focus();
  };

  const cur = DESTINATIONS[heroIdx];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* ── Hero slideshow ─────────────────────────────── */}
      {DESTINATIONS.map((dest, i) => (
        <div
          key={dest.img}
          className="absolute inset-0"
          style={{
            opacity: i === heroIdx ? 1 : i === prevIdx ? 0 : 0,
            transition: 'opacity 0.8s cubic-bezier(.4,0,.2,1)',
            zIndex: i === heroIdx ? 2 : i === prevIdx ? 1 : 0,
          }}
        >
          <img
            src={dest.img}
            alt={dest.name}
            className="h-full w-full object-cover"
            style={{ transform: i === heroIdx && !transitioning ? 'scale(1.04)' : 'scale(1)', transition: 'transform 6s ease-out' }}
          />
        </div>
      ))}

      {/* Overlay layers */}
      <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(135deg, rgba(2,6,23,0.92) 0%, rgba(2,6,23,0.55) 55%, rgba(2,6,23,0.75) 100%)' }} />
      <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.98) 0%, transparent 50%)' }} />

      {/* ── Content ────────────────────────────────────── */}
      <div className="relative z-20 flex min-h-screen flex-col">

        {/* Top nav bar */}
        <header className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur text-white font-bold text-lg border border-white/10">T</div>
            <span className="text-xl font-semibold text-white tracking-tight">Tripzy</span>
            <span className="ml-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400 border border-cyan-500/30">AI</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Planning
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-8 pt-4">

          {/* Current destination chip */}
          <div
            className="mb-6 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
            style={{ transition: 'all 0.5s ease' }}
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: cur.color, display: 'inline-block', flexShrink: 0 }} />
            <span className="text-sm font-semibold text-white">{cur.name}</span>
            <span className="text-white/40">·</span>
            <span className="text-xs text-white/60">{cur.country}</span>
          </div>

          {/* Headline */}
          <h1 className="mb-4 max-w-3xl text-center text-5xl font-bold text-white leading-tight sm:text-6xl" style={{ fontFamily: 'Georgia, serif', textShadow: '0 2px 30px rgba(0,0,0,0.4)' }}>
            Where do you want<br />to go next?
          </h1>
          <p className="mb-10 max-w-xl text-center text-base text-white/60 leading-relaxed">
            Describe your dream trip. AI builds full itinerary, finds hotels, restaurants, and activities in seconds.
          </p>

          {/* Search card */}
          <div className="w-full max-w-2xl">
            <form onSubmit={handleSubmit}>
              <div
                className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
                style={{ backdropFilter: 'blur(24px)', background: 'rgba(15,23,42,0.75)' }}
              >
                {/* Input */}
                <div className="relative p-5 pb-3">
                  <textarea
                    ref={textareaRef}
                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e as unknown as React.FormEvent); }}
                    placeholder="e.g. 7 days in Tokyo for 2 people, $4500, love food and culture..."
                    rows={3}
                    disabled={isLoading}
                    className="w-full resize-none bg-transparent text-base text-white placeholder-white/30 outline-none leading-relaxed"
                  />


                </div>

                {/* Bottom bar */}
                <div className="flex items-center justify-between border-t border-white/8 px-5 py-3">
                  <span className="text-xs text-white/30">Ctrl+Enter to submit</span>
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ background: input.trim() && !isLoading ? '#0ea5e9' : 'rgba(255,255,255,0.08)', color: 'white' }}
                  >
                    {isLoading ? (
                      <><svg className="h-4 w-4 animate-spin" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Planning...</>
                    ) : (
                      <>Plan My Trip<svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Quick prompts */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {QUICK_PROMPTS.map((qp) => (
                <button
                  key={qp.label}
                  type="button"
                  onClick={() => fill(qp.prompt)}
                  disabled={isLoading}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 backdrop-blur transition-all hover:border-white/25 hover:bg-white/10 hover:text-white disabled:opacity-40"
                >
                  {qp.label}
                </button>
              ))}
            </div>

            {/* Recent searches — clean row, no dropdown overlap */}
            {recentSearches.length > 0 && (
              <div className="mt-5 w-full max-w-2xl">
                <div
                  className="overflow-hidden rounded-2xl border border-white/8"
                  style={{ backdropFilter: 'blur(16px)', background: 'rgba(15,23,42,0.55)' }}
                >
                  <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <svg className="h-3 w-3 text-white/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Recent</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => { window.localStorage.removeItem(STORAGE_KEY); setRecentSearches([]); }}
                      className="text-[10px] font-semibold text-white/30 transition hover:text-white/60"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-col divide-y divide-white/5">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => fill(s)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5"
                      >
                        <span className="flex-shrink-0 text-white/25">↗</span>
                        <span className="truncate text-sm text-white/70">{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom section: destinations strip ─────────── */}
        <div className="relative z-20 pb-6 px-6">
          {/* Slide indicators */}
          <div className="mb-5 flex justify-center gap-1.5">
            {DESTINATIONS.map((_, i) => (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === heroIdx ? '24px' : '6px',
                  height: '6px',
                  background: i === heroIdx ? '#0ea5e9' : 'rgba(255,255,255,0.3)',
                }}
              />
            ))}
          </div>

          {/* Horizontal destination cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 justify-center flex-wrap">
            {DESTINATIONS.map((dest, i) => (
              <button
                key={dest.name}
                onClick={() => { jumpTo(i); fill(`Plan a trip to ${dest.name}, ${dest.country}`); }}
                onMouseEnter={() => setActiveDestHovered(i)}
                onMouseLeave={() => setActiveDestHovered(null)}
                className="group relative flex-shrink-0 overflow-hidden rounded-2xl border transition-all duration-300"
                style={{
                  width: '120px',
                  height: '90px',
                  borderColor: i === heroIdx ? '#0ea5e9' : 'rgba(255,255,255,0.1)',
                  boxShadow: i === heroIdx ? '0 0 20px rgba(14,165,233,0.4)' : 'none',
                  transform: activeDestHovered === i ? 'scale(1.05) translateY(-3px)' : 'scale(1)',
                }}
              >
                <img src={dest.img} alt={dest.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.85) 0%, transparent 60%)' }} />
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: dest.color }}>{dest.country}</p>
                  <p className="text-xs font-semibold text-white">{dest.name}</p>
                </div>
                {i === heroIdx && (
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
