'use client';

import { useEffect, useState } from 'react';
import { Bookmark, Loader2, Calendar, Users, MapPin, Trash2, Plane, AlertCircle } from 'lucide-react';
import { getSavedTrips, type SavedTripSummary } from '@/lib/api';
import { getToken } from '@/lib/auth';

const DARK_BG = '#020617';
const CYAN    = '#38bdf8';
const GOLD    = '#e9c349';

interface SavedTripsPanelProps {
  /** Called when the user clicks a saved trip card to load it */
  onLoadTrip?: (trip: SavedTripSummary) => void;
}

export default function SavedTripsPanel({ onLoadTrip }: SavedTripsPanelProps) {
  const [trips, setTrips]   = useState<SavedTripSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  const fetchTrips = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getToken();
      if (!token) { setError('Not authenticated'); setLoading(false); return; }
      const data = await getSavedTrips(token);
      setTrips(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load saved trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const handleDelete = async (id: string) => {
    const token = getToken();
    if (!token) return;
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api'}/saved-trips/${id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
      );
      setTrips(prev => prev.filter(t => t.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div
      className="flex-1 overflow-y-auto px-6 py-8"
      style={{ background: DARK_BG }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)' }}
        >
          <Bookmark size={18} style={{ color: CYAN }} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>
            Saved Trips
          </h1>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Your personal travel collection
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={28} style={{ color: CYAN }} className="animate-spin" />
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading your trips…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          className="flex items-center gap-3 p-4 rounded-xl mb-6"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertCircle size={16} style={{ color: '#f87171' }} />
          <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && trips.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <Plane size={32} style={{ color: 'rgba(255,255,255,0.15)' }} />
          </div>
          <p className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Georgia, serif' }}>
            No saved trips yet
          </p>
          <p className="text-sm text-center max-w-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            Plan a trip and click <span style={{ color: GOLD }}>Save Trip</span> to keep it here
          </p>
        </div>
      )}

      {/* Trip cards grid */}
      {!loading && !error && trips.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {trips.map(trip => {
            const td = trip.travel_details;
            const city = trip.destination.split(',')[0].trim();
            const savedDate = trip.saved_at
              ? new Date(trip.saved_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
              : '';

            return (
              <div
                key={trip.id}
                className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                style={{
                  background: 'rgba(15,23,42,0.7)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
                onClick={() => onLoadTrip?.(trip)}
              >
                {/* City image */}
                <div className="relative h-36 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://source.unsplash.com/600x300/?${encodeURIComponent(city)},travel,city`}
                    alt={trip.destination}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={e => {
                      (e.currentTarget as HTMLImageElement).src =
                        `https://picsum.photos/seed/${encodeURIComponent(city)}/600/300`;
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.9) 0%, rgba(2,6,23,0.2) 60%, transparent 100%)' }}
                  />
                  {/* Delete button */}
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(trip.id); }}
                    className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-all duration-200 w-7 h-7 rounded-full flex items-center justify-center hover:scale-110"
                    style={{ background: 'rgba(239,68,68,0.8)', backdropFilter: 'blur(8px)' }}
                    title="Remove saved trip"
                  >
                    <Trash2 size={12} color="#fff" />
                  </button>
                </div>

                {/* Card content */}
                <div className="p-4">
                  <h3
                    className="text-base font-bold text-white mb-2 truncate"
                    style={{ fontFamily: 'Georgia, serif' }}
                  >
                    {trip.destination}
                  </h3>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {td?.duration && (
                      <span
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(56,189,248,0.1)', color: CYAN }}
                      >
                        <Calendar size={10} /> {td.duration} days
                      </span>
                    )}
                    {td?.travelers && (
                      <span
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
                      >
                        <Users size={10} /> {td.travelers} people
                      </span>
                    )}
                    {td?.travel_type && (
                      <span
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(233,195,73,0.1)', color: GOLD }}
                      >
                        <MapPin size={10} /> {td.travel_type}
                      </span>
                    )}
                  </div>

                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    Saved {savedDate}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
