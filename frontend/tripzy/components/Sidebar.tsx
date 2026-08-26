'use client';

import { useState } from 'react';
import { MapPin, Globe, Bookmark, Plus, Plane, Menu, X, LogOut, Sun, Moon } from 'lucide-react';
import type { AuthUser } from '@/lib/auth';

interface SidebarProps {
  onNewTrip: () => void;
  destination?: string;
  user?: AuthUser | null;
  onLogout?: () => void;
  activeNav?: string;
  onNavChange?: (label: string) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

const navItems = [
  { Icon: MapPin,   label: 'My Trips' },
  { Icon: Globe,    label: 'Explore'  },
  { Icon: Bookmark, label: 'Saved'    },
];

export default function Sidebar({ onNewTrip, destination, user, onLogout, activeNav = 'My Trips', onNavChange, darkMode, onToggleDarkMode }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const renderContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-7">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-primary)', color: '#FFFFFF' }}
          >
            <Plane size={16} strokeWidth={2.5} />
          </div>
          <span
            className="text-xl font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Tripzy
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1.5">
        {navItems.map(({ Icon, label }) => {
          const isActive = activeNav === label;
          return (
            <button
              key={label}
              onClick={() => {
                onNavChange?.(label);
                setMobileOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium w-full text-left transition-all duration-200 ${
                isActive
                  ? ''
                  : 'hover:bg-gray-100 hover:text-[var(--text-primary)] dark:hover:bg-gray-800'
              }`}
              style={
                isActive
                  ? {
                      background: 'rgba(255, 56, 92, 0.1)',
                      color: 'var(--color-primary)',
                    }
                  : {
                      color: 'var(--text-secondary)',
                      background: 'transparent',
                    }
              }
            >
              <Icon size={16} />
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Current trip */}
      {destination && (
        <div
          className="mx-3 mb-3 p-4 rounded-xl shadow-xs"
          style={{
            background: 'var(--surface-low)',
            border: '1px solid var(--surface-border)',
          }}
        >
          <p
            style={{
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              marginBottom: '4px',
            }}
          >
            Current Trip
          </p>
          <p
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {destination}
          </p>
        </div>
      )}

      {/* New Trip Button */}
      <div className="px-3 pb-3">
        <button
          onClick={() => {
            onNewTrip();
            setMobileOpen(false);
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full font-semibold transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{
            background: 'var(--color-primary)',
            color: '#FFFFFF',
            fontSize: '13px',
          }}
        >
          <Plus size={14} strokeWidth={3} />
          New Trip
        </button>
      </div>

      {/* User Profile */}
      {user && (
        <div
          className="mx-3 mb-3 p-3 rounded-xl flex items-center gap-3 shadow-xs"
          style={{
            background: 'var(--surface-low)',
            border: '1px solid var(--surface-border)',
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
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  background: 'rgba(255,56,92,0.1)',
                  color: 'var(--color-primary)',
                }}
              >
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
            )}
            {/* Online dot */}
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
              style={{ background: '#34d399', border: '1.5px solid var(--surface)' }}
            />
          </div>

          {/* Name + email */}
          <div className="flex-1 min-w-0">
            <p
              className="text-xs font-semibold truncate"
              style={{ color: 'var(--text-primary)' }}
            >
              {user.name}
            </p>
            <p
              className="truncate font-medium"
              style={{ color: 'var(--text-muted)', fontSize: '10px' }}
            >
              {user.email}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {onToggleDarkMode && (
              <button
                onClick={onToggleDarkMode}
                title={darkMode ? 'Light Mode' : 'Dark Mode'}
                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-[var(--surface-mid)]"
                style={{ color: 'var(--text-muted)' }}
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            )}
            
            {onLogout && (
              <button
                onClick={onLogout}
                title="Sign out"
                className="p-1.5 rounded-lg transition-all duration-200 hover:bg-[var(--surface-mid)]"
                style={{ color: 'var(--text-muted)' }}
              >
                <LogOut size={13} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex flex-col w-60 h-screen sticky top-0 flex-shrink-0 z-50 transition-colors duration-200"
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--surface-border)',
        }}
      >
        {renderContent()}
      </aside>

      {/* Mobile Top Bar */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 transition-colors duration-200"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--surface-border)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--color-primary)', color: '#FFFFFF' }}
          >
            <Plane size={14} strokeWidth={2.5} />
          </div>
          <span
            className="text-lg font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Tripzy
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onNewTrip}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:brightness-110 active:scale-95"
            style={{ background: 'var(--color-primary)', color: '#FFFFFF' }}
          >
            <Plus size={11} strokeWidth={3} /> New Trip
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg transition-colors duration-200"
            style={{
              color: 'var(--text-primary)',
              background: 'var(--surface-low)',
              border: '1px solid var(--surface-border)',
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-xs" />
          <aside
            className="absolute top-0 left-0 w-64 h-full shadow-2xl transition-colors duration-200"
            style={{
              background: 'var(--surface)',
              borderRight: '1px solid var(--surface-border)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {renderContent()}
          </aside>
        </div>
      )}
    </>
  );
}

