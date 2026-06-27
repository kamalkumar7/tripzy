'use client';

import { useState } from 'react';
import type { ItineraryDay } from '@/lib/api';
import {
  Sunrise, Sun, Sunset, Moon, Utensils,
  MapPin, Clock, Truck, Lightbulb, ChevronDown, Calendar,
} from 'lucide-react';


interface ItineraryTabProps {
  itinerary: ItineraryDay[];
}

const DARK_BG = '#020617';
const CYAN    = '#38bdf8';
const GOLD    = '#e9c349';

const timeSlots = [
  {
    key: 'morning'   as const, label: 'Morning',   Icon: Sunrise,  color: '#fb923c',
    getTitle:  (d: ItineraryDay) => d.morning?.activity   || 'Morning Activity',
    getDesc:   (d: ItineraryDay) => d.morning?.description,
    getMeta:   (d: ItineraryDay) => d.morning?.place ? d.morning.place : undefined,
    getDur:    (d: ItineraryDay) => d.morning?.duration,
    getTime:   (d: ItineraryDay) => d.morning?.time,
  },
  {
    key: 'lunch'     as const, label: 'Lunch',     Icon: Utensils, color: GOLD,
    getTitle:  (d: ItineraryDay) => d.lunch?.restaurant   || 'Lunch',
    getDesc:   (d: ItineraryDay) => d.lunch?.cuisine ? `${d.lunch.cuisine} cuisine` : undefined,
    getMeta:   (d: ItineraryDay) => d.lunch?.estimated_cost ? `${d.lunch.estimated_cost} per person` : undefined,
    getDur:    () => undefined,
    getTime:   (d: ItineraryDay) => d.lunch?.time,
  },
  {
    key: 'afternoon' as const, label: 'Afternoon', Icon: Sun,      color: CYAN,
    getTitle:  (d: ItineraryDay) => d.afternoon?.activity || 'Afternoon Activity',
    getDesc:   (d: ItineraryDay) => d.afternoon?.description,
    getMeta:   (d: ItineraryDay) => d.afternoon?.place ? d.afternoon.place : undefined,
    getDur:    (d: ItineraryDay) => d.afternoon?.duration,
    getTime:   (d: ItineraryDay) => d.afternoon?.time,
  },
  {
    key: 'evening'   as const, label: 'Evening',   Icon: Sunset,   color: '#a78bfa',
    getTitle:  (d: ItineraryDay) => d.evening?.activity   || 'Evening',
    getDesc:   (d: ItineraryDay) => d.evening?.description,
    getMeta:   () => undefined,
    getDur:    () => undefined,
    getTime:   (d: ItineraryDay) => d.evening?.time,
  },
  {
    key: 'dinner'    as const, label: 'Dinner',    Icon: Moon,     color: '#34d399',
    getTitle:  (d: ItineraryDay) => (d as any).dinner?.restaurant || (d as any).dinner?.activity || 'Dinner',
    getDesc:   (d: ItineraryDay) => (d as any).dinner?.description || (d as any).dinner?.cuisine,
    getMeta:   () => undefined,
    getDur:    () => undefined,
    getTime:   (d: ItineraryDay) => (d as any).dinner?.time,
  },
];

function DayCard({ day, isOpen, onToggle }: { day: ItineraryDay; isOpen: boolean; onToggle: () => void }) {
  const glassCard: React.CSSProperties = {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    background: 'rgba(15,23,42,0.70)',
    border: `1px solid ${isOpen ? 'rgba(56,189,248,0.25)' : 'rgba(255,255,255,0.07)'}`,
    borderRadius: '1.125rem',
    overflow: 'hidden',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxShadow: isOpen ? '0 8px 32px rgba(56,189,248,0.08)' : '0 4px 20px rgba(0,0,0,0.3)',
  };

  return (
    <div style={glassCard}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
        style={{ background: isOpen ? 'rgba(56,189,248,0.05)' : 'transparent' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
            style={{
              background: isOpen ? `rgba(56,189,248,0.15)` : 'rgba(255,255,255,0.05)',
              border: isOpen ? `1px solid rgba(56,189,248,0.3)` : '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em' }}>DAY</span>
            <span style={{ color: isOpen ? CYAN : '#f1f5f9', fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: 700, lineHeight: 1 }}>
              {day.day}
            </span>
          </div>
          <div>
            <p className="text-base font-semibold" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
              {day.title}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{day.theme}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {day.estimated_daily_cost && (
            <span className="text-sm font-semibold hidden sm:block" style={{ color: GOLD }}>
              {day.estimated_daily_cost}
            </span>
          )}
          <ChevronDown
            size={18}
            style={{
              color: 'rgba(255,255,255,0.4)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease',
              flexShrink: 0,
            }}
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mt-4 space-y-3">
            {timeSlots.map((slot) => {
              const title = slot.getTitle(day);
              const desc  = slot.getDesc(day);
              const meta  = slot.getMeta(day);
              const dur   = slot.getDur(day);
              const time  = slot.getTime(day);

              if (!title && !desc) return null;

              return (
                <div
                  key={slot.key}
                  className="flex gap-3 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${slot.color}18` }}
                  >
                    <slot.Icon size={16} color={slot.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span style={{ color: slot.color, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                          {slot.label}
                        </span>
                        {time && (
                          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{time}</span>
                        )}
                      </div>
                      {dur && (
                        <span style={{
                          padding: '2px 8px', borderRadius: '9999px',
                          fontSize: '10px', fontWeight: 600,
                          background: 'rgba(255,255,255,0.06)',
                          color: 'rgba(255,255,255,0.5)',
                          border: '1px solid rgba(255,255,255,0.08)',
                        }}>
                          {dur}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold mt-1" style={{ color: '#f1f5f9' }}>{title}</p>
                    {desc  && <p className="text-sm mt-1 leading-5" style={{ color: 'rgba(255,255,255,0.55)' }}>{desc}</p>}
                    {meta  && (
                      <p className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        <MapPin size={10} /> {meta}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {day.transportation && (
            <div className="mt-4 p-4 rounded-xl flex items-start gap-3"
              style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.15)' }}>
              <Truck size={16} color="#a78bfa" className="flex-shrink-0 mt-0.5" />
              <div>
                <p style={{ color: '#a78bfa', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '3px' }}>
                  Transportation
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{day.transportation}</p>
              </div>
            </div>
          )}

          {day.tips && day.tips.length > 0 && (
            <div className="mt-4">
              <p style={{ color: GOLD, fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lightbulb size={11} color={GOLD} /> Tips
              </p>
              <ul className="space-y-1">
                {day.tips.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <span style={{ color: GOLD, marginTop: '2px' }}>•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ItineraryTab({ itinerary }: ItineraryTabProps) {
  const [openDay, setOpenDay] = useState<number>(1);

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="text-center py-20" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <Calendar size={48} color="rgba(255,255,255,0.15)" className="mx-auto mb-4" />
        <p className="text-lg font-medium">No itinerary available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-semibold" style={{ fontFamily: 'Georgia, serif', color: '#f1f5f9' }}>
          Day-by-Day Plan
        </h2>
        <span style={{
          padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600,
          background: 'rgba(56,189,248,0.1)', color: CYAN, border: '1px solid rgba(56,189,248,0.2)',
        }}>
          {itinerary.length} Days
        </span>
      </div>

      {itinerary.map((day) => (
        <DayCard
          key={day.day}
          day={day}
          isOpen={openDay === day.day}
          onToggle={() => setOpenDay(openDay === day.day ? -1 : day.day)}
        />
      ))}
    </div>
  );
}
