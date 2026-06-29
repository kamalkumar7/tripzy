'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { planTripProgressive, type TripPlan } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import HeroSection from '@/components/HeroSection';
import OverviewTab from '@/components/OverviewTab';
import ItineraryTab from '@/components/ItineraryTab';
import HotelsTab from '@/components/HotelsTab';
import PlacesTab from '@/components/PlacesTab';
import DiningTab from '@/components/DiningTab';
import TripSearch from '@/components/TripSearch';
import {
  Map, Calendar, Building2, Landmark, UtensilsCrossed,
  Check, Loader2, ArrowLeft, RefreshCw, Key, ClipboardList,
  Clock, AlertTriangle, Sun, Moon,
  Plane, Search, MapPin, DollarSign,
} from 'lucide-react';

// ── Tab definitions ────────────────────────────
const TABS = [
  { id: 'overview',   label: 'Overview',   Icon: Map           },
  { id: 'itinerary',  label: 'Itinerary',  Icon: Calendar      },
  { id: 'hotels',     label: 'Hotels',     Icon: Building2     },
  { id: 'places',     label: 'Places',     Icon: Landmark      },
  { id: 'dining',     label: 'Dining',     Icon: UtensilsCrossed },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ── Dark overlay design tokens (landing palette) ─
const DARK_BG   = '#020617'; // slate-950
const CYAN      = '#38bdf8';
const GOLD      = '#e9c349';

// ── Loading Screen ─────────────────────────────
function LoadingScreen({ input }: { input: string }) {
  const [step, setStep] = useState(0);

  const steps = [
    { label: 'Extracting travel details…',   Icon: Search       },
    { label: 'Finding top places to visit…', Icon: MapPin       },
    { label: 'Discovering restaurants…',     Icon: UtensilsCrossed },
    { label: 'Searching for hotels…',        Icon: Building2    },
    { label: 'Building your itinerary…',     Icon: Calendar     },
    { label: 'Calculating budget breakdown…',Icon: DollarSign   },
  ];

  useEffect(() => {
    const iv = setInterval(() => setStep(s => (s < steps.length - 1 ? s + 1 : s)), 4500);
    return () => clearInterval(iv);
  }, []);

  const pct = Math.round((step / (steps.length - 1)) * 100);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
      style={{ background: DARK_BG }}
    >
      {/* Background radial glows */}
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 70% 50% at 30% 40%, rgba(14,165,233,0.08) 0%, transparent 70%)' }} />
      <div className="pointer-events-none absolute inset-0"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 70% 60%, rgba(233,195,73,0.05) 0%, transparent 70%)' }} />

      {/* Logo */}
      <div className="mb-8 relative">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(56,189,248,0.3)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <Plane size={32} style={{ color: CYAN }} />
        </div>
        <div
          className="absolute -inset-1 rounded-3xl opacity-20 animate-ping"
          style={{ background: `rgba(56,189,248,0.3)` }}
        />
      </div>

      <h2 className="text-3xl font-bold mb-3 text-center" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
        Planning Your Trip
      </h2>
      <p className="text-sm mb-10 max-w-sm text-center px-4 py-2.5 rounded-xl"
        style={{
          color: 'rgba(255,255,255,0.6)',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        &ldquo;{input.length > 80 ? input.slice(0, 80) + '…' : input}&rdquo;
      </p>

      {/* Steps */}
      <div
        className="w-full max-w-sm rounded-2xl p-5 mb-8 space-y-3"
        style={{
          background: 'rgba(15,23,42,0.7)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {steps.map(({ label, Icon }, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
              style={{
                background: i < step ? GOLD : i === step ? CYAN : 'rgba(255,255,255,0.07)',
                border: i === step ? `1px solid ${CYAN}` : 'none',
              }}
            >
              {i < step ? (
                <Check size={12} color="#020617" strokeWidth={3} />
              ) : i === step ? (
                <Loader2 size={12} color="#020617" className="animate-spin" />
              ) : (
                <Icon size={12} color="rgba(255,255,255,0.3)" />
              )}
            </div>
            <span
              className="text-sm transition-all duration-500"
              style={{
                color: i < step ? 'rgba(255,255,255,0.45)' : i === step ? '#f1f5f9' : 'rgba(255,255,255,0.3)',
                fontWeight: i === step ? 600 : 400,
                textDecoration: i < step ? 'line-through' : 'none',
              }}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm h-1 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${CYAN}, ${GOLD})` }}
        />
      </div>
      <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>
        This may take 30–90 seconds
      </p>
    </div>
  );
}

// ── Error Screen ───────────────────────────────
function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  const isRateLimit = error === 'RATE_LIMIT'
    || error?.toLowerCase().includes('rate limit')
    || error?.toLowerCase().includes('429')
    || error?.toLowerCase().includes('quota')
    || error?.toLowerCase().includes('resource exhausted');

  const glassCard: React.CSSProperties = {
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    background: 'rgba(15,23,42,0.75)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.25rem',
  };

  const tips = [
    { Icon: Clock,         text: 'Wait 60–120 seconds before trying again' },
    { Icon: RefreshCw,     text: 'Click "Try Again" — the limit resets automatically' },
    { Icon: Key,           text: 'Check your API key quota in the backend .env' },
    { Icon: ClipboardList, text: 'Consider upgrading your AI API plan for higher limits' },
  ];

  if (isRateLimit) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
        style={{ background: DARK_BG }}
      >
        <div className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(233,195,73,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-md w-full text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{ background: 'rgba(233,195,73,0.1)', border: '1px solid rgba(233,195,73,0.25)' }}
          >
            <Clock size={32} style={{ color: GOLD }} />
          </div>

          <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
            Rate Limit Reached
          </h2>
          <p className="mb-6 text-base leading-7" style={{ color: 'rgba(255,255,255,0.55)' }}>
            The AI provider temporarily throttled requests. Try again in a moment.
          </p>

          <div className="mb-8 p-5 text-left space-y-3" style={glassCard}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
              What to do
            </p>
            {tips.map(({ Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(56,189,248,0.1)' }}>
                  <Icon size={14} color={CYAN} />
                </div>
                <p className="text-sm leading-5 pt-1.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{text}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={onRetry}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
              style={{ background: 'rgba(255,255,255,0.08)', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <ArrowLeft size={14} /> Back to Search
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
              style={{ background: CYAN, color: DARK_BG }}
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: DARK_BG }}>
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
        <AlertTriangle size={28} color="#f87171" />
      </div>
      <h2 className="text-2xl font-semibold mb-3 text-center" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
        Something went wrong
      </h2>
      <p className="text-sm mb-6 max-w-md text-center p-4 rounded-xl"
        style={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
        {error}
      </p>
      <p className="text-sm mb-6 text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
        Make sure the Tripzy backend is running on{' '}
        <code className="px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.08)', color: CYAN }}>
          http://localhost:5000
        </code>
      </p>
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all hover:brightness-110"
        style={{ background: CYAN, color: DARK_BG }}
      >
        <RefreshCw size={14} /> Try Again
      </button>
    </div>
  );
}

// ── Tab skeleton loader ─────────────────────────────
function TabSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl" style={{ background: 'rgba(56,189,248,0.1)' }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 rounded-lg w-1/3" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="h-3 rounded-lg w-1/5" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 rounded-lg w-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-3 rounded-lg w-4/5" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-3 rounded-lg w-3/5" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Dark mode toggle ───────────────────────────
function DarkModeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={dark ? 'Light Mode' : 'Dark Mode'}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105"
      style={{
        background: dark ? GOLD : 'rgba(15,23,42,0.9)',
        color: dark ? DARK_BG : CYAN,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}

// ── Main App ───────────────────────────────────
export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState<'search' | 'loading' | 'result' | 'error'>('search');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [tripPlan, setTripPlan] = useState<Partial<TripPlan>>({});
  const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set());
  const [userInput, setUserInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleSearch = async (input: string) => {
    setUserInput(input);
    setView('loading');
    setActiveTab('overview');
    setTripPlan({});
    setLoadingSections(new Set(['overview', 'itinerary', 'hotels', 'places', 'dining']));

    try {
      const result = await planTripProgressive(input, (partial) => {
        setTripPlan(prev => ({ ...prev, ...partial }));

        // Transition to result page as soon as we have destination info
        if (partial.travel_details?.destination) {
          setView('result');
        }

        // Mark sections as loaded when their data arrives
        setLoadingSections(prev => {
          const next = new Set(prev);
          if (partial.travel_details?.destination) { next.delete('overview'); }
          if (partial.itinerary && partial.itinerary.length > 0) { next.delete('itinerary'); }
          if (partial.hotels && partial.hotels.length > 0) { next.delete('hotels'); }
          if (partial.places && partial.places.length > 0) { next.delete('places'); }
          if (partial.restaurants && partial.restaurants.length > 0) { next.delete('dining'); }
          return next;
        });
      });

      if (result.error) { setErrorMsg(result.error); setView('error'); return; }
      setTripPlan(result);
      setLoadingSections(new Set());
      setView('result');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to connect to the server');
      setView('error');
    }
  };

  const handleNewTrip = () => { setTripPlan({}); setView('search'); setUserInput(''); setErrorMsg(''); };
  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  return (
    <>
      <DarkModeToggle dark={darkMode} onToggle={() => setDarkMode(!darkMode)} />

      {view === 'search'  && <TripSearch onSubmit={handleSearch} isLoading={false} />}
      {view === 'loading' && <LoadingScreen input={userInput} />}
      {view === 'error'   && <ErrorScreen error={errorMsg} onRetry={handleNewTrip} />}

      {view === 'result' && (
        <div className="flex h-screen overflow-hidden" style={{ background: DARK_BG }}>
          <Sidebar onNewTrip={handleNewTrip} destination={tripPlan.travel_details?.destination ?? ''} />

          <main className="flex-1 overflow-y-auto" style={{ background: DARK_BG }}>
            <div className="md:hidden h-[60px]" />
            {tripPlan.travel_details && <HeroSection travelDetails={tripPlan.travel_details} />}

            {/* Content area — overrides CSS vars to dark values for all child tabs */}
            <div
              className="mx-auto px-4 md:px-8 py-8"
              style={{
                maxWidth: '1280px',
                '--surface':        'rgba(15,23,42,0.72)',
                '--surface-low':    'rgba(255,255,255,0.04)',
                '--surface-mid':    'rgba(255,255,255,0.06)',
                '--surface-high':   'rgba(255,255,255,0.08)',
                '--surface-border': 'rgba(255,255,255,0.08)',
                '--outline':        'rgba(255,255,255,0.09)',
                '--text-primary':   '#f1f5f9',
                '--text-secondary': 'rgba(255,255,255,0.65)',
                '--text-muted':     'rgba(255,255,255,0.38)',
                '--primary':        CYAN,
                '--gold':           GOLD,
                '--gold-dark':      GOLD,
                '--success':        '#34d399',
                '--error':          '#f87171',
                '--shadow-card':    '0 8px 32px rgba(0,0,0,0.45)',
                '--shadow-lg':      '0 16px 48px rgba(0,0,0,0.55)',
              } as React.CSSProperties}
            >
              {/* Tab Navigation */}
              <div
                ref={tabsRef}
                className="flex overflow-x-auto no-scrollbar mb-8"
                style={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 30,
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  background: 'rgba(2,6,23,0.90)',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                  marginLeft: '-1rem',
                  marginRight: '-1rem',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                }}
              >
                {TABS.map(({ id, label, Icon }) => {
                  const active = activeTab === id;
                  const sectionLoading = loadingSections.has(id);
                  return (
                    <button
                      key={id}
                      onClick={() => handleTabChange(id)}
                      className="flex items-center gap-2 px-5 py-3.5 whitespace-nowrap transition-all duration-200 flex-shrink-0"
                      style={{
                        color: active ? CYAN : 'rgba(255,255,255,0.42)',
                        borderBottom: active ? `2px solid ${CYAN}` : '2px solid transparent',
                        background: 'transparent',
                        fontWeight: active ? 700 : 500,
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        fontSize: '11px',
                      }}
                    >
                      <Icon size={13} />
                      {label}
                      {sectionLoading && (
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: CYAN, display: 'inline-block' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview'  && (
                loadingSections.has('overview')
                  ? <TabSkeleton count={2} />
                  : <OverviewTab travelDetails={tripPlan.travel_details!} budgetBreakdown={tripPlan.budget_breakdown} />
              )}
              {activeTab === 'itinerary' && (
                loadingSections.has('itinerary')
                  ? <TabSkeleton count={3} />
                  : <ItineraryTab itinerary={tripPlan.itinerary ?? []} />
              )}
              {activeTab === 'hotels' && (
                loadingSections.has('hotels')
                  ? <TabSkeleton count={4} />
                  : <HotelsTab hotels={tripPlan.hotels ?? []} />
              )}
              {activeTab === 'places' && (
                loadingSections.has('places')
                  ? <TabSkeleton count={4} />
                  : <PlacesTab places={tripPlan.places ?? []} />
              )}
              {activeTab === 'dining' && (
                loadingSections.has('dining')
                  ? <TabSkeleton count={4} />
                  : <DiningTab restaurants={tripPlan.restaurants ?? []} />
              )}
            </div>
          </main>
        </div>
      )}
    </>
  );
}
