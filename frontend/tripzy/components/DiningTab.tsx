'use client';

import { useState } from 'react';
import type { Restaurant } from '@/lib/api';

interface DiningTabProps {
  restaurants: Restaurant[];
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

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
  const [imgError, setImgError] = useState(false);

  const budgetColors: Record<string, { bg: string; text: string }> = {
    Budget: { bg: '#e6f4ea', text: '#137333' },
    'Mid-range': { bg: 'rgba(233,195,73,0.12)', text: '#735c00' },
    'Fine Dining': { bg: 'rgba(168,140,105,0.12)', text: '#584326' },
  };
  const budgetStyle = budgetColors[restaurant.budget_level] || { bg: 'var(--surface-mid)', text: 'var(--text-secondary)' };

  const atmosphereIcons: Record<string, string> = {
    casual: '🪑',
    romantic: '🕯️',
    'family-friendly': '👨‍👩‍👧',
    upscale: '✨',
    traditional: '🏮',
  };
  const atmosphereIcon = atmosphereIcons[restaurant.atmosphere?.toLowerCase()] || '🍴';

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ height: '190px' }}>
        <img
          src={imgError
            ? `https://picsum.photos/seed/${encodeURIComponent(restaurant.name)}/800/400`
            : restaurant.image_url || `https://source.unsplash.com/800x400/?${encodeURIComponent(restaurant.cuisine || 'food')},restaurant`}
          alt={restaurant.name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
          style={{ transition: 'transform 0.4s ease' }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.transform = 'scale(1.04)')}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
        />
        {/* Budget badge */}
        <div className="absolute top-3 left-3">
          <span
            className="px-2.5 py-1 rounded-full label-caps text-[10px]"
            style={{ background: budgetStyle.bg, color: budgetStyle.text, border: `1px solid ${budgetStyle.text}30` }}
          >
            {restaurant.budget_level}
          </span>
        </div>
        {/* Reservation badge */}
        {restaurant.reservation_needed && (
          <div
            className="absolute top-3 right-3 px-2.5 py-1 rounded-full label-caps text-[10px]"
            style={{ background: 'rgba(186,26,26,0.85)', color: 'white', backdropFilter: 'blur(8px)' }}
          >
            Book Ahead
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3
            className="text-lg font-semibold leading-tight"
            style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--text-primary)' }}
          >
            {restaurant.name}
          </h3>
          <StarRating rating={restaurant.rating} />
        </div>

        {/* Cuisine & atmosphere */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-sm font-medium" style={{ color: 'var(--gold-dark)' }}>
            {restaurant.cuisine}
          </span>
          <span style={{ color: 'var(--outline)' }}>•</span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {atmosphereIcon} {restaurant.atmosphere}
          </span>
        </div>

        <p className="text-sm flex items-center gap-1.5 mb-3" style={{ color: 'var(--text-muted)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5 flex-shrink-0">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {restaurant.location}
        </p>

        <p className="text-sm leading-5 mb-4" style={{ color: 'var(--text-secondary)' }}>
          {restaurant.description}
        </p>

        {/* Specialties */}
        {restaurant.specialties && restaurant.specialties.length > 0 && (
          <div className="mb-4">
            <p className="label-caps mb-2" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Must Try</p>
            <div className="flex flex-wrap gap-1.5">
              {restaurant.specialties.map((dish, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: 'rgba(233,195,73,0.1)',
                    color: 'var(--gold-dark)',
                    border: '1px solid rgba(233,195,73,0.25)',
                  }}
                >
                  🍴 {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meta */}
        <div
          className="mt-auto pt-3 space-y-2"
          style={{ borderTop: '1px solid var(--outline)' }}
        >
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Avg. Cost / Person</span>
            <span className="font-bold" style={{ color: 'var(--primary)', fontFamily: 'var(--font-playfair), serif' }}>
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

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {restaurant.maps_link && (
            <a
              href={restaurant.maps_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: '#041627', color: 'white' }}
            >
              📍 Directions
            </a>
          )}
          {restaurant.source_url && restaurant.source_url !== 'N/A' && (
            <a
              href={restaurant.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold"
              style={{ border: '1px solid var(--outline)', color: 'var(--text-primary)' }}
            >
              Reviews
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
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <p className="text-4xl mb-4">🍽️</p>
        <p className="text-lg font-medium">No restaurants found</p>
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
          Dining Guide
        </h2>
        <span className="tag">{restaurants.length} Restaurants</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {restaurants.map((r, i) => (
          <RestaurantCard key={i} restaurant={r} />
        ))}
      </div>
    </div>
  );
}
