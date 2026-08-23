'use client';

import { useState } from 'react';
import type { Place } from '@/lib/api';
import { Star, MapPin, Clock, DollarSign, Navigation, Lightbulb, CheckCircle } from 'lucide-react';

interface PlacesTabProps {
  places: Place[];
}

const timeColors: Record<string, string> = {
  morning:    '#fb923c',
  afternoon:  '#38bdf8',
  evening:    '#a78bfa',
  night:      '#8b949e',
  'any time': '#34d399',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= Math.round(rating) ? '#e9c349' : 'none'}
          color={s <= Math.round(rating) ? '#e9c349' : 'var(--outline)'}
          strokeWidth={1.5}
        />
      ))}
      <span className="text-xs font-semibold ml-1" style={{ color: 'var(--text-muted)' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function PlaceCard({ place }: { place: Place }) {
  const [imgError, setImgError] = useState(false);
  const timeColor = timeColors[place.best_time?.toLowerCase()] || 'var(--text-muted)';
  const isFree = place.entry_fee === 'Free' || place.entry_fee === '0';

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgError
            ? `https://picsum.photos/seed/${encodeURIComponent(place.name)}/800/400`
            : place.image_url || `https://source.unsplash.com/800x400/?${encodeURIComponent(place.category || 'landmark')},tourism`}
          alt={place.name}
          className="w-full h-full object-cover transition-transform duration-500"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,22,39,0.82) 0%, transparent 55%)' }} />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full label-caps"
            style={{
              background: 'rgba(4,22,39,0.72)', color: '#ffffff',
              backdropFilter: 'blur(8px)', fontSize: '10px',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
            {place.category}
          </span>
        </div>

        {/* Entry fee badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{
            backdropFilter: 'blur(12px)',
            background: isFree ? 'rgba(52,211,153,0.2)' : 'rgba(4,22,39,0.72)',
            border: isFree ? '1px solid rgba(52,211,153,0.35)' : '1px solid rgba(255,255,255,0.12)',
            color: isFree ? '#34d399' : '#ffffff',
            fontSize: '12px', fontWeight: 700,
          }}>
          {isFree ? <CheckCircle size={11} /> : <DollarSign size={11} />}
          {isFree ? 'Free' : place.entry_fee}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
            {place.name}
          </h3>
          <StarRating rating={place.rating} />
        </div>

        <p className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          <MapPin size={11} /> {place.location}
        </p>

        <p className="text-sm leading-5 mb-4" style={{ color: 'var(--text-secondary)' }}>
          {place.description}
        </p>

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Best Time', value: place.best_time, color: timeColor,        Icon: Clock      },
            { label: 'Duration',  value: place.duration,  color: '#38bdf8',        Icon: Clock      },
            { label: 'Entry',     value: place.entry_fee, color: isFree ? '#34d399' : 'var(--gold)', Icon: DollarSign },
          ].map(({ label, value, color, Icon }) => (
            <div key={label} className="p-2.5 rounded-xl text-center"
              style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}>
              <p className="label-caps mb-1" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>
                {label}
              </p>
              <p className="text-xs font-semibold capitalize" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* How to reach */}
        {place.how_to_reach && (
          <div className="mb-3 p-3 rounded-xl flex items-start gap-2"
            style={{ background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.18)' }}>
            <Navigation size={13} color="#a78bfa" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{place.how_to_reach}</p>
          </div>
        )}

        {/* Tip */}
        {place.tips && (
          <div className="mb-4 p-3 rounded-xl"
            style={{ background: 'rgba(233,195,73,0.08)', border: '1px solid rgba(233,195,73,0.18)' }}>
            <p className="text-xs">
              <span className="inline-flex items-center gap-1 font-semibold" style={{ color: 'var(--gold)' }}>
                <Lightbulb size={11} /> Tip:{' '}
              </span>
              <span style={{ color: 'var(--text-secondary)' }}>{place.tips}</span>
            </p>
          </div>
        )}

        {/* Action button */}
        <div className="flex gap-2 mt-auto">
          {place.maps_link && (
            <a href={place.maps_link} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: '#041627', color: '#e9c349' }}>
              <Navigation size={13} /> View on Map
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
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}>
          <MapPin size={28} style={{ color: 'var(--outline)' }} />
        </div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No places found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
          Places to Visit
        </h2>
        <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, background: 'rgba(4,22,39,0.07)', color: 'var(--primary)', border: '1px solid var(--outline)' }}>
          {places.length} Places
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {places.map((place, i) => <PlaceCard key={i} place={place} />)}
      </div>
    </div>
  );
}
