'use client';

import { useState } from 'react';
import { MapPin, Globe, Bookmark, Plus, Plane, Menu, X, LogOut } from 'lucide-react';
import type { AuthUser } from '@/lib/auth';

interface SidebarProps {
  onNewTrip: () => void;
  destination?: string;
  user?: AuthUser | null;
  onLogout?: () => void;
  activeNav?: string;
  onNavChange?: (label: string) => void;
}

const DARK_BG = '#020617';
const CYAN    = '#38bdf8';
const GOLD    = '#e9c349';

const navItems = [
  { Icon: MapPin,   label: 'My Trips', active: true  },
  { Icon: Globe,    label: 'Explore',  active: false },
  { Icon: Bookmark, label: 'Saved',    active: false },
];

export default function Sidebar({ onNewTrip, destination, user, onLogout, activeNav = 'My Trips', onNavChange }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

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
            onClick={() => onNavChange?.(label)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left transition-all duration-200"
            style={
              activeNav === label
                ? { background: 'rgba(233,195,73,0.12)', color: GOLD, borderLeft: `3px solid ${GOLD}`, paddingLeft: '13px' }
                : { color: 'rgba(255,255,255,0.5)' }
            }
            onMouseEnter={e => {
              if (activeNav !== label) {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                (e.currentTarget as HTMLElement).style.color = '#ffffff';
              }
            }}
            onMouseLeave={e => {
              if (activeNav !== label) {
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
      <div className="px-3 pb-3">
        <button
          onClick={onNewTrip}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{ background: GOLD, color: DARK_BG, fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
        >
          <Plus size={14} strokeWidth={3} />
          New Trip
        </button>
      </div>

      {/* User Profile */}
      {user && (
        <div
          className="mx-3 mb-3 p-3 rounded-xl flex items-center gap-3"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {user.picture && !imgError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.picture}
                alt={user.name}
                onError={() => setImgError(true)}
                className="w-8 h-8 rounded-full object-cover"
                style={{ border: `1.5px solid ${CYAN}` }}
              />
            ) : (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: `rgba(56,189,248,0.15)`, color: CYAN, border: `1.5px solid ${CYAN}` }}
              >
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            )}
            {/* Online dot */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ background: '#34d399', border: `1.5px solid ${DARK_BG}` }}
            />
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px' }}>
              {user.email}
            </p>
          </div>

          {/* Sign out */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign out"
              className="p-1.5 rounded-lg flex-shrink-0 transition-all duration-200 hover:bg-white/10"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      )}
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
