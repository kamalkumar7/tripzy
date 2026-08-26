'use client';

import { useState, useEffect } from 'react';
import type {
  TravelDetails,
  BudgetBreakdown,
  Place,
  Restaurant,
  Hotel,
  ItineraryDay,
  SuggestionsData,
} from '@/lib/api';
import { formatCurrency, getBudgetPercent } from '@/lib/api';
import {
  Calendar,
  Sparkles,
  MapPin,
  UtensilsCrossed,
  Building2,
  ShieldCheck,
  SunMedium,
  Shirt,
  ArrowRight,
  Lightbulb,
  CheckCircle2,
  Clock,
  Star,
  ShieldAlert,
} from 'lucide-react';

// ── Cycling status messages shown while budget is being calculated ────────
const BUDGET_TICKERS = [
  '✈️  Checking flight prices…',
  '🏨  Scouting hotels…',
  '🍜  Tasting local cuisine…',
  '🗺️  Mapping adventures…',
  '💰  Crunching numbers…',
  '🎒  Packing the itinerary…',
  '🌐  Consulting travel gurus…',
  '🏔️  Measuring the journey…',
  '🍹  Finding hidden gems…',
  '📍  Pinning your spots…',
];

interface OverviewTabProps {
  travelDetails: TravelDetails;
  budgetBreakdown?: BudgetBreakdown;
  places?: Place[];
  restaurants?: Restaurant[];
  hotels?: Hotel[];
  itinerary?: ItineraryDay[];
  suggestions?: SuggestionsData;
  onSelectTab?: (tab: 'overview' | 'itinerary' | 'hotels' | 'places' | 'dining' | 'suggestions') => void;
}

const budgetItems = [
  { key: 'accommodation' as const, label: 'Accommodation', color: 'var(--text-primary)' },
  { key: 'food' as const, label: 'Food & Dining', color: 'var(--text-primary)' },
  { key: 'transportation' as const, label: 'Transportation', color: 'var(--text-primary)' },
  { key: 'activities' as const, label: 'Activities', color: 'var(--text-primary)' },
  { key: 'miscellaneous' as const, label: 'Miscellaneous', color: 'var(--text-primary)' },
];

const glassCard: React.CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--outline)',
  borderRadius: '1.25rem',
  boxShadow: 'var(--shadow-card)',
};

const innerCard: React.CSSProperties = {
  background: 'var(--surface-low)',
  border: '1px solid var(--outline)',
  borderRadius: '0.875rem',
};

