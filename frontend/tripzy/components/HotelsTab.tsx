'use client';

import { useState } from 'react';
import type { Hotel } from '@/lib/api';
import { Star, MapPin, Wifi, Car, Dumbbell, Waves, UtensilsCrossed, Wind, ExternalLink, Navigation } from 'lucide-react';

interface HotelsTabProps {
  hotels: Hotel[];
}

const amenityIcons: Record<string, React.ElementType> = {
  'WiFi':             Wifi,
  'Parking':          Car,
  'Gym':              Dumbbell,
  'Pool':             Waves,
  'Restaurant':       UtensilsCrossed,
  'AC':               Wind,
  'Air Conditioning': Wind,
};

const categoryColors: Record<string, string> = {
  Budget:   '#6b7280',
  '3-Star': '#4f6073',
  '4-Star': '#a78bfa',
  '5-Star': '#e9c349',
  Boutique: '#38bdf8',
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

function HotelCard({ hotel }: { hotel: Hotel }) {
  const [imgError, setImgError] = useState(false);
  const catColor = categoryColors[hotel.category] || 'var(--text-muted)';

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgError
            ? `https://picsum.photos/seed/${encodeURIComponent(hotel.name)}/800/400`
            : hotel.image_url || `https://source.unsplash.com/800x400/?hotel,luxury`}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,22,39,0.82) 0%, transparent 55%)' }} />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full label-caps" style={{
            background: catColor + '22', color: catColor,
            border: `1px solid ${catColor}44`,
            fontSize: '10px',
            backdropFilter: 'blur(8px)',
          }}>
            {hotel.category}
          </span>
        </div>

        {/* Price badge */}
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full"
          style={{ backdropFilter: 'blur(12px)', background: 'rgba(4,22,39,0.72)', color: '#ffffff', fontSize: '13px', fontWeight: 700 }}>
          {hotel.price_per_night} / night
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold leading-tight" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
            {hotel.name}
          </h3>
          <StarRating rating={hotel.rating} />
        </div>

        <p className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          <MapPin size={11} /> {hotel.location}
        </p>

        <p className="text-sm leading-5 mb-4" style={{ color: 'var(--text-secondary)' }}>
          {hotel.description}
        </p>

        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities.slice(0, 5).map((a) => {
              const IconComp = amenityIcons[a];
              return (
                <span key={a} className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ background: 'var(--surface-mid)', border: '1px solid var(--outline)', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {IconComp ? <IconComp size={10} /> : null}
                  {a}
                </span>
              );
            })}
            {hotel.amenities.length > 5 && (
              <span className="px-2.5 py-1 rounded-full" style={{ background: 'var(--surface-low)', fontSize: '11px', color: 'var(--text-muted)', border: '1px solid var(--outline)' }}>
                +{hotel.amenities.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Details */}
        <div className="mt-auto pt-4 space-y-2" style={{ borderTop: '1px solid var(--outline)' }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'var(--text-muted)' }}>Room Type</span>
            <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{hotel.room_type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Total (Est.)</span>
            <span className="font-bold" style={{ color: 'var(--gold)', fontFamily: 'Playfair Display, serif' }}>{hotel.total_estimated}</span>
          </div>
          {hotel.proximity && (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              <MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />{hotel.proximity}
            </p>
          )}
        </div>

        {/* Booking tip */}
        {hotel.booking_tip && (
          <div className="mt-3 p-3 rounded-xl text-xs"
            style={{ background: 'rgba(233,195,73,0.08)', border: '1px solid rgba(233,195,73,0.2)' }}>
            <p className="font-semibold mb-0.5" style={{ color: 'var(--gold)' }}>Booking Tip</p>
            <p style={{ color: 'var(--text-secondary)' }}>{hotel.booking_tip}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {hotel.maps_link && (
            <a href={hotel.maps_link} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: '#041627', color: '#e9c349' }}>
              <Navigation size={13} /> View on Map
            </a>
          )}
          {hotel.source_url && hotel.source_url !== 'N/A' && (
            <a href={hotel.source_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ border: '1px solid var(--outline)', color: 'var(--text-secondary)' }}>
              <ExternalLink size={13} /> Learn More
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
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}>
          <span style={{ fontSize: '28px' }}>🏨</span>
        </div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No hotels found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Playfair Display, serif', color: 'var(--text-primary)' }}>
          Where to Stay
        </h2>
        <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, background: 'rgba(4,22,39,0.07)', color: 'var(--primary)', border: '1px solid var(--outline)' }}>
          {hotels.length} Options
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {hotels.map((hotel, i) => <HotelCard key={i} hotel={hotel} />)}
      </div>
    </div>
  );
}
