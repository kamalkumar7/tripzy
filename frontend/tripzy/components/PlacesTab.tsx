'use client';

import { useState } from 'react';
import type { Place } from '@/lib/api';
import { Star, MapPin, Clock, DollarSign, Navigation, Lightbulb, CheckCircle } from 'lucide-react';

interface PlacesTabProps {
  places: Place[];
}

const CYAN = '#38bdf8';
const GOLD = '#e9c349';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= Math.round(rating) ? GOLD : 'none'}
          color={s <= Math.round(rating) ? GOLD : 'rgba(255,255,255,0.2)'}
          strokeWidth={1.5}
        />
      ))}
      <span className="text-xs font-semibold ml-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

const timeColors: Record<string, string> = {
  morning:   '#fb923c',
  afternoon: CYAN,
  evening:   '#a78bfa',
  night:     '#8b949e',
  'any time':'#34d399',
};

function PlaceCard({ place }: { place: Place }) {
  const [imgError, setImgError] = useState(false);
  const timeColor = timeColors[place.best_time?.toLowerCase()] || '#74777d';
  const isFree = place.entry_fee === 'Free' || place.entry_fee === '0';

  const glassCard: React.CSSProperties = {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    background: 'rgba(15,23,42,0.70)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.125rem',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'border-color 0.2s ease, transform 0.2s ease',
  };

  return (
    <div
      style={glassCard}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.22)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        <img
          src={imgError
            ? `https://picsum.photos/seed/${encodeURIComponent(place.name)}/800/400`
            : place.image_url || `https://source.unsplash.com/800x400/?${encodeURIComponent(place.category || 'landmark')},tourism`}
          alt={place.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          style={{ transition: 'transform 0.5s ease' }}
          onMouseEnter={e => ((e.target as HTMLElement).style.transform = 'scale(1.05)')}
          onMouseLeave={e => ((e.target as HTMLElement).style.transform = 'scale(1)')}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.8) 0%, transparent 50%)' }} />

        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full"
            style={{
              background: 'rgba(2,6,23,0.75)', color: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)', fontSize: '10px', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              border: '1px solid rgba(255,255,255,0.1)',
            }}>
            {place.category}
          </span>
        </div>

        <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full"
          style={{
            backdropFilter: 'blur(12px)',
            background: isFree ? 'rgba(52,211,153,0.2)' : 'rgba(2,6,23,0.75)',
            border: isFree ? '1px solid rgba(52,211,153,0.35)' : '1px solid rgba(255,255,255,0.1)',
            color: isFree ? '#34d399' : '#f1f5f9',
            fontSize: '12px', fontWeight: 700,
          }}>
          {isFree ? <CheckCircle size={11} /> : <DollarSign size={11} />}
          {isFree ? 'Free' : place.entry_fee}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold leading-tight" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
            {place.name}
          </h3>
          <StarRating rating={place.rating} />
        </div>

        <p className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <MapPin size={11} /> {place.location}
        </p>

        <p className="text-sm leading-5 mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {place.description}
        </p>

        {/* Meta row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: 'Best Time', value: place.best_time, color: timeColor, Icon: Clock },
            { label: 'Duration',  value: place.duration,  color: CYAN,      Icon: Clock },
            { label: 'Entry',     value: place.entry_fee, color: isFree ? '#34d399' : GOLD, Icon: DollarSign },
          ].map(({ label, value, color, Icon }) => (
            <div key={label} className="p-2.5 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>
                {label}
              </p>
              <p className="text-xs font-semibold capitalize" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {place.how_to_reach && (
          <div className="mb-3 p-3 rounded-xl flex items-start gap-2"
            style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.12)' }}>
            <Navigation size={13} color="#a78bfa" className="flex-shrink-0 mt-0.5" />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{place.how_to_reach}</p>
          </div>
        )}

        {place.tips && (
          <div className="mb-4 p-3 rounded-xl"
            style={{ background: 'rgba(233,195,73,0.06)', border: '1px solid rgba(233,195,73,0.14)' }}>
            <p className="text-xs">
              <span className="inline-flex items-center gap-1 font-semibold" style={{ color: GOLD }}>
                <Lightbulb size={11} /> Tip:{' '}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.55)' }}>{place.tips}</span>
            </p>
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          {place.maps_link && (
            <a href={place.maps_link} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: CYAN, color: '#020617' }}>
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
      <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <MapPin size={28} color="rgba(255,255,255,0.2)" />
        </div>
        <p className="text-lg font-medium">No places found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
          Places to Visit
        </h2>
        <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, background: 'rgba(56,189,248,0.1)', color: CYAN, border: '1px solid rgba(56,189,248,0.2)' }}>
          {places.length} Places
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {places.map((place, i) => <PlaceCard key={i} place={place} />)}
      </div>
    </div>
  );
}
