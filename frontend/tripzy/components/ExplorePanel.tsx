'use client';

import { useState } from 'react';
import { Compass, Sparkles, MapPin, Calendar, DollarSign, ArrowRight, Zap, Flame, Globe, Umbrella, Landmark, Mountain, Utensils, Gem, Backpack } from 'lucide-react';

interface ExplorePanelProps {
  onSelectPrompt: (prompt: string) => void;
}

interface DestinationCardData {
  id: string;
  name: string;
  country: string;
  category: 'Tropical' | 'Culture' | 'Adventure' | 'Luxury' | 'Foodie';
  image: string;
  vibe: string;
  bestSeason: string;
  estCostPerDay: string;
  highlights: string[];
  description: string;
  suggestedPrompt: string;
}

const DESTINATIONS: DestinationCardData[] = [
  {
    id: 'kyoto-japan',
    name: 'Kyoto',
    country: 'Japan',
    category: 'Culture',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
    vibe: '⛩️ Historic & Serene',
    bestSeason: 'Spring & Autumn',
    estCostPerDay: '$180 - $250',
    highlights: ['Arashiyama Bamboo Grove', 'Fushimi Inari Shrine', 'Gion Kaiseki Dining'],
    description: 'Immerse yourself in ancient temples, traditional tea ceremonies, and serene bamboo forests.',
    suggestedPrompt: 'Plan a 6-day cultural trip to Kyoto, Japan focusing on historic temples, tea ceremonies, and kaiseki dining for 2 people with a mid-range budget.',
  },
  {
    id: 'amalfi-italy',
    name: 'Amalfi Coast',
    country: 'Italy',
    category: 'Luxury',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
    vibe: '🌊 Cliffside Luxury',
    bestSeason: 'May - September',
    estCostPerDay: '$350 - $500',
    highlights: ['Positano Panoramic Views', 'Capri Boat Tour', 'Limoncello Tastings'],
    description: 'Dramatic cliffs, pastel villages, azure Mediterranean waters, and world-class seafood.',
    suggestedPrompt: 'Plan a 5-day luxury vacation to Amalfi Coast, Italy with scenic cliffside stays, private Capri boat tours, and fine dining for 2 travelers.',
  },
  {
    id: 'reykjavik-iceland',
    name: 'Reykjavík & South Coast',
    country: 'Iceland',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80',
    vibe: '🌋 Volcanic Wilderness',
    bestSeason: 'September - March (Aurora)',
    estCostPerDay: '$220 - $320',
    highlights: ['Blue Lagoon Hot Springs', 'Golden Circle Geysers', 'Northern Lights Hunt'],
    description: 'Geysers, waterfalls, glaciers, volcanic black beaches, and enchanting Aurora Borealis.',
    suggestedPrompt: 'Plan a 7-day Iceland South Coast road trip for 2 people focusing on waterfalls, Blue Lagoon, glaciers, and Northern Lights viewing.',
  },
  {
    id: 'bali-indonesia',
    name: 'Ubud & Canggu',
    country: 'Bali, Indonesia',
    category: 'Tropical',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    vibe: '🌴 Wellness & Beach',
    bestSeason: 'April - October',
    estCostPerDay: '$80 - $150',
    highlights: ['Tegallalang Rice Terraces', 'Beach Club Sunsets', 'Yoga & Spa Retreats'],
    description: 'Lush green rice terraces, spiritual wellness sanctuaries, surfing, and vibrant beach clubs.',
    suggestedPrompt: 'Plan a 7-day tropical trip to Bali, Indonesia split between Ubud rice terraces and Canggu beach clubs for 2 people on a moderate budget.',
  },
  {
    id: 'penang-malaysia',
    name: 'Penang',
    country: 'Malaysia',
    category: 'Foodie',
    image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=800&q=80',
    vibe: '🍜 Street Food Capital',
    bestSeason: 'November - February',
    estCostPerDay: '$60 - $110',
    highlights: ['Gurney Drive Hawker Centre', 'George Town Street Art', 'Kek Lok Si Temple'],
    description: 'A culinary UNESCO heritage city blending Malay, Chinese, and Indian flavors with rich colonial streetscapes.',
    suggestedPrompt: 'Plan a 4-day foodie and cultural exploration in Penang, Malaysia focusing on famous street hawker stalls, George Town heritage, and night markets.',
  },
  {
    id: 'zermatt-switzerland',
    name: 'Zermatt & Matterhorn',
    country: 'Switzerland',
    category: 'Adventure',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80',
    vibe: '🏔️ Alpine Elegance',
    bestSeason: 'December - April (Skiing)',
    estCostPerDay: '$380 - $600',
    highlights: ['Gornergrat Alpine Railway', 'Matterhorn Skiing', 'Fondue Dining in Chalets'],
    description: 'Car-free mountain village sitting below the iconic Matterhorn, offering epic alpine sports and luxury chalets.',
    suggestedPrompt: 'Plan a 5-day luxury alpine winter vacation in Zermatt, Switzerland with skiing, Gornergrat train views, and chalet fondue experiences.',
  },
];

