'use client';

import { useState, useEffect, useRef } from 'react';
import { planTrip, type TripPlan } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import HeroSection from '@/components/HeroSection';
import OverviewTab from '@/components/OverviewTab';
import ItineraryTab from '@/components/ItineraryTab';
import HotelsTab from '@/components/HotelsTab';
import PlacesTab from '@/components/PlacesTab';
import DiningTab from '@/components/DiningTab';
import TripSearch from '@/components/TripSearch';

// ── Tab definitions ────────────────────────────
const TABS = [
  { id: 'overview', label: 'Overview', icon: '🗺️' },
  { id: 'itinerary', label: 'Itinerary', icon: '📅' },
  { id: 'hotels', label: 'Hotels', icon: '🏨' },
  { id: 'places', label: 'Places', icon: '🏛️' },
  { id: 'dining', label: 'Dining', icon: '🍽️' },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ── Loading skeleton ───────────────────────────
function LoadingScreen({ input }: { input: string }) {
  const [step, setStep] = useState(0);
  const steps = [
    'Extracting travel details...',
    'Finding top places to visit...',
    'Discovering restaurants...',
    'Searching for hotels...',
    'Building your itinerary...',
    'Calculating budget breakdown...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s < steps.length - 1 ? s + 1 : s));
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      {/* Animated logo */}
      <div className="mb-8 relative">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-bold animate-pulse"
          style={{ background: '#041627', color: 'var(--gold)' }}
        >
          T
        </div>
        <div
          className="absolute -inset-2 rounded-3xl opacity-30 animate-ping"
          style={{ background: 'rgba(233,195,73,0.3)' }}
        />
      </div>

      <h2
        className="text-3xl font-bold mb-3 text-center"
        style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--primary)' }}
      >
        Planning Your Trip
      </h2>
      <p className="text-base mb-8 max-w-md text-center" style={{ color: 'var(--text-secondary)' }}>
        &ldquo;{input.length > 80 ? input.slice(0, 80) + '…' : input}&rdquo;
      </p>

      {/* Steps */}
      <div className="w-full max-w-sm space-y-3 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
              style={{
                background: i < step ? 'var(--gold)' : i === step ? '#041627' : 'var(--surface-high)',
              }}
            >
              {i < step ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-3 h-3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : i === step ? (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              ) : null}
            </div>
            <span
              className="text-sm transition-all duration-500"
              style={{
                color: i < step ? 'var(--text-secondary)' : i === step ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: i === step ? 600 : 400,
              }}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="w-full max-w-sm h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--surface-high)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${Math.round((step / (steps.length - 1)) * 100)}%`,
            background: 'linear-gradient(90deg, #041627, var(--gold))',
          }}
        />
      </div>
      <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
        This may take 30–90 seconds
      </p>
    </div>
  );
}

// ── Error screen ───────────────────────────────
function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      <div className="text-5xl mb-4">⚠️</div>
      <h2
        className="text-2xl font-semibold mb-3 text-center"
        style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--primary)' }}
      >
        Something went wrong
      </h2>
      <p
        className="text-sm mb-6 max-w-md text-center p-4 rounded-xl"
        style={{
          color: 'var(--error)',
          background: '#ffdad6',
          border: '1px solid #f9b4ae',
        }}
      >
        {error}
      </p>
      <p className="text-sm mb-6 text-center" style={{ color: 'var(--text-secondary)' }}>
        Make sure the Tripzy backend is running on <code className="px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-mid)' }}>http://localhost:5000</code>
      </p>
      <button
        onClick={onRetry}
        className="px-8 py-3 rounded-xl font-semibold text-sm"
        style={{ background: '#041627', color: 'white' }}
      >
        Try Again
      </button>
    </div>
  );
}

