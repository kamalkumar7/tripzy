'use client';

import { useState } from 'react';
import type { TravelDetails } from '@/lib/api';

interface HeroSectionProps {
  travelDetails: TravelDetails;
}

export default function HeroSection({ travelDetails }: HeroSectionProps) {
  const { destination, duration, travel_type, overview } = travelDetails;

  // Use a reliable Unsplash URL for destination images
  const cityName = destination.split(',')[0].trim();
  const [imgSrc, setImgSrc] = useState(
    `https://source.unsplash.com/1600x900/?${encodeURIComponent(cityName)},cityscape,travel`
  );

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '500px', minHeight: '360px' }}>
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={imgSrc}
          alt={`${destination} travel destination`}
          className="w-full h-full object-cover"
          onError={() =>
            setImgSrc(`https://picsum.photos/seed/${encodeURIComponent(cityName)}/1600/900`)
          }
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(4,22,39,0.92) 0%, rgba(4,22,39,0.45) 40%, rgba(4,22,39,0.15) 100%)',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-10 px-4 text-center">
        {/* Travel type badge */}
        <div
          className="mb-4 px-4 py-1.5 rounded-full label-caps inline-flex items-center gap-2"
          style={{
            background: 'rgba(233,195,73,0.2)',
            border: '1px solid rgba(233,195,73,0.4)',
            color: 'var(--gold)',
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          {travel_type} Trip
        </div>

        {/* Destination name */}
        <h1
          className="text-5xl md:text-7xl font-bold text-white mb-4 drop-shadow-xl"
          style={{ fontFamily: 'var(--font-playfair), serif', letterSpacing: '-0.02em' }}
        >
          {destination}
        </h1>

        {/* Overview pill */}
        <p
          className="max-w-2xl text-base md:text-lg leading-relaxed text-center px-6 py-4 rounded-2xl"
          style={{
            color: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {overview}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 mt-4">
          <span className="label-caps" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {duration} {duration === 1 ? 'Day' : 'Days'}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>•</span>
          <span className="label-caps" style={{ color: 'rgba(255,255,255,0.55)' }}>
            {cityName}
          </span>
        </div>
      </div>
    </section>
  );
}
