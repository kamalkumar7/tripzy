'use client';

import { useState } from 'react';
import type { ItineraryDay } from '@/lib/api';

interface ItineraryTabProps {
  itinerary: ItineraryDay[];
}

const timeSlots = [
  {
    key: 'morning' as const,
    label: 'Morning',
    time: (day: ItineraryDay) => day.morning?.time,
    icon: '🌅',
    color: '#f59e0b',
    getTitle: (day: ItineraryDay) => day.morning?.activity || 'Morning Activity',
    getDesc: (day: ItineraryDay) => day.morning?.description,
    getMeta: (day: ItineraryDay) => day.morning?.place ? `📍 ${day.morning.place}` : undefined,
    getDuration: (day: ItineraryDay) => day.morning?.duration,
  },
  {
    key: 'lunch' as const,
    label: 'Lunch',
    time: (day: ItineraryDay) => day.lunch?.time,
    icon: '🍽️',
    color: '#e9c349',
    getTitle: (day: ItineraryDay) => day.lunch?.restaurant || 'Lunch',
    getDesc: (day: ItineraryDay) => day.lunch?.cuisine ? `${day.lunch.cuisine} cuisine` : undefined,
    getMeta: (day: ItineraryDay) => day.lunch?.estimated_cost ? `💰 ${day.lunch.estimated_cost} per person` : undefined,
    getDuration: () => undefined,
  },
  {
    key: 'afternoon' as const,
    label: 'Afternoon',
    time: (day: ItineraryDay) => day.afternoon?.time,
    icon: '☀️',
    color: '#4f6073',
    getTitle: (day: ItineraryDay) => day.afternoon?.activity || 'Afternoon Activity',
    getDesc: (day: ItineraryDay) => day.afternoon?.description,
    getMeta: (day: ItineraryDay) => day.afternoon?.place ? `📍 ${day.afternoon.place}` : undefined,
    getDuration: (day: ItineraryDay) => day.afternoon?.duration,
  },
  {
    key: 'dinner' as const,
    label: 'Dinner',
    time: (day: ItineraryDay) => day.dinner?.time,
    icon: '🕯️',
    color: '#a88c69',
    getTitle: (day: ItineraryDay) => day.dinner?.restaurant || 'Dinner',
    getDesc: (day: ItineraryDay) => day.dinner?.cuisine ? `${day.dinner.cuisine} cuisine` : undefined,
    getMeta: (day: ItineraryDay) => day.dinner?.estimated_cost ? `💰 ${day.dinner.estimated_cost} per person` : undefined,
    getDuration: () => undefined,
  },
  {
    key: 'evening' as const,
    label: 'Evening',
    time: (day: ItineraryDay) => day.evening?.time,
    icon: '🌙',
    color: '#041627',
    getTitle: (day: ItineraryDay) => day.evening?.activity || 'Evening',
    getDesc: (day: ItineraryDay) => day.evening?.description,
    getMeta: () => undefined,
    getDuration: () => undefined,
  },
];

function DayCard({ day, isOpen, onToggle }: { day: ItineraryDay; isOpen: boolean; onToggle: () => void }) {
  return (
    <div
      className="card overflow-hidden"
      style={{ transition: 'all 0.3s ease' }}
    >
      {/* Day header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left"
        style={{ background: isOpen ? 'rgba(4,22,39,0.04)' : 'transparent' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
            style={{ background: isOpen ? '#041627' : 'var(--surface-low)', transition: 'background 0.2s' }}
          >
            <span
              className="label-caps leading-none"
              style={{ color: isOpen ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', fontSize: '9px' }}
            >
              DAY
            </span>
            <span
              className="text-xl font-bold leading-none mt-0.5"
              style={{ color: isOpen ? 'white' : 'var(--primary)', fontFamily: 'var(--font-playfair), serif' }}
            >
              {day.day}
            </span>
          </div>
          <div>
            <p
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--text-primary)' }}
            >
              {day.title}
            </p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{day.theme}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {day.estimated_daily_cost && (
            <span className="text-sm font-medium hidden sm:block" style={{ color: 'var(--gold-dark)' }}>
              {day.estimated_daily_cost}
            </span>
          )}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="w-5 h-5 flex-shrink-0"
            style={{
              color: 'var(--text-muted)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.25s ease',
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {isOpen && (
        <div
          className="px-5 pb-5"
          style={{ borderTop: '1px solid var(--outline)' }}
        >
          {/* Time slots */}
          <div className="mt-4 space-y-3">
            {timeSlots.map((slot) => {
              const title = slot.getTitle(day);
              const desc = slot.getDesc(day);
              const meta = slot.getMeta(day);
              const dur = slot.getDuration(day);
              const time = slot.time(day);

              return (
                <div
                  key={slot.key}
                  className="flex gap-3 p-4 rounded-xl"
                  style={{ background: 'var(--surface-low)' }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${slot.color}18`, minWidth: '36px' }}
                  >
                    {slot.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <span
                          className="label-caps"
                          style={{ color: slot.color, fontSize: '10px' }}
                        >
                          {slot.label}
                        </span>
                        {time && (
                          <span
                            className="ml-2 text-xs"
                            style={{ color: 'var(--text-muted)' }}
                          >
                            {time}
                          </span>
                        )}
                      </div>
                      {dur && (
                        <span className="tag text-[10px]">{dur}</span>
                      )}
                    </div>
                    <p className="text-sm font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
                      {title}
                    </p>
                    {desc && (
                      <p className="text-sm mt-1 leading-5" style={{ color: 'var(--text-secondary)' }}>
                        {desc}
                      </p>
                    )}
                    {meta && (
                      <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{meta}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transportation */}
          {day.transportation && (
            <div
              className="mt-4 p-4 rounded-xl flex items-start gap-3"
              style={{ background: 'rgba(79,96,115,0.08)', border: '1px solid rgba(79,96,115,0.15)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#4f6073' }}>
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <div>
                <p className="label-caps mb-1" style={{ color: '#4f6073', fontSize: '10px' }}>Transportation</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{day.transportation}</p>
              </div>
            </div>
          )}

          {/* Tips */}
          {day.tips && day.tips.length > 0 && (
            <div className="mt-4">
              <p className="label-caps mb-2" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>💡 Tips</p>
              <ul className="space-y-1">
                {day.tips.map((tip, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--gold)' }}>•</span>
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
        <p className="text-4xl mb-4">📅</p>
        <p className="text-lg font-medium">No itinerary available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h2
          className="text-2xl font-semibold"
          style={{ fontFamily: 'var(--font-playfair), serif', color: 'var(--primary)' }}
        >
          Day-by-Day Plan
        </h2>
        <span className="tag">{itinerary.length} Days</span>
      </div>

      {/* Day cards */}
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