// ── Dark mode toggle ───────────────────────────
function DarkModeToggle({ dark, onToggle }: { dark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-105"
      style={{
        background: dark ? '#e9c349' : '#041627',
        color: dark ? '#041627' : '#e9c349',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      }}
    >
      {dark ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" strokeWidth={2} />
          <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" strokeWidth={2} />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" strokeWidth={2} />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" strokeWidth={2} />
          <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" strokeWidth={2} />
          <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" strokeWidth={2} />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" strokeWidth={2} />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" strokeWidth={2} />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

// ── Main App ───────────────────────────────────
export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState<'search' | 'loading' | 'result' | 'error'>('search');
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [tripPlan, setTripPlan] = useState<TripPlan | null>(null);
  const [userInput, setUserInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const tabsRef = useRef<HTMLDivElement>(null);

  // Apply dark mode to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleSearch = async (input: string) => {
    setUserInput(input);
    setView('loading');
    setActiveTab('overview');

    try {
      const result = await planTrip(input);

      if (result.error) {
        setErrorMsg(result.error);
        setView('error');
        return;
      }

      setTripPlan(result);
      setView('result');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to connect to the server');
      setView('error');
    }
  };

  const handleNewTrip = () => {
    setTripPlan(null);
    setView('search');
    setUserInput('');
    setErrorMsg('');
  };

  const handleTabChange = (tab: TabId) => {
    setActiveTab(tab);
    // Scroll tabs into view on mobile
    if (tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  return (
    <>
      {/* Dark Mode Toggle — always visible */}
      <DarkModeToggle dark={darkMode} onToggle={() => setDarkMode(!darkMode)} />

      {/* Search View */}
      {view === 'search' && (
        <TripSearch onSubmit={handleSearch} isLoading={false} />
      )}

      {/* Loading View */}
      {view === 'loading' && (
        <LoadingScreen input={userInput} />
      )}

      {/* Error View */}
      {view === 'error' && (
        <ErrorScreen error={errorMsg} onRetry={handleNewTrip} />
      )}

      {/* Results View */}
      {view === 'result' && tripPlan && (
        <div
          className="flex h-screen overflow-hidden"
          style={{ background: 'var(--background)' }}
        >
          {/* Sidebar */}
          <Sidebar
            onNewTrip={handleNewTrip}
            destination={tripPlan.travel_details.destination}
          />

          {/* Main content */}
          <main className="flex-1 overflow-y-auto">
            {/* Mobile top spacing */}
            <div className="md:hidden h-[60px]" />

            {/* Hero */}
            <HeroSection travelDetails={tripPlan.travel_details} />

            {/* Content area */}
            <div
              className="max-w-7xl mx-auto px-4 md:px-8 py-8"
              style={{ maxWidth: '1280px' }}
            >
              {/* Tab Navigation */}
              <div
                ref={tabsRef}
                className="flex overflow-x-auto no-scrollbar gap-6 mb-8 pb-2"
                style={{
                  borderBottom: '1px solid var(--outline)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 30,
                  background: 'var(--background)',
                  paddingTop: '12px',
                }}
              >
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className="flex items-center gap-2 pb-3 whitespace-nowrap text-sm font-medium transition-all duration-200"
                    style={{
                      color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-muted)',
                      borderBottom: activeTab === tab.id ? '3px solid var(--gold)' : '3px solid transparent',
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      fontSize: '11px',
                    }}
                  >
                    <span>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div>
                {activeTab === 'overview' && (
                  <OverviewTab
                    travelDetails={tripPlan.travel_details}
                    budgetBreakdown={tripPlan.budget_breakdown}
                  />
                )}
                {activeTab === 'itinerary' && (
                  <ItineraryTab itinerary={tripPlan.itinerary} />
                )}
                {activeTab === 'hotels' && (
                  <HotelsTab hotels={tripPlan.hotels} />
                )}
                {activeTab === 'places' && (
                  <PlacesTab places={tripPlan.places} />
                )}
                {activeTab === 'dining' && (
                  <DiningTab restaurants={tripPlan.restaurants} />
                )}
              </div>
            </div>
          </main>
        </div>
      )}
    </>
  );
}
