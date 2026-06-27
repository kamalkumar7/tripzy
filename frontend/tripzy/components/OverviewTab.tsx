'use client';

import type { TravelDetails, BudgetBreakdown } from '@/lib/api';
import { formatCurrency, getBudgetPercent } from '@/lib/api';

interface OverviewTabProps {
  travelDetails: TravelDetails;
  budgetBreakdown: BudgetBreakdown;
}

const budgetItems = [
  { key: 'accommodation' as const, label: 'Accommodation', color: '#38bdf8' },
  { key: 'food' as const, label: 'Food & Dining', color: '#e9c349' },
  { key: 'transportation' as const, label: 'Transportation', color: '#a78bfa' },
  { key: 'activities' as const, label: 'Activities', color: '#34d399' },
  { key: 'miscellaneous' as const, label: 'Miscellaneous', color: '#fb923c' },
];

const glassCard: React.CSSProperties = {
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  background: 'rgba(15,23,42,0.72)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '1.25rem',
  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
};

const innerCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '0.875rem',
};

export default function OverviewTab({ travelDetails, budgetBreakdown }: OverviewTabProps) {
  const { duration, travelers, interests, budget } = travelDetails;
  const bb = budgetBreakdown;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left — Trip Details */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Trip Details Bento */}
        <div style={glassCard} className="p-6">
          <h2
            className="text-2xl font-semibold mb-6"
            style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}
          >
            Trip Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Duration */}
            <div className="flex items-start gap-4 p-4" style={innerCard}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <p className="label-caps mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Duration</p>
                <p className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
                  {duration} {duration === 1 ? 'Day' : 'Days'}
                </p>
              </div>
            </div>

            {/* Travelers */}
            <div className="flex items-start gap-4 p-4" style={innerCard}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="label-caps mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Travelers</p>
                <p className="text-xl font-semibold" style={{ color: '#f1f5f9' }}>
                  {travelers} {travelers === 1 ? 'Person' : 'People'}
                </p>
              </div>
            </div>

            {/* Interests */}
            <div className="flex items-start gap-4 p-4" style={innerCard}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(233,195,73,0.15)', color: '#e9c349' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <p className="label-caps mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Interests</p>
                <p className="text-sm font-medium leading-5" style={{ color: '#f1f5f9' }}>
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
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 600,
                    background: 'rgba(56,189,248,0.1)',
                    color: '#7dd3fc',
                    border: '1px solid rgba(56,189,248,0.2)',
                  }}
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
            style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}
          >
            About This Trip
          </h2>
          <p className="text-base leading-7" style={{ color: 'rgba(255,255,255,0.65)' }}>
            {travelDetails.overview}
          </p>
          <div
            className="mt-4 pt-4 flex items-center gap-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <div>
              <p className="label-caps mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Travel Style</p>
              <p className="font-semibold" style={{ color: '#38bdf8' }}>{travelDetails.travel_type}</p>
            </div>
            <div>
              <p className="label-caps mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Total Budget</p>
              <p className="font-semibold" style={{ color: '#e9c349' }}>{formatCurrency(budget)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Budget Widget */}
      <div className="lg:col-span-4">
        <div style={{ ...glassCard, position: 'sticky', top: '80px' }} className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}
            >
              Budget
            </h2>
            {bb.within_budget ? (
              <span
                className="px-3 py-1 rounded-full label-caps text-[10px] flex items-center gap-1"
                style={{
                  background: 'rgba(52,211,153,0.12)',
                  color: '#34d399',
                  border: '1px solid rgba(52,211,153,0.25)',
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
                style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}
              >
                Over Budget
              </span>
            )}
          </div>

          {/* Total */}
          <div className="text-center mb-6 py-5 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="label-caps mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Total Budget</p>
            <p
              className="text-4xl font-bold"
              style={{ fontFamily: 'Georgia, serif', color: '#e9c349' }}
            >
              {formatCurrency(bb.user_budget)}
            </p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Est. spend: {formatCurrency(bb.total_estimated)}
            </p>
          </div>

          {/* Progress bars */}
          <div className="space-y-4 mb-6">
            {budgetItems.map((item) => {
              const amount = bb[item.key] ?? 0;
              const pct = getBudgetPercent(amount, bb.user_budget);
              return (
                <div key={item.key}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
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
                    style={{ background: 'rgba(255,255,255,0.07)' }}
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
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Remaining</span>
            <span
              className="text-lg font-bold"
              style={{ color: bb.remaining >= 0 ? '#34d399' : '#f87171' }}
            >
              {formatCurrency(bb.remaining)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
