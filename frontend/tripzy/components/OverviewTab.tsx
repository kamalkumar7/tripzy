'use client';

import type { TravelDetails, BudgetBreakdown } from '@/lib/api';
import { formatCurrency, getBudgetPercent } from '@/lib/api';

interface OverviewTabProps {
  travelDetails: TravelDetails;
  budgetBreakdown: BudgetBreakdown;
}

const budgetItems = [
  { key: 'accommodation' as const, label: 'Accommodation', color: '#041627' },
  { key: 'food' as const, label: 'Food & Dining', color: '#e9c349' },
  { key: 'transportation' as const, label: 'Transportation', color: '#4f6073' },
  { key: 'activities' as const, label: 'Activities', color: '#a88c69' },
  { key: 'miscellaneous' as const, label: 'Miscellaneous', color: '#74777d' },
];

export default function OverviewTab({ travelDetails, budgetBreakdown }: OverviewTabProps) {
  const { duration, travelers, interests, budget } = travelDetails;
  const bb = budgetBreakdown;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left — Trip Details */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Trip Details Bento */}
        <div className="card p-6">
          <h2
            className="text-2xl font-semibold mb-6"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--primary)' }}
          >
            Trip Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Duration */}
            <div
              className="flex items-start gap-4 p-4 rounded-xl"
              style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(4,22,39,0.07)', color: 'var(--primary)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <p className="label-caps mb-1" style={{ color: 'var(--text-secondary)' }}>Duration</p>
                <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {duration} {duration === 1 ? 'Day' : 'Days'}
                </p>
              </div>
            </div>

            {/* Travelers */}
            <div
              className="flex items-start gap-4 p-4 rounded-xl"
              style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(4,22,39,0.07)', color: 'var(--primary)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="label-caps mb-1" style={{ color: 'var(--text-secondary)' }}>Travelers</p>
                <p className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {travelers} {travelers === 1 ? 'Person' : 'People'}
                </p>
              </div>
            </div>

            {/* Interests */}
            <div
              className="flex items-start gap-4 p-4 rounded-xl"
              style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(4,22,39,0.07)', color: 'var(--primary)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <p className="label-caps mb-1" style={{ color: 'var(--text-secondary)' }}>Interests</p>
                <p className="text-sm font-medium leading-5" style={{ color: 'var(--text-primary)' }}>
                  {interests.join(', ')}
                </p>
              </div>
            </div>
          </div>

          {/* Interests tags */}
          {interests.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {interests.map((interest) => (
                <span key={interest} className="tag">{interest}</span>
              ))}
            </div>
          )}
        </div>

        {/* Overview text */}
        <div className="card p-6">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--primary)' }}
          >
            About This Trip
          </h2>
          <p className="text-base leading-7" style={{ color: 'var(--text-secondary)' }}>
            {travelDetails.overview}
          </p>
          <div className="mt-4 pt-4 flex items-center gap-6" style={{ borderTop: '1px solid var(--outline)' }}>
            <div>
              <p className="label-caps mb-1" style={{ color: 'var(--text-muted)' }}>Travel Style</p>
              <p className="font-semibold" style={{ color: 'var(--primary)' }}>{travelDetails.travel_type}</p>
            </div>
            <div>
              <p className="label-caps mb-1" style={{ color: 'var(--text-muted)' }}>Total Budget</p>
              <p className="font-semibold" style={{ color: 'var(--primary)' }}>{formatCurrency(budget)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Budget Widget */}
      <div className="lg:col-span-4">
        <div className="card p-6 sticky top-24">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <h2
              className="text-2xl font-semibold"
              style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--primary)' }}
            >
              Budget
            </h2>
            {bb.within_budget ? (
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
                style={{ background: '#ffdad6', color: 'var(--error)', border: '1px solid #f9b4ae' }}
              >
                Over Budget
              </span>
            )}
          </div>

          {/* Total */}
          <div className="text-center mb-6">
            <p className="label-caps mb-1" style={{ color: 'var(--text-muted)' }}>Total Budget</p>
            <p
              className="text-4xl font-bold"
              style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--primary)' }}
            >
              {formatCurrency(bb.user_budget)}
            </p>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
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
                    <span className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: item.color }}
                      />
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>
                      {formatCurrency(amount)}
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: `${pct}%`, background: item.color }}
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
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Remaining</span>
            <span
              className="text-lg font-bold"
              style={{ color: bb.remaining >= 0 ? 'var(--gold-dark)' : 'var(--error)' }}
            >
              {formatCurrency(bb.remaining)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