const PROMPT_IDEAS = [
  {
    title: '🎒 7-Day Japan Golden Route',
    prompt: 'Plan a 7-day fast-paced trip covering Tokyo, Kyoto, and Osaka with bullet train connections and top sights for 2 travelers.',
    tag: 'Popular',
  },
  {
    title: '🍷 4-Day Tuscan Wine & Chill',
    prompt: 'Plan a 4-day relaxing getaway in Tuscany, Italy with villa stays, vineyard wine tours, and cooking classes for couples.',
    tag: 'Romantic',
  },
  {
    title: '🏝️ 5-Day Maldives Water Villa Escape',
    prompt: 'Plan a 5-day all-inclusive luxury honeymoon trip to a Maldives overwater resort with snorkeling and private beach dining.',
    tag: 'Luxury',
  },
  {
    title: '🌶️ 6-Day Thailand Island & Street Food Trail',
    prompt: 'Plan a 6-day itinerary for Bangkok and Phuket featuring street food tours, night markets, and island hopping for 2 friends on a budget.',
    tag: 'Budget Foodie',
  },
];

const VIBES = ['All', 'Tropical', 'Culture', 'Adventure', 'Luxury', 'Foodie'] as const;

export default function ExplorePanel({ onSelectPrompt }: ExplorePanelProps) {
  const [selectedVibe, setSelectedVibe] = useState<typeof VIBES[number]>('All');

  // AI Concierge Generator state
  const [mood, setMood] = useState('Tropical Beach');
  const [durationDays, setDurationDays] = useState(5);
  const [budgetTier, setBudgetTier] = useState('Moderate');

  const filteredDestinations = selectedVibe === 'All'
    ? DESTINATIONS
    : DESTINATIONS.filter(d => d.category === selectedVibe);

  const handleConciergeGenerate = () => {
    const conciergePrompt = `Plan a ${durationDays}-day ${mood.toLowerCase()} trip for 2 people with a ${budgetTier.toLowerCase()} budget. Recommend iconic highlights, top local food, hotel options, and a day-by-day plan.`;
    onSelectPrompt(conciergePrompt);
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-4 md:px-8 py-8"
      style={{ background: 'var(--background)' }}
    >
      {/* ── Header Banner ─────────────────────────────── */}
      <div
        className="max-w-6xl mx-auto mb-10 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 rounded-3xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--outline)',
        }}
      >
        <div>
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1 mb-3 label-caps"
            style={{
              background: 'var(--surface-mid)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--outline)',
              borderRadius: 'var(--radius-full)',
            }}
          >
            <Compass size={13} />
            <span>AI Travel Inspiration</span>
          </div>

          <h1
            className="text-3xl md:text-4xl font-extrabold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Explore Destinations
          </h1>
          <p
            className="text-sm md:text-base max-w-xl"
            style={{ color: 'var(--text-muted)' }}
          >
            Browse AI-curated journeys or let our intelligent AI Concierge assemble your next bespoke itinerary in seconds.
          </p>
        </div>

        <div className="flex-shrink-0 flex items-center gap-3">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-full"
            style={{ background: 'rgba(255, 56, 92, 0.1)', color: 'var(--primary)' }}
          >
            <Sparkles size={24} />
          </div>
        </div>
      </div>

      {/* ── AI Concierge Widget ────────────────────────── */}
      <div
        className="max-w-6xl mx-auto mb-12 p-6 card"
        style={{ borderRadius: 'var(--radius-xl)' }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} style={{ color: 'var(--primary)' }} />
          <h2
            className="text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            AI Concierge: Custom Trip Generator
          </h2>
        </div>
        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          Configure your preferences below and let the AI agent craft a custom itinerary tailored specifically for you.
        </p>

        <div className="space-y-8 mb-8">
          {/* Mood Selector */}
          <div>
            <label className="block label-caps mb-3" style={{ color: 'var(--text-muted)' }}>
              Travel Vibe
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-1 rounded-xl" style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}>
              {[
                { label: 'Tropical Beach', icon: Umbrella },
                { label: 'Cultural & Historical', icon: Landmark },
                { label: 'Alpine Mountain Adventure', icon: Mountain },
                { label: 'Foodie Street Cuisine', icon: Utensils },
                { label: 'High-End Luxury', icon: Gem },
                { label: 'Backpacking Budget', icon: Backpack }
              ].map(v => (
                <button
                  key={v.label}
                  type="button"
                  onClick={(e) => { e.preventDefault(); setMood(v.label); }}
                  className="py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: mood === v.label ? 'var(--surface)' : 'transparent',
                    color: mood === v.label ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: mood === v.label ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <v.icon size={16} className={mood === v.label ? 'text-[var(--primary)]' : ''} />
                  <span className="truncate">{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Duration Selector */}
            <div>
              <label className="block label-caps mb-3" style={{ color: 'var(--text-muted)' }}>
                Duration (Days)
              </label>
              <div className="flex p-1 rounded-xl" style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}>
                {[
                  { val: 3, label: '3 Days' },
                  { val: 5, label: '5 Days' },
                  { val: 7, label: '7 Days' },
                  { val: 10, label: '10+ Days' }
                ].map(d => (
                  <button
                    key={d.val}
                    type="button"
                    onClick={(e) => { e.preventDefault(); setDurationDays(d.val); }}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: durationDays === d.val ? 'var(--surface)' : 'transparent',
                      color: durationDays === d.val ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: durationDays === d.val ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget Tier */}
            <div>
              <label className="block label-caps mb-3" style={{ color: 'var(--text-muted)' }}>
                Budget Style
              </label>
              <div className="flex p-1 rounded-xl" style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}>
                {[
                  { val: 'Budget-Friendly', label: 'Budget' },
                  { val: 'Moderate', label: 'Moderate' },
                  { val: 'Luxury', label: 'Luxury' }
                ].map(b => (
                  <button
                    key={b.val}
                    type="button"
                    onClick={(e) => { e.preventDefault(); setBudgetTier(b.val); }}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: budgetTier === b.val ? 'var(--surface)' : 'transparent',
                      color: budgetTier === b.val ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: budgetTier === b.val ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleConciergeGenerate}
          className="w-full font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{
            background: 'var(--primary)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            height: '48px'
          }}
        >
          <Sparkles size={16} />
          <span>Ask AI Agent to Generate My Itinerary</span>
        </button>
      </div>

      {/* ── Trending Prompt Ideas ─────────────────────── */}
      <div className="max-w-6xl mx-auto mb-12">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={18} style={{ color: 'var(--primary)' }} />
          <h2
            className="text-xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Trending AI Ideas
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROMPT_IDEAS.map((idea, idx) => (
            <div
              key={idx}
              onClick={() => onSelectPrompt(idea.prompt)}
              className="group p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between card"
            >
              <div>
                {/* Tag badge */}
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full label-caps mb-3"
                  style={{
                    background: 'rgba(4,22,39,0.07)',
                    color: 'var(--primary)',
                    border: '1px solid var(--outline)',
                    fontSize: '10px',
                  }}
                >
                  {idea.tag}
                </span>
                <h3 className="font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                  {idea.title}
                </h3>
                <p className="text-xs line-clamp-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  &ldquo;{idea.prompt}&rdquo;
                </p>
              </div>

              <div
                className="mt-4 pt-3 flex items-center justify-between text-xs font-bold"
                style={{ borderTop: '1px solid var(--outline)', color: 'var(--primary)' }}
              >
                <span>Build with AI</span>
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Curated Worldwide Destinations ───────────── */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Globe size={18} style={{ color: 'var(--primary)' }} />
            <h2
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
            >
              Curated Worldwide Destinations
            </h2>
          </div>

          {/* Vibe Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {VIBES.map(vibe => (
              <button
                key={vibe}
                onClick={() => setSelectedVibe(vibe)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200"
                style={{
                  background: selectedVibe === vibe ? 'var(--primary)' : 'transparent',
                  color: selectedVibe === vibe ? '#FFFFFF' : 'var(--text-muted)',
                  border: `1px solid ${selectedVibe === vibe ? 'var(--primary)' : 'var(--outline)'}`,
                }}
              >
                {vibe}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map(dest => (
            <div
              key={dest.id}
              className="group flex flex-col transition-all duration-200 card cursor-pointer"
              onClick={() => onSelectPrompt(dest.suggestedPrompt)}
              style={{ padding: '0' }}
            >
              {/* Image Banner */}
              <div className="relative aspect-[4/3] overflow-hidden" style={{ borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: 'linear-gradient(to top, rgba(15,15,15,0.88) 0%, transparent 60%)' }}
                />

                {/* Vibe badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: 'rgba(15,15,15,0.72)',
                      color: '#ffffff',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    {dest.vibe}
                  </span>
                </div>

                {/* Destination name overlay */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span
                    className="label-caps"
                    style={{ color: '#EBEBEB', letterSpacing: '0.12em', fontSize: '10px' }}
                  >
                    {dest.country}
                  </span>
                  <h3
                    className="text-2xl font-bold tracking-tight"
                  >
                    {dest.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col flex-1 justify-between gap-4">
                <div>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    {dest.description}
                  </p>

                  {/* Meta pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs mb-4">
                    <span
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                      style={{
                        background: 'var(--surface-mid)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--outline)',
                      }}
                    >
                      <Calendar size={11} /> {dest.bestSeason}
                    </span>
                    <span
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(19,115,51,0.1)',
                        color: 'var(--success)',
                        border: '1px solid var(--success-border)',
                      }}
                    >
                      <DollarSign size={11} /> {dest.estCostPerDay}/day
                    </span>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1 mb-2">
                    <p
                      className="label-caps mb-1"
                      style={{ color: 'var(--text-muted)', fontSize: '10px' }}
                    >
                      Must Experience
                    </p>
                    {dest.highlights.map((h, i) => (
                      <p
                        key={i}
                        className="text-xs flex items-center gap-1.5"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        <MapPin size={11} style={{ color: 'var(--primary)' }} /> {h}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Plan CTA button */}
                <button
                  onClick={(e) => { e.stopPropagation(); onSelectPrompt(dest.suggestedPrompt); }}
                  className="w-full font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    height: '44px',
                    borderRadius: 'var(--radius-md)',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <Zap size={13} />
                  <span>Plan This Trip with AI</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
