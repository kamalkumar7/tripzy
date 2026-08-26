'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, ArrowRight, Clock, MapPin, Compass, Heart, Camera, Umbrella, Mountain } from 'lucide-react';

function TravelParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Use fewer particles on smaller screens
    const particleCount = Math.min(Math.floor(width / 25), 40);
    
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      progress: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Slow drifting movement
        this.vx = (Math.random() - 0.5) * 0.3;
        this.vy = (Math.random() - 0.5) * 0.3;
        this.radius = Math.random() * 2 + 1.5;
        this.progress = Math.random();
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.progress += 0.005;
        if (this.progress > 1) this.progress = 0;

        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        const isDark = document.documentElement.classList.contains('dark');
        ctx.fillStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)';
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let animationFrameId: number;

    const drawFlightPath = (p1: Particle, p2: Particle, opacity: number) => {
      if (!ctx) return;
      const isDark = document.documentElement.classList.contains('dark');
      
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      
      // Control point for a gentle curve (arc)
      const cx = p1.x + dx / 2 - dy * 0.15;
      const cy = p1.y + dy / 2 + dx * 0.15;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.quadraticCurveTo(cx, cy, p2.x, p2.y);
      
      const routeColor = isDark ? `rgba(14, 165, 233, ${opacity * 0.6})` : `rgba(14, 165, 233, ${opacity * 0.4})`;
      ctx.strokeStyle = routeColor;
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 6]); 
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw a tiny "plane" dot moving along the path occasionally
      if (p1.progress > 0.2 && p1.progress < 0.8) {
        const t = p1.progress;
        // Bezier interpolation
        const bx = (1 - t) * (1 - t) * p1.x + 2 * (1 - t) * t * cx + t * t * p2.x;
        const by = (1 - t) * (1 - t) * p1.y + 2 * (1 - t) * t * cy + t * t * p2.y;
        
        ctx.beginPath();
        ctx.arc(bx, by, 2, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? `rgba(14, 165, 233, ${opacity})` : `rgba(2, 132, 199, ${opacity})`;
        ctx.fill();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          const maxDist = 200;
          if (dist < maxDist) {
            const opacity = Math.pow(1 - dist / maxDist, 2);
            drawFlightPath(particles[i], particles[j], opacity);
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

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
  { label: 'Tokyo · 7 days',     icon: MapPin,   prompt: 'Plan a 7-day trip to Tokyo for 2 people, budget $4500, interested in culture and food' },
  { label: 'Bali Adventure',     icon: Compass,  prompt: 'Adventure trip to Bali for 10 days, $5000 budget, love beaches and hiking' },
  { label: 'Paris Romance',      icon: Heart,    prompt: 'Romantic trip to Paris for 5 days with a budget of $3000' },
  { label: 'Santorini · 6 days', icon: Camera,   prompt: 'Luxury getaway to Santorini for 6 days, budget $5000, interested in sunsets and local food' },
  { label: 'Maldives Honeymoon', icon: Umbrella, prompt: 'Relaxing Maldives trip for 7 days, $8000 budget, couple honeymoon' },
  { label: 'Swiss Alps · 8 days',icon: Mountain, prompt: 'Switzerland Alps adventure for 8 days, $6000 budget, skiing and hiking' },
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

  const doSubmit = (text: string) => {
    const t = text.trim();
    console.log('[Tripzy] doSubmit called with:', JSON.stringify(t), '| isLoading:', isLoading);
    if (!t) {
      console.warn('[Tripzy] doSubmit: empty input, ignoring');
      return;
    }
    if (isLoading) {
      console.warn('[Tripzy] doSubmit: already loading, ignoring');
      return;
    }
    console.log('[Tripzy] ✅ Submitting trip request...');
    saveRecent(t);
    onSubmit(t);
  };

  const handleButtonClick = () => {
    console.log('[Tripzy] Plan My Trip button clicked, input:', JSON.stringify(input.trim()));
    doSubmit(input);
  };

  const fillAndSubmit = (prompt: string) => {
    console.log('[Tripzy] fillAndSubmit called with:', JSON.stringify(prompt));
    setInput(prompt);
    doSubmit(prompt);
  };

  const cur = DESTINATIONS[heroIdx];
  const isSubmitActive = Boolean(input.trim()) && !isLoading;

  return (
    <div className="min-h-screen overflow-y-auto flex flex-col relative" style={{ background: 'var(--background)' }}>
      <TravelParticles />
      {/* ── Content ────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-12 relative z-10">

        {/* Headline */}
        <h1 className="mb-4 max-w-3xl text-center text-5xl font-bold leading-tight sm:text-6xl"
            style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
          Where do you want<br />to go next?
        </h1>
        <p className="mb-10 max-w-xl text-center text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Describe your dream trip. AI builds a full itinerary, finds hotels, restaurants, and activities in seconds.
        </p>

        {/* Search card */}
        <div className="w-full max-w-2xl relative z-10">
          <div
            className="overflow-hidden rounded-3xl border transition-shadow duration-300 hover:shadow-xl"
            style={{ background: 'var(--surface)', borderColor: 'var(--outline)', boxShadow: 'var(--shadow-card)' }}
          >
            {/* Input */}
            <div className="relative p-6 pb-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    doSubmit(input);
                  }
                }}
                placeholder="e.g. 7 days in Tokyo for 2 people, $4500, love food and culture..."
                rows={3}
                disabled={isLoading}
                className="w-full resize-none bg-transparent text-lg outline-none leading-relaxed placeholder:opacity-50"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-6 py-4 border-t" style={{ borderColor: 'var(--outline)', background: 'var(--surface-low)' }}>
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Ctrl+Enter to submit</span>
              <button
                type="button"
                onClick={handleButtonClick}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: isSubmitActive ? 'var(--primary)' : 'var(--surface-mid)',
                  color: isSubmitActive ? '#FFFFFF' : 'var(--text-muted)',
                  border: isSubmitActive ? 'none' : '1px solid var(--outline)',
                  boxShadow: isSubmitActive ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
                  cursor: isSubmitActive ? 'pointer' : 'default',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Planning...</>
                ) : (
                  <>Plan My Trip <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.label}
                type="button"
                onClick={() => fillAndSubmit(qp.prompt)}
                disabled={isLoading}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all hover:-translate-y-0.5 disabled:opacity-40"
                style={{ background: 'var(--surface-low)', color: 'var(--text-secondary)', border: '1px solid var(--outline)' }}
              >
                <qp.icon size={13} style={{ opacity: 0.7 }} />
                {qp.label}
              </button>
            ))}
          </div>

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div className="mt-6 w-full mx-auto max-w-xl">
              <div className="overflow-hidden rounded-2xl border" style={{ background: 'var(--surface)', borderColor: 'var(--outline)' }}>
                <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor: 'var(--outline)', background: 'var(--surface-low)' }}>
                  <div className="flex items-center gap-2">
                    <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Recent</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => { window.localStorage.removeItem(STORAGE_KEY); setRecentSearches([]); }}
                    className="text-[10px] font-semibold transition hover:opacity-70"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-col divide-y" style={{ borderColor: 'var(--outline)' }}>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => fillAndSubmit(s)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-low)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
                      <span className="truncate text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom section: destinations strip ─────────── */}
      <div className="w-full pb-16 px-6 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest mb-6 text-center" style={{ color: 'var(--text-muted)' }}>
          Popular Destinations
        </h3>
        <div className="flex gap-4 overflow-x-auto pb-4 justify-center flex-wrap no-scrollbar max-w-6xl mx-auto">
          {DESTINATIONS.slice(0, 8).map((dest, i) => (
            <button
              key={dest.name}
              onClick={() => { fillAndSubmit(`Plan a trip to ${dest.name}, ${dest.country}`); }}
              className="group flex items-center gap-3 pr-4 p-1.5 rounded-full transition-all duration-300 card hover:-translate-y-1"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--outline)',
              }}
            >
              <img
                src={dest.img}
                alt={dest.name}
                className="w-10 h-10 rounded-full object-cover border"
                style={{ borderColor: 'var(--outline)' }}
              />
              <div className="text-left">
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{dest.name}</p>
                <p className="text-[10px] font-semibold uppercase" style={{ color: dest.color }}>{dest.country}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
