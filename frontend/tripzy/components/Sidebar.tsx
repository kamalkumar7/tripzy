'use client';

import { useState } from 'react';
import { MapPin, Globe, Bookmark, User, Plus, Plane, Menu, X } from 'lucide-react';

interface SidebarProps {
  onNewTrip: () => void;
  destination?: string;
}

const DARK_BG = '#020617';
const CYAN    = '#38bdf8';
const GOLD    = '#e9c349';

const navItems = [
  { Icon: MapPin,   label: 'My Trips', active: true  },
  { Icon: Globe,    label: 'Explore',  active: false },
  { Icon: Bookmark, label: 'Saved',    active: false },
  { Icon: User,     label: 'Profile',  active: false },
];

export default function Sidebar({ onNewTrip, destination }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-7" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center gap-3 mb-1">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: GOLD, color: DARK_BG }}
          >
            <Plane size={16} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Georgia, serif', color: '#ffffff' }}>
            Tripzy
          </span>
        </div>
        <p className="text-xs mt-1 pl-12" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Elite Concierge
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {navItems.map(({ Icon, label, active }) => (
          <button
            key={label}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left transition-all duration-200"
            style={
              active
                ? { background: 'rgba(56,189,248,0.12)', color: CYAN, borderLeft: `3px solid ${CYAN}`, paddingLeft: '13px' }
                : { color: 'rgba(255,255,255,0.5)' }
            }
            onMouseEnter={e => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLElement).style.color = '#ffffff';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
              }
            }}
          >
            <Icon size={16} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {label}
            </span>
          </button>
        ))}
      </nav>

      {/* Current trip */}
      {destination && (
        <div className="mx-3 mb-3 p-4 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: '4px' }}>
            Current Trip
          </p>
          <p className="text-sm font-semibold text-white truncate">{destination}</p>
        </div>
      )}

      {/* New Trip Button */}
      <div className="p-3">
        <button
          onClick={onNewTrip}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{ background: GOLD, color: DARK_BG, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          <Plus size={14} strokeWidth={3} />
          New Trip
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 h-screen sticky top-0 flex-shrink-0 z-50"
        style={{ background: 'rgba(5,10,24,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        {renderContent()}
      </aside>

      {/* Mobile Top Bar */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
        style={{
          background: 'rgba(2,6,23,0.95)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: GOLD, color: DARK_BG }}>
            <Plane size={14} strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>Tripzy</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewTrip}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: GOLD, color: DARK_BG }}
          >
            <Plus size={11} strokeWidth={3} /> New Trip
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg"
            style={{ color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.05)' }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <aside
            className="absolute top-0 left-0 w-64 h-full"
            style={{ background: '#05090f', borderRight: '1px solid rgba(255,255,255,0.07)' }}
            onClick={e => e.stopPropagation()}
          >
            {renderContent()}
          </aside>
        </div>
      )}
    </>
  );
}
