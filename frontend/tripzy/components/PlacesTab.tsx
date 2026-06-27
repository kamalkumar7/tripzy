'use client';

import { useState } from 'react';
import type { Place } from '@/lib/api';

interface PlacesTabProps {
  places: Place[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? 'var(--gold)' : 'none'}
          stroke={s <= Math.round(rating) ? 'var(--gold)' : 'var(--outline)'}
          strokeWidth={1.5}
          className="w-3.5 h-3.5"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
      <span className="text-xs font-semibold ml-1" style={{ color: 'var(--text-secondary)' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function PlaceCard({ place }: { place: Place }) {
  const [imgError, setImgError] = useState(false);

  const timeColors: Record<string, string> = {
    morning: '#f59e0b',
    afternoon: '#4f6073',
    evening: '#8b949e',
    night: '#1e3248',
    'any time': '#a88c69',
  };
  const timeColor = timeColors[place.best_time?.toLowerCase()] || '#74777d';

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ height: '200px' }}>
        <img
          src={imgError
            ? `https://picsum.photos/seed/${encodeURIComponent(place.name)}/800/400`
            : place.image_url || `https://source.unsplash.com/800x400/?${encodeURIComponent(place.category || 'landmark')},tourism`}
          alt={place.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          style={{ transition: 'transform 0.4s ease' }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
        />
        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full label-caps text-[10px]"
            style={{ background: 'rgba(4,22,39,0.8)', color: 'white', backdropFilter: 'blur(8px)' }}
          >
            {place.category}
          </span>
        </div>
        {/* Entry fee */}
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full"
          style={{
            backdropFilter: 'blur(12px)',
            background: place.entry_fee === 'Free' || place.entry_fee === '0'
              ? 'rgba(19, 115, 51, 0.85)'
              : 'rgba(4,22,39,0.75)',
            color: 'white',
            fontSize: '12px',
            fontWeight: 700,
          }}
        >
          {place.entry_fee === 'Free' || place.entry_fee === '0' ? '✓ Free' : place.entry_fee}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="text-lg font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--text-primary)' }}
          >
            {place.name}
          </h3>
          <StarRating rating={place.rating} />
        </div>

        <p className="text-sm flex items-center gap-1.5 mb-3" style={{ color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {place.location}
        </p>

        <p className="text-sm leading-5 mb-4" style={{ color: 'var(--text-secondary)' }}>
          {place.description}
        </p>

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div
            className="p-2.5 rounded-xl text-center"
            style={{ background: 'var(--surface-low)' }}
          >
            <p className="label-caps mb-0.5" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>Best Time</p>
            <p className="text-xs font-semibold capitalize" style={{ color: timeColor }}>
              {place.best_time}
            </p>
          </div>
          <div
            className="p-2.5 rounded-xl text-center"
            style={{ background: 'var(--surface-low)' }}
          >
            <p className="label-caps mb-0.5" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>Duration</p>
            <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              {place.duration}
            </p>
          </div>
          <div
            className="p-2.5 rounded-xl text-center"
            style={{ background: 'var(--surface-low)' }}
          >
            <p className="label-caps mb-0.5" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>Entry</p>
            <p
              className="text-xs font-semibold"
              style={{
                color: place.entry_fee === 'Free' || place.entry_fee === '0'
                  ? 'var(--success)'
                  : 'var(--text-primary)',
              }}
            >
              {place.entry_fee}
            </p>
          </div>
        </div>

        {/* How to reach */}
        {place.how_to_reach && (
          <div
            className="mb-3 p-3 rounded-xl flex items-start gap-2"
            style={{ background: 'rgba(79,96,115,0.07)', border: '1px solid rgba(79,96,115,0.12)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#4f6073' }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 8 12 12 14 14" />
            </svg>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{place.how_to_reach}</p>
          </div>
        )}

        {/* Tips */}
        {place.tips && (
          <div
            className="mb-4 p-3 rounded-xl"
            style={{ background: 'rgba(233,195,73,0.07)', border: '1px solid rgba(233,195,73,0.18)' }}
          >
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>💡 Tip: </span>
              {place.tips}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          {place.maps_link && (
            <a
              href={place.maps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#041627', color: 'white' }}
            >
              📍 View on Map
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PlacesTab({ places }: PlacesTabProps) {
  if (!places || places.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-4xl mb-4">🏛️</p>
        <p className="text-lg font-medium">No places found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-2xl font-semibold"
          style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--primary)' }}
        >
          Places to Visit
        </h2>
        <span className="tag">{places.length} Places</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {places.map((place, i) => (
          <PlaceCard key={i} place={place} />
        ))}
      </div>
    </div>
  );
}
