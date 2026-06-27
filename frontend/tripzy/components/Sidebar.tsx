'use client';

import { useState } from 'react';

interface SidebarProps {
  onNewTrip: () => void;
  destination?: string;
}

const navItems = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    ),
    label: 'My Trips',
    active: true,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        <path d="M2 12h20" />
      </svg>
    ),
    label: 'Explore',
    active: false,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
    label: 'Saved',
    active: false,
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: 'Profile',
    active: false,
  },
];

export default function Sidebar({ onNewTrip, destination }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'var(--gold)', color: '#041627' }}
          >
            T
          </div>
          <span
            className="text-2xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-playfair), serif', color: '#ffffff' }}
          >
            Tripzy
          </span>
        </div>
        <p className="text-xs mt-1 pl-12" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Elite Concierge
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left transition-all duration-200"
            style={
              item.active
                ? {
                    background: 'rgba(233,195,73,0.15)',
                    color: 'var(--gold)',
                    borderRight: '3px solid var(--gold)',
                  }
                : {
                    color: 'rgba(255,255,255,0.6)',
                  }
            }
            onMouseEnter={(e) => {
              if (!item.active) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)';
                (e.currentTarget as HTMLElement).style.color = '#ffffff';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)';
              }
            }}
          >
            {item.icon}
            <span className="label-caps">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Current trip info */}
      {destination && (
        <div className="mx-4 mb-4 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p className="label-caps mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Current Trip</p>
          <p className="text-sm font-semibold text-white truncate">{destination}</p>
        </div>
      )}

      {/* New Trip Button */}
      <div className="p-4 pt-0">
        <button
          onClick={onNewTrip}
          className="w-full py-3 rounded-full label-caps font-bold transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{ background: 'var(--gold)', color: '#041627' }}
        >
          + New Trip
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0 z-50"
        style={{ background: '#041627' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Top Bar */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: '#041627',
          boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
            style={{ background: 'var(--gold)', color: '#041627' }}
          >
            T
          </div>
          <span
            className="text-lg font-bold text-white"
            style={{ fontFamily: 'var(--font-playfair), serif' }}
          >
            Tripzy
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewTrip}
            className="text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: 'var(--gold)', color: '#041627' }}
          >
            New Trip
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg"
            style={{ color: 'white' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          onClick={() => setMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60" />
          <aside
            className="absolute top-0 left-0 w-72 h-full"
            style={{ background: '#041627' }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
