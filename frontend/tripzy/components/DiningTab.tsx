'use client';

import { useState } from 'react';
import type { Restaurant } from '@/lib/api';
import { Star, MapPin, Utensils, Navigation, ExternalLink, Lightbulb, Users, Heart, Coffee, Sparkles } from 'lucide-react';

interface DiningTabProps {
  restaurants: Restaurant[];
}

const budgetConfig: Record<string, { bg: string; color: string; label: string }> = {
  Budget:        { bg: 'var(--surface-mid)',  color: 'var(--text-primary)', label: 'Budget'      },
  'Mid-range':   { bg: 'var(--surface-mid)',  color: 'var(--text-primary)', label: 'Mid-range'   },
  'Fine Dining': { bg: 'var(--surface-mid)',  color: 'var(--text-primary)', label: 'Fine Dining' },
};

const atmosphereIconMap: Record<string, React.ElementType> = {
  casual:            Coffee,
  romantic:          Heart,
  'family-friendly': Users,
  upscale:           Sparkles,
  traditional:       Utensils,
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={12}
          fill={s <= Math.round(rating) ? (rating >= 4.0 ? 'var(--success)' : 'var(--gold)') : 'none'}
          color={s <= Math.round(rating) ? (rating >= 4.0 ? 'var(--success)' : 'var(--gold)') : 'var(--outline)'}
          strokeWidth={1.5}
        />
      ))}
      <span className="text-xs font-semibold ml-1" style={{ color: 'var(--text-muted)' }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const [imgError, setImgError] = useState(false);
  const budget = budgetConfig[restaurant.budget_level] || { bg: 'var(--surface-mid)', color: 'var(--text-muted)', label: restaurant.budget_level };
  const AtmIcon = atmosphereIconMap[restaurant.atmosphere?.toLowerCase()] || Utensils;

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '190px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgError
            ? `https://picsum.photos/seed/${encodeURIComponent(restaurant.name)}/800/400`
            : restaurant.image_url || `https://source.unsplash.com/800x400/?${encodeURIComponent(restaurant.cuisine || 'food')},restaurant`}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(4,22,39,0.82) 0%, transparent 55%)' }} />

        {/* Budget badge */}
        <div className="absolute top-3 left-3">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full label-caps"
            style={{
              background: budget.bg, color: budget.color,
              border: `1px solid ${budget.color}30`,
              fontSize: '10px',
              backdropFilter: 'blur(8px)',
            }}>
            {budget.label}
          </span>
        </div>

        {/* Reservation needed badge */}
        {restaurant.reservation_needed && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full"
            style={{ background: 'var(--color-primary)', color: 'white', backdropFilter: 'blur(8px)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Book Ahead
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
            {restaurant.name}
          </h3>
          <StarRating rating={restaurant.rating} />
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{restaurant.cuisine}</span>
          <span style={{ color: 'var(--outline)' }}>•</span>
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <AtmIcon size={11} /> {restaurant.atmosphere}
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
          <MapPin size={11} /> {restaurant.location}
        </p>

        <p className="text-sm leading-5 mb-4" style={{ color: 'var(--text-secondary)' }}>
          {restaurant.description}
        </p>

        {/* Specialties */}
        {restaurant.specialties && restaurant.specialties.length > 0 && (
          <div className="mb-4">
            <p className="label-caps mb-2" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
              Must Try
            </p>
            <div className="flex flex-wrap gap-1.5">
              {restaurant.specialties.map((dish, i) => (
                <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{ background: 'var(--surface-low)', color: 'var(--text-primary)', border: '1px solid var(--outline)' }}>
                  <Utensils size={9} />
                  {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Details footer */}
        <div className="mt-auto pt-3 space-y-2" style={{ borderTop: '1px solid var(--outline)' }}>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg. Cost / Person</span>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
              {restaurant.avg_cost_per_person}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Best For</span>
            <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-primary)' }}>
              {restaurant.best_time}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          {restaurant.maps_link && (
            <a href={restaurant.maps_link} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
              style={{ background: 'var(--color-primary)', color: '#ffffff' }}>
              <Navigation size={13} /> Directions
            </a>
          )}
          {restaurant.source_url && restaurant.source_url !== 'N/A' && (
            <a href={restaurant.source_url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ border: '1px solid var(--outline)', color: 'var(--text-secondary)' }}>
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
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}>
          <Utensils size={28} style={{ color: 'var(--outline)' }} />
        </div>
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No restaurants found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Dining Guide
        </h2>
        <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600, background: 'rgba(4,22,39,0.07)', color: 'var(--primary)', border: '1px solid var(--outline)' }}>
          {restaurants.length} Restaurants
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {restaurants.map((r, i) => <RestaurantCard key={i} restaurant={r} />)}
      </div>
    </div>
  );
}
