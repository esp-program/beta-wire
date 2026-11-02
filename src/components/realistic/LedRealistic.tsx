import React from 'react';

interface LedRealisticProps {
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'orange' | 'white' | 'purple' | 'cyan';
  brightness?: number; // 0 to 1 (or 0 to 255)
}

const COLOR_MAP = {
  red: {
    off: '#7f1d1d',
    mid: '#dc2626',
    on: '#ff2b2b',
    glow: 'rgba(239, 68, 68, 0.85)',
    inner: '#fca5a5',
  },
  green: {
    off: '#14532d',
    mid: '#16a34a',
    on: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.85)',
    inner: '#86efac',
  },
  blue: {
    off: '#1e3a8a',
    mid: '#2563eb',
    on: '#38bdf8',
    glow: 'rgba(56, 189, 248, 0.85)',
    inner: '#bae6fd',
  },
  yellow: {
    off: '#713f12',
    mid: '#ca8a04',
    on: '#facc15',
    glow: 'rgba(250, 204, 21, 0.85)',
    inner: '#fef08a',
  },
  orange: {
    off: '#7c2d12',
    mid: '#ea580c',
    on: '#fb923c',
    glow: 'rgba(249, 115, 22, 0.85)',
    inner: '#fed7aa',
  },
  purple: {
    off: '#581c87',
    mid: '#9333ea',
    on: '#c084fc',
    glow: 'rgba(168, 85, 247, 0.85)',
    inner: '#e9d5ff',
  },
  cyan: {
    off: '#164e63',
    mid: '#0891b2',
    on: '#22d3ee',
    glow: 'rgba(6, 182, 212, 0.85)',
    inner: '#cffafe',
  },
  white: {
    off: '#475569',
    mid: '#94a3b8',
    on: '#f8fafc',
    glow: 'rgba(255, 255, 255, 0.9)',
    inner: '#ffffff',
  },
};

export const LedRealistic: React.FC<LedRealisticProps> = ({
  color = 'red',
  brightness = 0,
}) => {
  // Normalize brightness to 0 - 1
  const b = Math.min(1, Math.max(0, brightness > 1 ? brightness / 255 : brightness));
  const c = COLOR_MAP[color] || COLOR_MAP.red;

  return (
    <svg
      width="70"
      height="90"
      viewBox="0 0 70 90"
      className="select-none filter drop-shadow-md"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Metal Lead Gradient */}
        <linearGradient id="leadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* LED Dome Gradient */}
        <radialGradient id={`ledGrad-${color}`} cx="38%" cy="35%" r="65%">
          <stop offset="0%" stopColor={b > 0.1 ? c.inner : '#e2e8f0'} stopOpacity={b > 0.1 ? 0.95 : 0.4} />
          <stop offset="60%" stopColor={b > 0.1 ? c.on : c.mid} stopOpacity={0.85} />
          <stop offset="100%" stopColor={b > 0.1 ? c.mid : c.off} stopOpacity={0.95} />
        </radialGradient>

        {/* Dynamic Bloom Glow */}
        {b > 0.05 && (
          <filter id={`bloom-${color}`} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={4 + b * 10} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Dynamic Glow Aureole when Lit */}
      {b > 0.05 && (
        <circle
          cx="35"
          cy="28"
          r={20 + b * 18}
          fill={c.glow}
          opacity={b * 0.75}
          filter={`url(#bloom-${color})`}
        />
      )}

      {/* METALLIC LEADS (Axial Pins extending to bottom) */}
      {/* Anode (+) Longer Pin on Left */}
      <rect x="24" y="52" width="3.5" height="30" rx="0.5" fill="url(#leadGrad)" stroke="#475569" strokeWidth="0.5" />
      {/* Solder/Breadboard Tip Anode */}
      <circle cx="26" cy="82" r="2.5" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />

      {/* Cathode (-) Shorter Pin on Right with step */}
      <rect x="42" y="52" width="3.5" height="30" rx="0.5" fill="url(#leadGrad)" stroke="#475569" strokeWidth="0.5" />
      {/* Solder/Breadboard Tip Cathode */}
      <circle cx="44" cy="82" r="2.5" fill="#94a3b8" stroke="#475569" strokeWidth="0.5" />

      {/* Flanged Collar / Rim with Flat Cathode notch */}
      <path
        d="M 17 48 
           C 17 52, 53 52, 53 48 
           L 51 53 
           C 51 56, 19 56, 19 53 
           Z"
        fill={b > 0.1 ? c.mid : c.off}
        stroke="#334155"
        strokeWidth="0.8"
      />

      {/* Internal Leadframe (Anvil Cathode & Post Anode) visible inside epoxy */}
      <path d="M 26 50 L 26 36 L 31 36" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.6" />
      {/* Anvil triangle */}
      <path d="M 44 50 L 44 34 L 38 34 L 34 26 L 44 26 Z" fill="#cbd5e1" opacity="0.7" />
      {/* Tiny bond wire */}
      <line x1="31" y1="36" x2="36" y2="28" stroke="#fde047" strokeWidth="0.8" opacity="0.8" />

      {/* Main 5mm Epoxy Dome */}
      <path
        d="M 18 48 
           L 18 30 
           A 17 17 0 0 1 52 30 
           L 52 48 
           Z"
        fill={`url(#ledGrad-${color})`}
        stroke={b > 0.1 ? c.inner : '#475569'}
        strokeWidth="1.2"
      />

      {/* Specular Highlight Arc (Glass Glare Reflection) */}
      <path
        d="M 23 28 A 12 12 0 0 1 35 16"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.75"
      />
      <circle cx="25" cy="33" r="1.5" fill="#ffffff" opacity="0.6" />

      {/* Cathode Flat Indicator Notch on Right Rim */}
      <line x1="52" y1="46" x2="52" y2="52" stroke="#0f172a" strokeWidth="1.5" />

      {/* Polarity silkscreen hint */}
      <text x="26" y="65" fontSize="7" fill="#ffffff" fontWeight="bold" textAnchor="middle">+</text>
      <text x="44" y="65" fontSize="9" fill="#ffffff" fontWeight="bold" textAnchor="middle">-</text>
    </svg>
  );
};
