'use client';

import { useState } from 'react';

interface TripSearchProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

const examples = [
  'I want to go to Paris for 5 days with a budget of $3000',
  'Plan a 7-day trip to Tokyo for 2 people, budget $4500',
  'Weekend trip to Bali for 4 days, $2000 budget, I love beaches',
  'Cultural trip to Rome for 6 days with $2500',
  'Adventure trip to Bali for 10 days, budget $5000',
];

export default function TripSearch({ onSubmit, isLoading }: TripSearchProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSubmit(input.trim());
    }
  };

  const handleExample = (example: string) => {
    setInput(example);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      {/* Background decoration */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(233,195,73,0.07) 0%, transparent 65%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(4,22,39,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 w-full max-w-2xl text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg"
            style={{ background: '#041627', color: 'var(--gold)' }}
          >
            T
          </div>
          <div className="text-left">
            <p
              className="text-3xl font-bold tracking-tight"
              style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--primary)' }}
            >
              Tripzy
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              AI-Powered Travel Planning
            </p>
          </div>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl font-bold mb-4 leading-tight"
          style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--primary)' }}
        >
          Where do you want to go?
        </h1>
        <p className="text-lg mb-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
          Describe your dream trip and our AI will create a complete itinerary,
          find hotels, restaurants, and places — in seconds.
        </p>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <div
            className="relative rounded-2xl overflow-hidden mb-3"
            style={{
              boxShadow: '0 8px 40px rgba(4,22,39,0.12)',
              border: '1.5px solid var(--outline)',
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. I want to go to Tokyo for 7 days with a budget of $4000, interested in culture and food..."
              rows={3}
              className="w-full px-6 py-5 text-base resize-none focus:outline-none leading-relaxed"
              style={{
                background: 'var(--surface)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-inter), sans-serif',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  handleSubmit(e as unknown as React.FormEvent);
                }
              }}
              disabled={isLoading}
            />
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ background: 'var(--surface-low)', borderTop: '1px solid var(--outline)' }}
            >
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Ctrl+Enter to submit
              </p>
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() && !isLoading ? '#041627' : 'var(--surface-high)',
                  color: input.trim() && !isLoading ? 'white' : 'var(--text-muted)',
                  transform: 'scale(1)',
                }}
                onMouseEnter={(e) => {
                  if (input.trim() && !isLoading)
                    (e.currentTarget as HTMLElement).style.background = 'var(--gold)';
                }}
                onMouseLeave={(e) => {
                  if (input.trim() && !isLoading)
                    (e.currentTarget as HTMLElement).style.background = '#041627';
                }}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Planning...
                  </>
                ) : (
                  <>
                    Plan My Trip
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Example prompts */}
        <div className="text-left">
          <p className="label-caps mb-3 text-center" style={{ color: 'var(--text-muted)' }}>
            Try an example
          </p>
          <div className="flex flex-col gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => handleExample(ex)}
                disabled={isLoading}
                className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-150 disabled:opacity-50"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--outline)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--outline)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
                }}
              >
                <span style={{ color: 'var(--gold)' }}>✈ </span>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          {[
            { icon: '📅', label: 'Day-by-Day Itinerary' },
            { icon: '🏨', label: 'Hotel Recommendations' },
            { icon: '💰', label: 'Budget Breakdown' },
          ].map((f) => (
            <div
              key={f.label}
              className="p-4 rounded-xl text-center"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--outline)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <p className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{f.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