export default function OverviewTab({
  travelDetails,
  budgetBreakdown,
  places = [],
  restaurants = [],
  hotels = [],
  itinerary = [],
  suggestions,
  onSelectTab,
}: OverviewTabProps) {
  const { duration, travelers, interests, budget, destination, overview, travel_type } = travelDetails;
  const bb = budgetBreakdown;

  // Cycling ticker state
  const [tickerIdx, setTickerIdx] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);

  useEffect(() => {
    if (!budgetBreakdown?.is_estimate) return;
    const interval = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => {
        setTickerIdx((i) => (i + 1) % BUDGET_TICKERS.length);
        setTickerVisible(true);
      }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, [budgetBreakdown?.is_estimate]);

  // Derived financial & itinerary intelligence
  const totalEstSpend = bb?.total_estimated || 0;
  const dailySpend = duration > 0 ? Math.round(totalEstSpend / duration) : 0;
  const spendPerPerson = travelers > 0 ? Math.round(totalEstSpend / travelers) : 0;
  const budgetUtilization = bb?.user_budget && bb.user_budget > 0
    ? Math.round((totalEstSpend / bb.user_budget) * 100)
    : 0;

  // Top highlight places (up to 3)
  const topPlaces = places.slice(0, 3);

  // Climate / packing quick insights
  const season = suggestions?.seasonal_clothing?.seasons?.[0];
  const climateOverview = suggestions?.seasonal_clothing?.climate_overview ||
    `${destination} has distinctive regional climate characteristics. Packing breathable layers and sun protection is recommended.`;
  const packingEssentials = season?.packing_essentials?.slice(0, 3) || [
    'Comfortable walking shoes',
    'Breathable lightweight clothing',
    'Universal power adapter & power bank',
  ];

  // Emergency & Helpline info
  const emergencyContacts = suggestions?.emergency_contacts || {
    police: '999 / 112',
    ambulance: '999 / 991',
    tourist_helpline: '1300-88-5050',
  };

  // Top local hack
  const topHack = suggestions?.local_hacks_and_etiquette?.[0] || {
    topic: 'Local Courtesy & Etiquette',
    tip: 'Carry small local currency notes for night markets, and dress respectfully when visiting cultural and sacred heritage sites.',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column — Detailed Trip Overview */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* 1. Trip Details Bento (Preserved & Enhanced) */}
        <div style={glassCard} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2
              className="text-2xl font-bold tracking-tight"
              style={{ color: 'var(--text-primary)' }}
            >
              Trip Details
            </h2>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
              style={{
                background: 'rgba(255, 56, 92, 0.08)',
                color: 'var(--color-primary)',
                border: '1px solid rgba(255, 56, 92, 0.2)',
              }}
            >
              <Sparkles size={13} />
              AI Tailored Plan
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Duration */}
            <div className="flex items-start gap-4 p-4" style={innerCard}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--surface-mid)', color: 'var(--text-primary)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <p className="label-caps mb-1" style={{ color: 'var(--text-muted)' }}>Duration</p>
                <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {duration} {duration === 1 ? 'Day' : 'Days'}
                </p>
              </div>
            </div>

            {/* Travelers */}
            <div className="flex items-start gap-4 p-4" style={innerCard}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--surface-mid)', color: 'var(--text-primary)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="label-caps mb-1" style={{ color: 'var(--text-muted)' }}>Travelers</p>
                <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {travelers} {travelers === 1 ? 'Person' : 'People'}
                </p>
              </div>
            </div>

            {/* Interests */}
            <div className="flex items-start gap-4 p-4" style={innerCard}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--surface-mid)', color: 'var(--text-primary)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <p className="label-caps mb-1" style={{ color: 'var(--text-muted)' }}>Interests</p>
                <p className="text-sm font-medium leading-5" style={{ color: 'var(--text-primary)' }}>
                  {interests.join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Interest tags */}
          {interests.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span
                  key={interest}
                  className="tag text-xs"
                  style={{
                    color: 'var(--primary)',
                    background: 'var(--surface-low)',
                    border: '1px solid var(--outline)',
                  }}
                >
                  {interest}
                </span>
              ))}
            </div>
          )}

          {/* ── Key Metrics Ribbon (Daily spend, Per traveler, Sights, Stays) ── */}
          <div
            className="mt-6 pt-5 grid grid-cols-2 sm:grid-cols-4 gap-3"
            style={{ borderTop: '1px solid var(--outline)' }}
          >
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface-low)' }}>
              <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Daily Est. Spend</p>
              <p className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {dailySpend > 0 ? `${formatCurrency(dailySpend)}/day` : '—'}
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-low)' }}>
              <p className="text-[11px] font-medium label-caps" style={{ color: 'var(--text-muted)' }}>Est. / Traveler</p>
              <p className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {spendPerPerson > 0 ? `${formatCurrency(spendPerPerson)}/person` : '—'}
              </p>
            </div>
            <div className="p-3 rounded-lg" style={{ background: 'var(--surface-low)' }}>
              <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Curated Sights</p>
              <p className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {places.length > 0 ? `${places.length} Attractions` : `${duration * 2}+ Sights`}
              </p>
            </div>
            <div className="p-4 rounded-xl" style={{ background: 'var(--surface-low)' }}>
              <p className="text-[11px] font-medium label-caps" style={{ color: 'var(--text-muted)' }}>Stay Options</p>
              <p className="text-base font-bold mt-0.5" style={{ color: 'var(--text-primary)' }}>
                {hotels.length > 0 ? `${hotels.length} Curated Stays` : 'Handpicked Stays'}
              </p>
            </div>
          </div>
        </div>

        {/* 2. About This Trip (Preserved & Enhanced) */}
        <div style={glassCard} className="p-6">
          <h2
            className="text-2xl font-bold tracking-tight mb-4"
            style={{ color: 'var(--text-primary)' }}
          >
            About This Trip
          </h2>
          <p className="text-base leading-7" style={{ color: 'var(--text-secondary)' }}>
            {overview}
          </p>
          <div
            className="mt-5 pt-4 flex flex-wrap items-center justify-between gap-4"
            style={{ borderTop: '1px solid var(--outline)' }}
          >
            <div className="flex items-center gap-6">
              <div>
                <p className="label-caps mb-1" style={{ color: 'var(--text-muted)' }}>Travel Style</p>
                <p className="font-semibold" style={{ color: 'var(--primary)' }}>{travel_type}</p>
              </div>
              <div>
                <p className="label-caps mb-1" style={{ color: 'var(--text-muted)' }}>Total Budget</p>
                {(!budget || isNaN(Number(budget))) ? (
                  <div className="h-5 w-16 rounded animate-pulse" style={{ background: 'var(--surface-mid)' }} />
                ) : (
                  <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatCurrency(budget)}</p>
                )}
              </div>
            </div>

            {/* Quick Action to view itinerary */}
            {onSelectTab && (
              <button
                onClick={() => onSelectTab('itinerary')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                style={{
                  background: 'rgba(233,195,73,0.12)',
                  color: 'var(--gold)',
                  border: '1px solid rgba(233,195,73,0.3)',
                }}
              >
                <span>View Full Day-by-Day Plan</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* 3. Signature Highlights Preview */}
        {topPlaces.length > 0 && (
          <div style={glassCard} className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3
                  className="text-xl font-bold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Signature Highlights
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Hand-selected top attractions for this itinerary
                </p>
              </div>
              {onSelectTab && (
                <button
                  onClick={() => onSelectTab('places')}
                  className="text-xs font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <span>Explore all {places.length} places</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {topPlaces.map((place, idx) => (
                <div
                  key={idx}
                  className="rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
                  style={{
                    background: 'var(--surface-low)',
                    border: '1px solid var(--outline)',
                  }}
                >
                  <div className="relative h-28 w-full overflow-hidden bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        place.image_url ||
                        `https://source.unsplash.com/400x300/?${encodeURIComponent(place.name)},travel`
                      }
                      alt={place.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${encodeURIComponent(place.name)}/400/300`;
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.7) 0%, transparent 60%)' }}
                    />
                    <span
                      className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold label-caps"
                      style={{
                        background: 'rgba(2,6,23,0.75)',
                        color: 'var(--color-primary)',
                        border: '1px solid rgba(255,56,92,0.3)',
                      }}
                    >
                      {place.category || 'Sight'}
                    </span>
                  </div>

                  <div className="p-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <h4 className="font-semibold text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>
                          {place.name}
                        </h4>
                        {place.rating > 0 && (
                          <span className="flex items-center gap-0.5 text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                            <Star size={11} fill="currentColor" />
                            {place.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {place.description}
                      </p>
                    </div>

                    <div
                      className="mt-3 pt-2 flex items-center justify-between text-[11px]"
                      style={{ borderTop: '1px solid var(--outline)', color: 'var(--text-muted)' }}
                    >
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {place.duration || '2-3 hrs'}
                      </span>
                      <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {place.entry_fee || 'Varies'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Travel Intelligence & Logistics Bento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Climate & Packing Brief */}
          <div style={glassCard} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--surface-mid)', color: 'var(--text-primary)' }}
                >
                  <SunMedium size={16} />
                </div>
                <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                  Climate & Packing Snapshot
                </h3>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                {climateOverview}
              </p>

              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>
                  Essential Essentials:
                </p>
                {packingEssentials.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-primary)' }}>
                    <CheckCircle2 size={13} className="text-emerald-500 flex-shrink-0" />
                    <span className="line-clamp-1">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {onSelectTab && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--outline)' }}>
                <button
                  onClick={() => onSelectTab('suggestions')}
                  className="text-xs font-semibold flex items-center gap-1.5 hover:underline cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <Shirt size={13} />
                  <span>Full Seasonal Packing Guide & Weather →</span>
                </button>
              </div>
            )}
          </div>

          {/* Local Etiquette & Safety Hotlines */}
          <div style={glassCard} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--surface-mid)', color: 'var(--text-primary)' }}
                >
                  <ShieldCheck size={16} />
                </div>
                <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                  Local Etiquette & Safety
                </h3>
              </div>

              {/* Top Etiquette Tip */}
              <div className="p-3 rounded-lg mb-3" style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}>
                <p className="text-xs font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <Lightbulb size={13} />
                  {topHack.topic}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {topHack.tip}
                </p>
              </div>

              {/* Emergency Helplines */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                  Emergency Assistance Numbers:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded flex items-center justify-between" style={{ background: 'var(--surface-low)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Police:</span>
                    <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{emergencyContacts.police || '999/112'}</span>
                  </div>
                  <div className="p-2 rounded flex items-center justify-between" style={{ background: 'var(--surface-low)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Ambulance:</span>
                    <span className="font-mono font-bold" style={{ color: 'var(--text-primary)' }}>{emergencyContacts.ambulance || '999/991'}</span>
                  </div>
                </div>
              </div>
            </div>

            {onSelectTab && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--outline)' }}>
                <button
                  onClick={() => onSelectTab('suggestions')}
                  className="text-xs font-semibold flex items-center gap-1.5 hover:underline cursor-pointer"
                  style={{ color: 'var(--text-primary)' }}
                >
                  <ShieldAlert size={13} />
                  <span>View Scam Alerts & Safety Dossier →</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Right Column — Budget Widget & Quick Explorer */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Sticky Budget Widget (Preserved & Enhanced) */}
        <div style={{ ...glassCard, position: 'sticky', top: '80px' }} className="p-6">
          {!budgetBreakdown ? (
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-1/3 rounded-lg" style={{ background: 'var(--surface-high)' }} />
              <div className="h-24 rounded-xl" style={{ background: 'var(--surface-low)' }} />
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <div className="h-3 w-1/3 rounded" style={{ background: 'var(--surface-mid)' }} />
                    <div className="h-3 w-1/5 rounded" style={{ background: 'var(--surface-mid)' }} />
                  </div>
                  <div className="h-1.5 w-full rounded-full" style={{ background: 'var(--surface-high)' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                  <h2
                    className="text-2xl font-bold tracking-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Budget
                  </h2>
                  {budgetBreakdown.is_estimate && (
                    <span
                      className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                      style={{ background: 'var(--gold)', marginBottom: '2px' }}
                      title="Calculating actual costs…"
                    />
                  )}
                </div>
                {budgetBreakdown.is_estimate ? (
                  <span
                    className="px-3 py-1 rounded-full label-caps text-[10px] flex items-center gap-1"
                    style={{
                      background: 'rgba(255,56,92,0.08)',
                      color: 'var(--color-primary)',
                      border: '1px solid rgba(255,56,92,0.2)',
                    }}
                  >
                    Estimated
                  </span>
                ) : budgetBreakdown.within_budget ? (
                  <span
                    className="px-3 py-1 rounded-full label-caps text-[10px] flex items-center gap-1"
                    style={{
                      background: 'var(--success-bg)',
                      color: 'var(--success)',
                      border: '1px solid var(--success-border)',
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Within Budget
                  </span>
                ) : (
                  <span
                    className="px-3 py-1 rounded-full label-caps text-[10px] flex items-center gap-1"
                    style={{
                      background: 'rgba(186,26,26,0.08)',
                      color: 'var(--error)',
                      border: '1px solid rgba(186,26,26,0.2)',
                    }}
                  >
                    Over Budget
                  </span>
                )}
              </div>

              {/* Total */}
              <div
                className="text-center mb-6 py-5 rounded-xl"
                style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}
              >
                <p className="label-caps mb-1" style={{ color: 'var(--text-muted)' }}>Total Budget</p>
                <p
                  className="text-4xl font-extrabold tracking-tight"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {formatCurrency(budgetBreakdown.user_budget)}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  Est. spend: {formatCurrency(budgetBreakdown.total_estimated)}
                </p>

                {/* ── Animated calculating ticker ── */}
                {budgetBreakdown.is_estimate && (
                  <div className="mt-3 px-3">
                    <div
                      className="w-full h-0.5 rounded-full overflow-hidden mb-2"
                      style={{ background: 'rgba(233,195,73,0.15)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: '40%',
                          background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
                          animation: 'tripzy-scan 1.6s ease-in-out infinite',
                        }}
                      />
                    </div>
                    <p
                      className="text-xs"
                      style={{
                        color: 'var(--color-primary)',
                        opacity: tickerVisible ? 1 : 0,
                        transition: 'opacity 0.35s ease',
                        letterSpacing: '0.03em',
                        minHeight: '1.2em',
                      }}
                    >
                      {BUDGET_TICKERS[tickerIdx]}
                    </p>
                  </div>
                )}
              </div>

              {/* Progress bars */}
              <div className="space-y-4 mb-6">
                {budgetItems.map((item) => {
                  const amount = budgetBreakdown[item.key] ?? 0;
                  const pct = getBudgetPercent(amount, budgetBreakdown.user_budget);
                  return (
                    <div key={item.key}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: item.color }}
                          />
                          {item.label}
                        </span>
                        <span className="text-sm font-semibold" style={{ color: item.color }}>
                          {formatCurrency(amount)}
                        </span>
                      </div>
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden"
                        style={{ background: 'var(--surface-high)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: item.color,
                            boxShadow: `0 0 8px ${item.color}60`,
                            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Remaining */}
              <div
                className="pt-4 flex justify-between items-center"
                style={{ borderTop: '1px solid var(--outline)' }}
              >
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Remaining</span>
                <span
                  className="text-lg font-bold"
                  style={{ color: budgetBreakdown.remaining >= 0 ? 'var(--text-primary)' : 'var(--error)' }}
                >
                  {formatCurrency(budgetBreakdown.remaining)}
                </span>
              </div>

              {/* Financial Health Summary */}
              {budgetBreakdown.user_budget > 0 && (
                <div
                  className="mt-4 p-3 rounded-lg text-xs flex items-center justify-between"
                  style={{
                    background: 'var(--surface-low)',
                    border: '1px solid var(--outline)',
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Budget Allocated:</span>
                  <span className="font-semibold" style={{ color: budgetUtilization <= 100 ? 'var(--text-primary)' : 'var(--error)' }}>
                    {budgetUtilization}% ({formatCurrency(budgetBreakdown.remaining)} buffer)
                  </span>
                </div>
              )}

              {/* Quick Tab Jump Navigator */}
              {onSelectTab && (
                <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--outline)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
                    Explore Plan Sections
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSelectTab('itinerary')}
                      className="p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
                      style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)', color: 'var(--text-primary)' }}
                    >
                      <Calendar size={14} />
                      <span>Itinerary ({itinerary.length > 0 ? `${itinerary.length}d` : `${duration}d`})</span>
                    </button>
                    <button
                      onClick={() => onSelectTab('hotels')}
                      className="p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
                      style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)', color: 'var(--text-primary)' }}
                    >
                      <Building2 size={14} />
                      <span>Hotels ({hotels.length})</span>
                    </button>
                    <button
                      onClick={() => onSelectTab('places')}
                      className="p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
                      style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)', color: 'var(--text-primary)' }}
                    >
                      <MapPin size={14} />
                      <span>Places ({places.length})</span>
                    </button>
                    <button
                      onClick={() => onSelectTab('dining')}
                      className="p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
                      style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)', color: 'var(--text-primary)' }}
                    >
                      <UtensilsCrossed size={14} />
                      <span>Dining ({restaurants.length})</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
