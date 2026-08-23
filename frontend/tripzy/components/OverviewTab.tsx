'use client';

import { useState, useEffect } from 'react';
import type { TravelDetails, BudgetBreakdown } from '@/lib/api';
import { formatCurrency, getBudgetPercent } from '@/lib/api';

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
}

const budgetItems = [
  { key: 'accommodation' as const, label: 'Accommodation', color: '#38bdf8' },
  { key: 'food' as const, label: 'Food & Dining', color: '#e9c349' },
  { key: 'transportation' as const, label: 'Transportation', color: '#a78bfa' },
  { key: 'activities' as const, label: 'Activities', color: '#34d399' },
  { key: 'miscellaneous' as const, label: 'Miscellaneous', color: '#fb923c' },
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

export default function OverviewTab({ travelDetails, budgetBreakdown }: OverviewTabProps) {
  const { duration, travelers, interests, budget } = travelDetails;
  const bb = budgetBreakdown;

  // Cycling ticker state
  const [tickerIdx, setTickerIdx] = useState(0);
  const [tickerVisible, setTickerVisible] = useState(true);

  useEffect(() => {
    if (!budgetBreakdown?.is_estimate) return;
    const interval = setInterval(() => {
      setTickerVisible(false);
      setTimeout(() => {
        setTickerIdx(i => (i + 1) % BUDGET_TICKERS.length);
        setTickerVisible(true);
      }, 400);
    }, 2200);
    return () => clearInterval(interval);
  }, [budgetBreakdown?.is_estimate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left — Trip Details */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Trip Details Bento */}
        <div style={glassCard} className="p-6">
          <h2
            className="text-2xl font-semibold mb-6"
            style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}
          >
            Trip Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Duration */}
            <div className="flex items-start gap-4 p-4" style={innerCard}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(56,189,248,0.12)', color: '#38bdf8' }}
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
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(167,139,250,0.12)', color: '#a78bfa' }}
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
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(233,195,73,0.12)', color: 'var(--gold)' }}
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
                  className="tag"
                  style={{ color: 'var(--primary)' }}
                >
                  {interest}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* About This Trip */}
        <div style={glassCard} className="p-6">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}
          >
            About This Trip
          </h2>
          <p className="text-base leading-7" style={{ color: 'var(--text-secondary)' }}>
            {travelDetails.overview}
          </p>
          <div
            className="mt-4 pt-4 flex items-center gap-6"
            style={{ borderTop: '1px solid var(--outline)' }}
          >
            <div>
              <p className="label-caps mb-1" style={{ color: 'var(--text-muted)' }}>Travel Style</p>
              <p className="font-semibold" style={{ color: 'var(--primary)' }}>{travelDetails.travel_type}</p>
            </div>
            <div>
              <p className="label-caps mb-1" style={{ color: 'var(--text-muted)' }}>Total Budget</p>
              {(!budget || isNaN(Number(budget))) ? (
                <div className="h-5 w-16 rounded animate-pulse" style={{ background: 'rgba(233,195,73,0.2)' }} />
              ) : (
                <p className="font-semibold" style={{ color: 'var(--gold)' }}>{formatCurrency(budget)}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right — Budget Widget */}
      <div className="lg:col-span-4">
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
                    className="text-2xl font-semibold"
                    style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}
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
                    style={{ background: 'rgba(233,195,73,0.12)', color: 'var(--gold)', border: '1px solid rgba(233,195,73,0.25)' }}
                  >
                    Estimated
                  </span>
                ) : budgetBreakdown.within_budget ? (
                  <span
                    className="px-3 py-1 rounded-full label-caps text-[10px] flex items-center gap-1"
                    style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)' }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                    Within Budget
                  </span>
                ) : (
                  <span
                    className="px-3 py-1 rounded-full label-caps text-[10px] flex items-center gap-1"
                    style={{ background: 'rgba(186,26,26,0.08)', color: 'var(--error)', border: '1px solid rgba(186,26,26,0.2)' }}
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
                  className="text-4xl font-bold"
                  style={{ fontFamily: 'Playfair Display, serif', color: 'var(--gold)' }}
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
                          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
                          animation: 'tripzy-scan 1.6s ease-in-out infinite',
                        }}
                      />
                    </div>
                    <p
                      className="text-xs"
                      style={{
                        color: 'var(--gold)',
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
                  style={{ color: budgetBreakdown.remaining >= 0 ? 'var(--success)' : 'var(--error)' }}
                >
                  {formatCurrency(budgetBreakdown.remaining)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
