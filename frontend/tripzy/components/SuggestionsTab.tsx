'use client';

import { useState } from 'react';
import type { SuggestionsData, TravelDetails, SeasonItem, ScamAlert, MustDoActivity, LocalHack } from '@/lib/api';
import {
  Shirt,
  ShieldAlert,
  Sparkles,
  Lightbulb,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  CheckSquare,
  Square,
  AlertTriangle,
  ShieldCheck,
  Clock,
  DollarSign,
  PhoneCall,
  Info,
  Compass,
  CheckCircle2,
  Lock,
  Layers,
  Sparkle,
  ChevronDown,
} from 'lucide-react';

interface SuggestionsTabProps {
  suggestions?: SuggestionsData;
  travelDetails?: TravelDetails;
}

export default function SuggestionsTab({ suggestions, travelDetails }: SuggestionsTabProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'clothing' | 'scams' | 'activities' | 'hacks'>('all');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState<number>(0);
  const [checkedEssentials, setCheckedEssentials] = useState<Record<string, boolean>>({});

  const destination = travelDetails?.destination || 'Your Destination';

  // Fallback data generator if backend suggestions are not present
  const data: SuggestionsData = suggestions?.seasonal_clothing ? suggestions : {
    seasonal_clothing: {
      climate_overview: `${destination} experiences distinct seasonal variations. Packing breathable layers and respectful attire for cultural sites will ensure comfort throughout your stay.`,
      seasons: [
        {
          season_name: 'Summer / Warm Season (May – Aug)',
          weather_summary: '28°C – 34°C • Hot, sunny & humid',
          clothing_items: [
            'Lightweight breathable linen and cotton shirts',
            'Moisture-wicking shorts and casual dresses',
            'UV protection sunglasses & wide-brim sunhat',
            'Comfortable cushioned walking shoes/sandals',
          ],
          packing_essentials: [
            'Broad-spectrum Sunscreen SPF 50+',
            'Refillable insulated water bottle',
            'Lightweight UV-protective parasol/umbrella',
            'Hydrating facial mist or electrolyte powder',
          ],
          dress_code_tips: 'Modest attire covering shoulders and knees is strictly required when visiting temples, mosques, and religious landmarks.',
        },
        {
          season_name: 'Monsoon / Wet Season (Sep – Nov)',
          weather_summary: '24°C – 30°C • Frequent tropical downpours',
          clothing_items: [
            'Quick-dry performance t-shirts and light trousers',
            'Lightweight packable waterproof rain jacket or poncho',
            'Water-resistant walking sandals or slip-on shoes',
            'Anti-humidity breathable fabrics',
          ],
          packing_essentials: [
            'Compact windproof storm umbrella',
            'Waterproof phone case / dry pouch',
            'Ziploc storage bags for electronic devices',
            'Quick-dry microfiber travel towel',
          ],
          dress_code_tips: 'Avoid floor-length trousers or sensitive leather shoes that could get damaged in sudden street puddles.',
        },
        {
          season_name: 'Winter / Dry Season (Dec – Feb)',
          weather_summary: '20°C – 28°C • Pleasant, breezy & sunny',
          clothing_items: [
            'Light cardigans, denim jackets, or cotton hoodies for evening',
            'Breathable daytime tees and chinos/trousers',
            'Comfortable sneakers for extensive city exploration',
            'Smart casual attire for evening restaurants and rooftop bars',
          ],
          packing_essentials: [
            'Light pashmina shawl or travel scarf',
            'Moisturizing lip balm and skin hydration cream',
            'Comfortable travel socks',
          ],
          dress_code_tips: 'Air conditioning in transit hubs and shopping centers is often strong; keep a light jacket on hand.',
        },
        {
          season_name: 'Spring / Shoulder Season (Mar – Apr)',
          weather_summary: '24°C – 31°C • Warm with moderate breezes',
          clothing_items: [
            'Casual polo shirts, breathable linen pants, and sundresses',
            'Comfortable walking shoes with good arch support',
            'Light travel sunglasses and sun visor',
          ],
          packing_essentials: [
            'DEET or plant-based insect repellent spray',
            'Portable power bank for day-long photo taking',
            'Blister prevention pads for city walking',
          ],
          dress_code_tips: 'Smart casual dress code applies to upscale dinner venues and rooftop lounges.',
        },
      ],
      general_dress_tips: [
        'Always carry a light sarong or scarf to cover shoulders and knees at sacred monuments.',
        'Choose slip-on footwear since shoes must be removed before entering temples and traditional homes.',
        'High humidity calls for 100% cotton or linen over synthetic polyester fabrics.',
      ],
    },
    scams_and_safety: [
      {
        title: 'Unmetered Taxi / Rigged Meter Trap',
        risk_level: 'High',
        description: 'Drivers at airport exits or tourist hubs claim their meter is broken or refuse to turn it on, later demanding 3x to 5x the legitimate fare.',
        prevention: 'Always book via official ride-hailing apps (Grab, Uber, Bolt) or buy fixed-fare coupons from the official airport transportation desk.',
        warning_signs: 'Driver says "flat rate only" or claims traffic makes meter pricing impossible.',
      },
      {
        title: '"Attraction is Closed Today" Misdirection',
        risk_level: 'Medium',
        description: 'Friendly strangers outside popular landmarks approach tourists claiming the site is closed for a national holiday or ceremony, offering to guide them to an "exclusive private market" or overpriced boat ride.',
        prevention: 'Never trust unsolicited advice outside gates. Always walk up directly to the official ticket counter to check opening hours.',
        warning_signs: 'Unsolicited friendly approach right before the attraction entrance.',
      },
      {
        title: 'Distraction Pickpocketing in Crowded Markets',
        risk_level: 'High',
        description: 'Coordinated groups create sudden distractions—like dropping coins, spilling liquid, or crowding near bus doors—while an accomplice quickly empties unsecured pockets.',
        prevention: 'Keep wallets and smartphones in front-zipped crossbody bags worn across your chest. Never keep phones in back pockets.',
        warning_signs: 'Sudden artificial jostling or multiple people crowding you closely in open spaces.',
      },
      {
        title: 'Overly Friendly Stranger / Tea House & Bar Trap',
        risk_level: 'Medium',
        description: 'Friendly locals (often posing as students wanting to practice English) invite you to a specific tea house, karaoke, or rooftop bar. After a pleasant conversation, you are presented with an extortionate bill.',
        prevention: 'Politely decline invitations to private bars or venues suggested by newly met strangers on the street.',
        warning_signs: 'Stranger insists on taking you to a specific hidden spot they recommend.',
      },
    ],
    must_do_activities: [
      {
        title: 'Golden Hour Skyline Observation Vantage',
        category: 'Scenic View',
        description: `Catch breathtaking panoramic views of ${destination}'s skyline as the sun sets and the city lights sparkle.`,
        insider_tip: 'Arrive 45 minutes before sunset to secure prime unobstructed photo spots without paying VIP terrace fees.',
        best_time: '5:30 PM – 7:00 PM',
        estimated_cost: '$10 – $25',
      },
      {
        title: 'Authentic Local Night Market Food Safari',
        category: 'Culinary & Culture',
        description: 'Wander through vibrant culinary alleys tasting freshly sizzled regional specialties, artisanal desserts, and seasonal fruit juices.',
        insider_tip: 'Follow stalls with the longest queues of local families—rapid ingredient turnover guarantees the freshest flavors.',
        best_time: '7:00 PM – 10:30 PM',
        estimated_cost: '$5 – $15',
      },
      {
        title: 'Early Morning Heritage Sanctuary Walk',
        category: 'Cultural Exploration',
        description: 'Experience iconic historic streets, ancient temples, and architectural marvels in tranquil serenity before tour buses arrive.',
        insider_tip: 'Arrive at 7:30 AM to catch monks chanting or morning light reflecting off historic facades in complete peace.',
        best_time: '7:00 AM – 9:00 AM',
        estimated_cost: 'Free or small donation',
      },
      {
        title: 'Hidden Alley Artisan Discovery & Local Workshops',
        category: 'Unique & Offbeat',
        description: 'Step off the tourist trail into bohemian back-alleys filled with independent craft studios, vintage shops, and specialty brew coffee houses.',
        insider_tip: 'Ask local studio owners for their favorite neighborhood café recommendations—they know the truest hidden gems.',
        best_time: '2:00 PM – 5:30 PM',
        estimated_cost: '$15 – $35',
      },
    ],
    local_hacks_and_etiquette: [
      {
        topic: 'Tipping Norms',
        category: 'Money',
        tip: 'Check your bill first: a 10% service charge is often included. Leaving an extra 5–10% cash tip for great table service is warmly appreciated.',
      },
      {
        topic: 'eSIM & Connectivity',
        category: 'Tech',
        tip: 'Install an eSIM profile (such as Airalo or Maya) before departure, or buy a local tourist 5G SIM card at the airport arrival hall for reliable maps.',
      },
      {
        topic: 'Public Transit Card',
        category: 'Transport',
        tip: 'Pick up a reloadable transit smart card or tap contactless Visa/Mastercard directly at metro and rapid bus turnstiles for fast travel.',
      },
      {
        topic: 'Temple & Religious Etiquette',
        category: 'Etiquette',
        tip: 'Remove shoes when entering sacred halls, avoid pointing feet directly at religious altars, and ask before photographing people in prayer.',
      },
      {
        topic: 'Friendly Bargaining Rules',
        category: 'Shopping',
        tip: 'Bargaining with a warm smile is acceptable in open flea markets, but fixed prices apply in shopping malls, convenience stores, and supermarkets.',
      },
    ],
    emergency_contacts: {
      police: '112 / 999',
      ambulance: '112 / 999',
      tourist_helpline: 'Dial 1999 (Tourist Police) or ask your hotel concierge',
      emergency_notes: 'Keep photo copies of your passport photo page and travel insurance policy stored in an offline phone album.',
    },
  };

  const clothingData = data.seasonal_clothing;
  const seasons = clothingData?.seasons || [];
  const activeSeason: SeasonItem | undefined = seasons[selectedSeasonIdx] || seasons[0];

  const toggleCheck = (item: string) => {
    setCheckedEssentials(prev => ({
      ...prev,
      [item]: !prev[item],
    }));
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getSeasonIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('rain') || lower.includes('monsoon') || lower.includes('wet')) return CloudRain;
    if (lower.includes('winter') || lower.includes('cool') || lower.includes('cold')) return Snowflake;
    if (lower.includes('spring') || lower.includes('breeze')) return Wind;
    return Sun;
  };

  const getRiskBadge = (risk: string) => {
    const lower = risk.toLowerCase();
    if (lower.includes('high')) {
      return {
        bg: 'rgba(186, 26, 26, 0.08)',
        color: 'var(--error)',
        border: 'rgba(186, 26, 26, 0.25)',
        label: 'High Risk',
      };
    }
    if (lower.includes('med')) {
      return {
        bg: 'rgba(233, 195, 73, 0.15)',
        color: 'var(--gold)',
        border: 'rgba(233, 195, 73, 0.3)',
        label: 'Moderate Risk',
      };
    }
    return {
      bg: 'var(--success-bg)',
      color: 'var(--success)',
      border: 'var(--success-border)',
      label: 'Low Risk / Caution',
    };
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Top Filter Bar ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[var(--outline)]">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-mid)' }}
          >
            <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Curated Suggestions & Travel Wisdom
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Insider advice for {destination} • Seasonal packing, safety warnings & hidden gems
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--surface)] border border-[var(--outline)]">
          {[
            { id: 'all', label: 'All', Icon: Layers },
            { id: 'clothing', label: 'Clothing & Packing', Icon: Shirt },
            { id: 'scams', label: 'Scams & Safety', Icon: ShieldAlert },
            { id: 'activities', label: 'Must-Do', Icon: Sparkles },
            { id: 'hacks', label: 'Local Hacks', Icon: Lightbulb },
          ].map(({ id, label, Icon }) => {
            const active = activeFilter === id;
            return (
              <button
                key={id}
                onClick={() => setActiveFilter(id as typeof activeFilter)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  background: active ? 'var(--color-primary)' : 'transparent',
                  color: active ? '#FFFFFF' : 'var(--text-muted)',
                  boxShadow: active ? '0 2px 12px rgba(255, 56, 92, 0.25)' : 'none',
                }}
              >
                <Icon size={12} />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 1: CLOTHES TO WEAR & SEASONAL PACKING GUIDE ── */}
      {(activeFilter === 'all' || activeFilter === 'clothing') && (
        <section className="bg-[var(--surface)] border border-[var(--outline)] rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleSection('clothing')}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--surface-high)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-mid)' }}>
                <Shirt size={16} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-left" style={{ color: 'var(--text-primary)' }}>
                Seasonal Clothing & Packing Guide
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--surface-mid)', color: 'var(--text-muted)' }}>
                Tailored for {destination}
              </span>
              <ChevronDown
                size={20}
                className={`text-[var(--text-muted)] transition-transform duration-300 ${openSections['clothing'] ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {openSections['clothing'] && (
            <div className="p-4 pt-0 space-y-4 border-t border-[var(--outline)] mt-2">
              {/* Climate summary overview */}
          {clothingData?.climate_overview && (
            <div
              className="p-4 rounded-2xl flex items-start gap-3"
              style={{
                background: 'var(--surface-low)',
                border: '1px solid var(--outline)',
              }}
            >
              <Info size={18} className="text-[var(--text-primary)] mt-0.5 flex-shrink-0" />
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {clothingData.climate_overview}
              </p>
            </div>
          )}

          {/* Season Selector Tabs */}
          {seasons.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {seasons.map((s, idx) => {
                const IconComponent = getSeasonIcon(s.season_name);
                const isSelected = selectedSeasonIdx === idx;
                return (
                  <button
                    key={s.season_name}
                    onClick={() => setSelectedSeasonIdx(idx)}
                    className="p-3 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between"
                    style={{
                      background: isSelected ? 'var(--color-primary-light)' : 'var(--surface)',
                      border: isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--outline)',
                      boxShadow: isSelected ? '0 4px 16px rgba(255,56,92,0.12)' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent
                        size={16}
                        style={{ color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)' }}
                      />
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                      )}
                    </div>
                    <p
                      className="text-xs font-bold truncate"
                      style={{ color: isSelected ? 'var(--color-primary)' : 'var(--text-muted)' }}
                    >
                      {s.season_name.split('(')[0].trim()}
                    </p>
                    <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                      {s.weather_summary.split('•')[0] || s.weather_summary}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Active Season Detail Card */}
          {activeSeason && (
            <div
              className="card p-6 space-y-6"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--outline)',
                borderRadius: '1.25rem',
              }}
            >
              {/* Header: Season Name & Weather */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[var(--outline)]">
                <div>
                  <h4 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                    {activeSeason.season_name}
                  </h4>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {activeSeason.weather_summary}
                  </p>
                </div>
                <div
                  className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  style={{ background: 'var(--surface-mid)', color: 'var(--text-primary)', border: '1px solid var(--outline)' }}
                >
                  <Sun size={12} /> Recommended Wardrobe
                </div>
              </div>

              {/* Grid: What to Wear vs Packing Essentials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* What to Wear List */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Shirt size={14} className="text-[var(--text-primary)]" />
                    <h5 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                      Clothing to Wear
                    </h5>
                  </div>
                  <div className="space-y-2">
                    {activeSeason.clothing_items?.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 p-2.5 rounded-xl transition-all"
                        style={{ background: 'var(--surface-mid)', border: '1px solid var(--outline)' }}
                      >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'var(--color-primary-light)' }}>
                          <CheckCircle2 size={12} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Interactive Packing Checklist */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckSquare size={14} className="text-[var(--text-primary)]" />
                      <h5 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        Essential Packing Checklist
                      </h5>
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)]">Click to check off</span>
                  </div>
                  <div className="space-y-2">
                    {activeSeason.packing_essentials?.map((item, i) => {
                      const isChecked = Boolean(checkedEssentials[`${activeSeason.season_name}-${item}`]);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => toggleCheck(`${activeSeason.season_name}-${item}`)}
                          className="w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all hover:brightness-105"
                          style={{
                            background: isChecked ? 'var(--surface-low)' : 'var(--surface-mid)',
                            border: '1px solid var(--outline)',
                          }}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isChecked ? (
                              <CheckSquare size={14} className="text-[var(--success)]" />
                            ) : (
                              <Square size={14} className="text-[var(--text-muted)]" />
                            )}
                          </div>
                          <span
                            className="text-xs leading-relaxed transition-all"
                            style={{
                              color: isChecked ? 'var(--text-muted)' : 'var(--text-primary)',
                              textDecoration: isChecked ? 'line-through' : 'none',
                            }}
                          >
                            {item}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Dress Code Tip Alert */}
              {activeSeason.dress_code_tips && (
                <div
                  className="p-3.5 rounded-xl flex items-start gap-3"
                  style={{
                    background: 'var(--surface-low)',
                    border: '1px solid var(--outline)',
                  }}
                >
                  <AlertTriangle size={15} className="text-[var(--text-primary)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)] mb-0.5">Cultural & Temple Dress Code</p>
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {activeSeason.dress_code_tips}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* General Dress Tips Chips */}
          {clothingData?.general_dress_tips && clothingData.general_dress_tips.length > 0 && (
            <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--outline)] space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                General Etiquette & Comfort Tips
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {clothingData.general_dress_tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl text-xs flex items-start gap-2 bg-[var(--surface-mid)] border border-[var(--outline)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span style={{ color: 'var(--color-primary)' }} className="font-bold">•</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
            </div>
          )}
        </section>
      )}

      {/* ── SECTION 2: BEWARE OF SCAMS & SAFETY ADVISORY ────── */}
      {(activeFilter === 'all' || activeFilter === 'scams') && (
        <section className="bg-[var(--surface)] border border-[var(--outline)] rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleSection('scams')}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--surface-high)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-mid)' }}>
                <ShieldAlert size={16} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-left" style={{ color: 'var(--text-primary)' }}>
                Beware of Scams & Safety Watch
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--surface-mid)', color: 'var(--text-primary)', border: '1px solid var(--outline)' }}>
                Travel Smart & Safe
              </span>
              <ChevronDown
                size={20}
                className={`text-[var(--text-muted)] transition-transform duration-300 ${openSections['scams'] ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {openSections['scams'] && (
            <div className="p-4 space-y-4 border-t border-[var(--outline)] mt-2">
              {/* Emergency Helpline Strip */}
          {data.emergency_contacts && (
            <div
              className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 rounded-xl"
              style={{
                background: 'var(--color-primary-light)',
                border: '1px solid var(--color-primary-mid)',
              }}
            >
              <div className="flex items-center gap-2">
                <PhoneCall size={13} style={{ color: 'var(--color-primary)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Police</span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{data.emergency_contacts.police || '112'}</span>
              </div>
              <div className="w-px h-4" style={{ background: 'var(--color-primary-mid)' }} />
              <div className="flex items-center gap-2">
                <ShieldCheck size={13} style={{ color: 'var(--color-primary)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Ambulance</span>
                <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{data.emergency_contacts.ambulance || '112'}</span>
              </div>
              <div className="w-px h-4 hidden sm:block" style={{ background: 'var(--color-primary-mid)' }} />
              <div className="flex items-center gap-2">
                <Lock size={13} style={{ color: 'var(--color-primary)' }} />
                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Tourist Help</span>
                <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{data.emergency_contacts.tourist_helpline || 'Visitor Centers'}</span>
              </div>
            </div>
          )}

          {/* Scam Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.scams_and_safety?.map((scam, i) => {
              const badge = getRiskBadge(scam.risk_level);
              return (
                <div
                  key={i}
                  className="card p-5 space-y-3 flex flex-col justify-between"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--outline)',
                    borderRadius: '1.25rem',
                  }}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                        {scam.title}
                      </h4>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {scam.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-[var(--outline)]">
                    {/* How to Avoid / Prevention */}
                    <div
                      className="p-2.5 rounded-xl flex items-start gap-2"
                      style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}
                    >
                      <ShieldCheck size={14} style={{ color: 'var(--color-primary)' }} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--color-primary)' }}>How to Prevent</p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {scam.prevention}
                        </p>
                      </div>
                    </div>

                    {/* Warning Sign */}
                    {scam.warning_signs && (
                      <div
                        className="p-2 rounded-xl flex items-start gap-2"
                        style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}
                      >
                        <AlertTriangle size={12} style={{ color: 'var(--color-primary)' }} className="mt-0.5 flex-shrink-0" />
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <strong style={{ color: 'var(--color-primary)' }}>Red Flag:</strong> {scam.warning_signs}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          )}
        </section>
      )}

      {/* ── SECTION 3: MUST-DO ACTIVITIES & HIDDEN GEMS ────── */}
      {(activeFilter === 'all' || activeFilter === 'activities') && (
        <section className="bg-[var(--surface)] border border-[var(--outline)] rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleSection('activities')}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--surface-high)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-mid)' }}>
                <Sparkles size={16} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-left" style={{ color: 'var(--text-primary)' }}>
                Must-Do Activities & Hidden Gems
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--surface-mid)', color: 'var(--text-muted)' }}>
                Curated Experiences
              </span>
              <ChevronDown
                size={20}
                className={`text-[var(--text-muted)] transition-transform duration-300 ${openSections['activities'] ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {openSections['activities'] && (
            <div className="p-4 pt-0 space-y-4 border-t border-[var(--outline)] mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.must_do_activities?.map((activity, i) => (
              <div
                key={i}
                className="card p-5 space-y-3.5 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-2px]"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--outline)',
                  borderRadius: '1.25rem',
                }}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{
                        background: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        border: '1px solid var(--color-primary-mid)',
                      }}
                    >
                      {activity.category || 'Experience'}
                    </span>
                    {activity.estimated_cost && (
                      <span className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <DollarSign size={11} className="text-[var(--text-primary)]" />
                        {activity.estimated_cost}
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {activity.title}
                  </h4>

                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {activity.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-[var(--outline)]">
                  {activity.best_time && (
                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                      <Clock size={12} className="text-[var(--text-primary)]" />
                      <span>Best Time: {activity.best_time}</span>
                    </div>
                  )}

                  {activity.insider_tip && (
                    <div
                      className="p-2.5 rounded-xl flex items-start gap-2"
                      style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}
                    >
                      <Sparkle size={13} style={{ color: 'var(--color-primary)' }} className="mt-0.5 flex-shrink-0" />
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Insider Tip: </strong>
                        {activity.insider_tip}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
            </div>
          )}
        </section>
      )}

      {/* ── SECTION 4: LOCAL HACKS & TRAVEL ETIQUETTE ───────── */}
      {(activeFilter === 'all' || activeFilter === 'hacks') && (
        <section className="bg-[var(--surface)] border border-[var(--outline)] rounded-2xl overflow-hidden">
          <button
            onClick={() => toggleSection('hacks')}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[var(--surface-high)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-primary-mid)' }}>
                <Lightbulb size={16} style={{ color: 'var(--color-primary)' }} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-left" style={{ color: 'var(--text-primary)' }}>
                Local Hacks & Cultural Etiquette
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-block text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: 'var(--surface-mid)', color: 'var(--text-muted)' }}>
                Insider Knowledge
              </span>
              <ChevronDown
                size={20}
                className={`text-[var(--text-muted)] transition-transform duration-300 ${openSections['hacks'] ? 'rotate-180' : ''}`}
              />
            </div>
          </button>

          {openSections['hacks'] && (
            <div className="p-4 pt-0 space-y-4 border-t border-[var(--outline)] mt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.local_hacks_and_etiquette?.map((hack, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl space-y-2 flex flex-col justify-between"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--outline)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-primary)]">{hack.topic}</span>
                  {hack.category && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--surface-mid)] text-[var(--text-muted)]">
                      {hack.category}
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {hack.tip}
                </p>
              </div>
            ))}
          </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
