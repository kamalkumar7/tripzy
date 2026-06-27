'use client';

import { useState } from 'react';
import type { Restaurant } from '@/lib/api';
import { Star, MapPin, Utensils, Navigation, ExternalLink, Lightbulb, Users, Heart, Coffee, Sparkles } from 'lucide-react';

interface DiningTabProps {
  restaurants: Restaurant[];
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

const budgetConfig: Record<string, { bg: string; color: string; label: string }> = {
  Budget:        { bg: 'rgba(52,211,153,0.1)',  color: '#34d399', label: 'Budget'      },
  'Mid-range':   { bg: 'rgba(233,195,73,0.1)',  color: GOLD,      label: 'Mid-range'   },
  'Fine Dining': { bg: 'rgba(167,139,250,0.1)', color: '#a78bfa', label: 'Fine Dining' },
};

const atmosphereIconMap: Record<string, React.ElementType> = {
  casual:           Coffee,
  romantic:         Heart,
  'family-friendly':Users,
  upscale:          Sparkles,
  traditional:      Utensils,
};

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const [imgError, setImgError] = useState(false);
  const budget = budgetConfig[restaurant.budget_level] || { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', label: restaurant.budget_level };
  const AtmIcon = atmosphereIconMap[restaurant.atmosphere?.toLowerCase()] || Utensils;

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
      <div className="relative overflow-hidden" style={{ height: '190px' }}>
        <img
          src={imgError
            ? `https://picsum.photos/seed/${encodeURIComponent(restaurant.name)}/800/400`
            : restaurant.image_url || `https://source.unsplash.com/800x400/?${encodeURIComponent(restaurant.cuisine || 'food')},restaurant`}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          style={{ transition: 'transform 0.5s ease' }}
          onMouseEnter={e => ((e.target as HTMLElement).style.transform = 'scale(1.05)')}
          onMouseLeave={e => ((e.target as HTMLElement).style.transform = 'scale(1)')}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.8) 0%, transparent 55%)' }} />

        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{
              background: budget.bg, color: budget.color,
              border: `1px solid ${budget.color}30`,
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              backdropFilter: 'blur(8px)',
            }}>
            {budget.label}
          </span>
        </div>

        {restaurant.reservation_needed && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(239,68,68,0.8)', color: 'white', backdropFilter: 'blur(8px)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Book Ahead
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-semibold leading-tight" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
            {restaurant.name}
          </h3>
          <StarRating rating={restaurant.rating} />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium" style={{ color: GOLD }}>{restaurant.cuisine}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            <AtmIcon size={11} /> {restaurant.atmosphere}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <MapPin size={11} /> {restaurant.location}
        </p>

        <p className="text-sm leading-5 mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
          {restaurant.description}
        </p>

        {restaurant.specialties && restaurant.specialties.length > 0 && (
          <div className="mb-4">
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Must Try
            </p>
            <div className="flex flex-wrap gap-1.5">
              {restaurant.specialties.map((dish, i) => (
                <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'rgba(233,195,73,0.08)', color: GOLD, border: '1px solid rgba(233,195,73,0.18)' }}>
                  <Utensils size={9} />
                  {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Avg. Cost / Person</span>
            <span className="font-bold" style={{ color: CYAN, fontFamily: 'Georgia, serif' }}>
              {restaurant.avg_cost_per_person}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Best For</span>
            <span className="text-sm font-medium capitalize" style={{ color: '#f1f5f9' }}>
              {restaurant.best_time}
            </span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          {restaurant.maps_link && (
            <a href={restaurant.maps_link} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: CYAN, color: '#020617' }}>
              <Navigation size={13} /> Directions
            </a>
          )}
          {restaurant.source_url && restaurant.source_url !== 'N/A' && (
            <a href={restaurant.source_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
              <ExternalLink size={13} /> Reviews
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DiningTab({ restaurants }: DiningTabProps) {
  if (!restaurants || restaurants.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Utensils size={28} color="rgba(255,255,255,0.2)" />
        </div>
        <p className="text-lg font-medium">No restaurants found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
          Dining Guide
        </h2>
        <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, background: 'rgba(56,189,248,0.1)', color: CYAN, border: '1px solid rgba(56,189,248,0.2)' }}>
          {restaurants.length} Restaurants
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {restaurants.map((r, i) => <RestaurantCard key={i} restaurant={r} />)}
      </div>
    </div>
  );
}
