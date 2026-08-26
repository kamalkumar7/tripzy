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

const timeSlots = [
  {
    key: 'morning'   as const, label: 'Morning',   Icon: Sunrise,  color: 'var(--text-primary)',
    getTitle:  (d: ItineraryDay) => d.morning?.activity   || 'Morning Activity',
    getDesc:   (d: ItineraryDay) => d.morning?.description,
    getMeta:   (d: ItineraryDay) => d.morning?.place ? d.morning.place : undefined,
    getDur:    (d: ItineraryDay) => d.morning?.duration,
    getTime:   (d: ItineraryDay) => d.morning?.time,
  },
  {
    key: 'lunch'     as const, label: 'Lunch',     Icon: Utensils, color: 'var(--text-primary)',
    getTitle:  (d: ItineraryDay) => d.lunch?.restaurant   || 'Lunch',
    getDesc:   (d: ItineraryDay) => d.lunch?.cuisine ? `${d.lunch.cuisine} cuisine` : undefined,
    getMeta:   (d: ItineraryDay) => d.lunch?.estimated_cost ? `${d.lunch.estimated_cost} per person` : undefined,
    getDur:    () => undefined,
    getTime:   (d: ItineraryDay) => d.lunch?.time,
  },
  {
    key: 'afternoon' as const, label: 'Afternoon', Icon: Sun,      color: 'var(--text-primary)',
    getTitle:  (d: ItineraryDay) => d.afternoon?.activity || 'Afternoon Activity',
    getDesc:   (d: ItineraryDay) => d.afternoon?.description,
    getMeta:   (d: ItineraryDay) => d.afternoon?.place ? d.afternoon.place : undefined,
    getDur:    (d: ItineraryDay) => d.afternoon?.duration,
    getTime:   (d: ItineraryDay) => d.afternoon?.time,
  },
  {
    key: 'evening'   as const, label: 'Evening',   Icon: Sunset,   color: 'var(--text-primary)',
    getTitle:  (d: ItineraryDay) => d.evening?.activity   || 'Evening',
    getDesc:   (d: ItineraryDay) => d.evening?.description,
    getMeta:   () => undefined,
    getDur:    () => undefined,
    getTime:   (d: ItineraryDay) => d.evening?.time,
  },
  {
    key: 'dinner'    as const, label: 'Dinner',    Icon: Moon,     color: 'var(--text-primary)',
    getTitle:  (d: ItineraryDay) => (d as any).dinner?.restaurant || (d as any).dinner?.activity || 'Dinner',
    getDesc:   (d: ItineraryDay) => (d as any).dinner?.description || (d as any).dinner?.cuisine,
    getMeta:   () => undefined,
    getDur:    () => undefined,
    getTime:   (d: ItineraryDay) => (d as any).dinner?.time,
  },
];

function DayCard({ day, isOpen, onToggle }: { day: ItineraryDay; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: isOpen ? '1px solid var(--primary)' : '1px solid var(--outline)',
        borderRadius: '1.125rem',
        overflow: 'hidden',
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        boxShadow: isOpen ? 'var(--shadow-lg)' : 'var(--shadow-card)',
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
        style={{ background: isOpen ? 'rgba(4,22,39,0.04)' : 'transparent' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
            style={{
              background: isOpen ? 'rgba(4,22,39,0.08)' : 'var(--surface-low)',
              border: isOpen ? '1px solid var(--primary)' : '1px solid var(--outline)',
            }}
          >
            <span className="label-caps" style={{ color: 'var(--text-muted)', fontSize: '9px' }}>DAY</span>
            <span
              style={{
                color: isOpen ? 'var(--primary)' : 'var(--text-primary)',
                fontSize: '20px',
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {day.day}
            </span>
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              {day.title}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{day.theme}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {day.estimated_daily_cost && (
            <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--text-primary)' }}>
              {day.estimated_daily_cost}
            </span>
          )}
          <ChevronDown
            size={18}
            style={{
              color: 'var(--text-muted)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease',
              flexShrink: 0,
            }}
          />
        </div>
      </button>

      {isOpen && (
        <div className="px-5 pb-5" style={{ borderTop: '1px solid var(--outline)' }}>
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
                  style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--surface-mid)' }}
                  >
                    <slot.Icon size={16} color={slot.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="label-caps" style={{ color: slot.color, fontSize: '10px' }}>
                          {slot.label}
                        </span>
                        {time && (
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{time}</span>
                        )}
                      </div>
                      {dur && (
                        <span style={{
                          padding: '2px 8px', borderRadius: '9999px',
                          fontSize: '10px', fontWeight: 600,
                          background: 'var(--surface-mid)',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--outline)',
                        }}>
                          {dur}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
                    {desc  && <p className="text-sm mt-1 leading-5" style={{ color: 'var(--text-secondary)' }}>{desc}</p>}
                    {meta  && (
                      <p className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
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
              style={{ background: 'var(--surface-low)', border: '1px solid var(--outline)' }}>
              <Truck size={16} color="var(--text-primary)" className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="label-caps mb-0.5" style={{ color: 'var(--text-primary)', fontSize: '10px' }}>
                  Transportation
                </p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{day.transportation}</p>
              </div>
            </div>
          )}

          {day.tips && day.tips.length > 0 && (
            <div className="mt-4">
              <p className="label-caps mb-2 flex items-center gap-1.5" style={{ color: 'var(--text-primary)', fontSize: '10px' }}>
                <Lightbulb size={11} color="var(--text-primary)" /> Tips
              </p>
              <ul className="space-y-1">
                {day.tips.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-primary)', marginTop: '2px' }}>•</span>
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
      <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
        <Calendar size={48} style={{ color: 'var(--outline)' }} className="mx-auto mb-4" />
        <p className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No itinerary available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Day-by-Day Plan
        </h2>
        <span style={{
          padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 600,
          background: 'rgba(4,22,39,0.07)', color: 'var(--primary)', border: '1px solid var(--outline)',
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
