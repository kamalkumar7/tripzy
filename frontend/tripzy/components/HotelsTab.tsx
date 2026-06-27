'use client';

import { useState } from 'react';
import type { Hotel } from '@/lib/api';

interface HotelsTabProps {
  hotels: Hotel[];
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

function HotelCard({ hotel }: { hotel: Hotel }) {
  const [imgError, setImgError] = useState(false);

  const categoryColors: Record<string, string> = {
    Budget: '#6b7280',
    '3-Star': '#4f6073',
    '4-Star': '#a88c69',
    '5-Star': '#e9c349',
    Boutique: '#8192a7',
  };
  const catColor = categoryColors[hotel.category] || '#74777d';

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ height: '200px' }}>
        <img
          src={imgError
            ? `https://picsum.photos/seed/${encodeURIComponent(hotel.name)}/800/400`
            : hotel.image_url || `https://source.unsplash.com/800x400/?hotel,luxury`}
          alt={hotel.name}
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
            style={{ background: catColor, color: 'white' }}
          >
            {hotel.category}
          </span>
        </div>
        {/* Price badge */}
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full"
          style={{
            backdropFilter: 'blur(12px)',
            background: 'rgba(4,22,39,0.7)',
            color: 'white',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          {hotel.price_per_night} / night
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="text-lg font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--text-primary)' }}
          >
            {hotel.name}
          </h3>
          <StarRating rating={hotel.rating} />
        </div>

        <p className="text-sm flex items-center gap-1.5 mb-3" style={{ color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {hotel.location}
        </p>

        <p className="text-sm leading-5 mb-4" style={{ color: 'var(--text-secondary)' }}>
          {hotel.description}
        </p>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities.slice(0, 5).map((a) => (
              <span key={a} className="tag text-[11px]">{a}</span>
            ))}
            {hotel.amenities.length > 5 && (
              <span className="tag text-[11px]">+{hotel.amenities.length - 5} more</span>
            )}
          </div>
        )}

        <div
          className="mt-auto pt-4 space-y-2"
          style={{ borderTop: '1px solid var(--outline)' }}
        >
          {/* Room type */}
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--text-muted)' }}>Room Type</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{hotel.room_type}</span>
          </div>
          {/* Total estimated */}
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total (Est.)</span>
            <span
              className="font-bold"
              style={{ color: 'var(--primary)', fontFamily: 'var(--font-playfair), serif' }}
            >
              {hotel.total_estimated}
            </span>
          </div>
          {/* Proximity */}
          {hotel.proximity && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              📍 {hotel.proximity}
            </p>
          )}
        </div>

        {/* Booking tip */}
        {hotel.booking_tip && (
          <div
            className="mt-3 p-3 rounded-xl text-xs"
            style={{ background: 'rgba(233,195,73,0.08)', border: '1px solid rgba(233,195,73,0.2)' }}
          >
            <p className="font-semibold mb-0.5" style={{ color: 'var(--gold-dark)' }}>💡 Booking Tip</p>
            <p style={{ color: 'var(--text-secondary)' }}>{hotel.booking_tip}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {hotel.maps_link && (
            <a
              href={hotel.maps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-95"
              style={{
                background: '#041627',
                color: 'white',
              }}
            >
              View on Map
            </a>
          )}
          {hotel.source_url && hotel.source_url !== 'N/A' && (
            <a
              href={hotel.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                border: '1px solid var(--outline)',
                color: 'var(--text-primary)',
              }}
            >
              Learn More
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HotelsTab({ hotels }: HotelsTabProps) {
  if (!hotels || hotels.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-4xl mb-4">🏨</p>
        <p className="text-lg font-medium">No hotels found</p>
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
          Where to Stay
        </h2>
        <span className="tag">{hotels.length} Options</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {hotels.map((hotel, i) => (
          <HotelCard key={i} hotel={hotel} />
        ))}
      </div>
    </div>
  );
}
