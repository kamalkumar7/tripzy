'use client';

import { useState } from 'react';
import type { Hotel } from '@/lib/api';
import { Star, MapPin, Wifi, Car, Dumbbell, Waves, UtensilsCrossed, Wind, ExternalLink, Navigation } from 'lucide-react';

interface HotelsTabProps {
  hotels: Hotel[];
}

const CYAN = '#38bdf8';
const GOLD = '#e9c349';

const amenityIcons: Record<string, React.ElementType> = {
  'WiFi':         Wifi,
  'Parking':      Car,
  'Gym':          Dumbbell,
  'Pool':         Waves,
  'Restaurant':   UtensilsCrossed,
  'AC':           Wind,
  'Air Conditioning': Wind,
};

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

const categoryColors: Record<string, string> = {
  Budget:    '#6b7280',
  '3-Star':  '#4f6073',
  '4-Star':  '#a78bfa',
  '5-Star':  GOLD,
  Boutique:  CYAN,
};

function HotelCard({ hotel }: { hotel: Hotel }) {
  const [imgError, setImgError] = useState(false);
  const catColor = categoryColors[hotel.category] || '#74777d';

  const glassCard: React.CSSProperties = {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    background: 'rgba(15,23,42,0.70)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1.125rem',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease',
  };

  return (
    <div
      style={glassCard}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(56,189,248,0.25)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '200px' }}>
        <img
          src={imgError
            ? `https://picsum.photos/seed/${encodeURIComponent(hotel.name)}/800/400`
            : hotel.image_url || `https://source.unsplash.com/800x400/?hotel,luxury`}
          alt={hotel.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          style={{ transition: 'transform 0.5s ease' }}
          onMouseEnter={e => ((e.target as HTMLElement).style.transform = 'scale(1.05)')}
          onMouseLeave={e => ((e.target as HTMLElement).style.transform = 'scale(1)')}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.8) 0%, transparent 50%)' }} />
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full" style={{
            background: catColor + '22', color: catColor,
            border: `1px solid ${catColor}44`,
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
          }}>
            {hotel.category}
          </span>
        </div>
        <div className="absolute top-3 right-3 px-3 py-1 rounded-full"
          style={{ backdropFilter: 'blur(12px)', background: 'rgba(2,6,23,0.75)', color: '#f1f5f9', fontSize: '13px', fontWeight: 700 }}>
          {hotel.price_per_night} / night
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-base font-semibold leading-tight" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
            {hotel.name}
          </h3>
          <StarRating rating={hotel.rating} />
        </div>

        <p className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <MapPin size={11} /> {hotel.location}
        </p>

        <p className="text-sm leading-5 mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {hotel.description}
        </p>

        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities.slice(0, 5).map((a) => {
              const IconComp = amenityIcons[a];
              return (
                <span key={a} className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>
                  {IconComp ? <IconComp size={10} /> : null}
                  {a}
                </span>
              );
            })}
            {hotel.amenities.length > 5 && (
              <span className="px-2.5 py-1 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', fontSize: '11px', color: 'rgba(255,255,255,0.35)', border: '1px solid rgba(255,255,255,0.06)' }}>
                +{hotel.amenities.length - 5} more
              </span>
            )}
          </div>
        )}

        <div className="mt-auto pt-4 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between text-sm">
            <span style={{ color: 'rgba(255,255,255,0.4)' }}>Room Type</span>
            <span className="font-medium" style={{ color: '#f1f5f9' }}>{hotel.room_type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Total (Est.)</span>
            <span className="font-bold" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>{hotel.total_estimated}</span>
          </div>
          {hotel.proximity && (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} />{hotel.proximity}
            </p>
          )}
        </div>

        {hotel.booking_tip && (
          <div className="mt-3 p-3 rounded-xl text-xs"
            style={{ background: 'rgba(233,195,73,0.06)', border: '1px solid rgba(233,195,73,0.15)' }}>
            <p className="font-semibold mb-0.5" style={{ color: GOLD }}>Booking Tip</p>
            <p style={{ color: 'rgba(255,255,255,0.55)' }}>{hotel.booking_tip}</p>
          </div>
        )}

        <div className="flex gap-2 mt-4">
          {hotel.maps_link && (
            <a href={hotel.maps_link} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: CYAN, color: '#020617' }}>
              <Navigation size={13} /> View on Map
            </a>
          )}
          {hotel.source_url && hotel.source_url !== 'N/A' && (
            <a href={hotel.source_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:border-white/20"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
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
      <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <span style={{ fontSize: '28px' }}>🏨</span>
        </div>
        <p className="text-lg font-medium">No hotels found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
          Where to Stay
        </h2>
        <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, background: 'rgba(56,189,248,0.1)', color: CYAN, border: '1px solid rgba(56,189,248,0.2)' }}>
          {hotels.length} Options
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {hotels.map((hotel, i) => <HotelCard key={i} hotel={hotel} />)}
      </div>
    </div>
  );
}
