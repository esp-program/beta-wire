import React from 'react';

interface RgbLedRealisticProps {
  r?: number; // 0 to 255
  g?: number; // 0 to 255
  b?: number; // 0 to 255
}

export const RgbLedRealistic: React.FC<RgbLedRealisticProps> = ({
  r = 0,
  g = 0,
  b = 0,
}) => {
  const normR = Math.min(255, Math.max(0, r));
  const normG = Math.min(255, Math.max(0, g));
  const normB = Math.min(255, Math.max(0, b));

  const isLit = normR > 10 || normG > 10 || normB > 10;
  const rgbString = `rgb(${normR}, ${normG}, ${normB})`;

  return (
    <svg
      width="90"
      height="100"
      viewBox="0 0 90 100"
      className="select-none filter drop-shadow-md"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id="rgbLeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {isLit && (
          <filter id="rgbBloom" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {/* Glow bloom when lit */}
      {isLit && (
        <circle cx="45" cy="30" r="28" fill={rgbString} opacity="0.6" filter="url(#rgbBloom)" />
      )}

      {/* 4 Long Leads at Bottom: R, Cathode(GND), G, B */}
      {[
        { id: 'r', x: 22, label: 'R', color: '#ef4444' },
        { id: 'gnd', x: 37, label: '-', color: '#94a3b8' }, // Longest lead
        { id: 'g', x: 52, label: 'G', color: '#22c55e' },
        { id: 'b', x: 67, label: 'B', color: '#38bdf8' },
      ].map((p) => (
        <g key={p.id}>
          <rect x={p.x - 1.5} y="54" width="3" height="38" rx="0.5" fill="url(#rgbLeadGrad)" />
          <circle cx={p.x} cy="92" r="2.5" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
          <text x={p.x} y="50" fontSize="5.5" fill={p.color} fontWeight="bold" textAnchor="middle">
            {p.label}
          </text>
        </g>
      ))}

      {/* Flanged Collar Rim */}
      <ellipse cx="45" cy="52" rx="20" ry="4" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />

      {/* 3 Internal Semiconductor Dies */}
      <rect x="36" y="36" width="3" height="3" fill="#ef4444" opacity={normR > 0 ? 0.9 : 0.3} />
      <rect x="44" y="34" width="3" height="3" fill="#22c55e" opacity={normG > 0 ? 0.9 : 0.3} />
      <rect x="52" y="36" width="3" height="3" fill="#38bdf8" opacity={normB > 0 ? 0.9 : 0.3} />

      {/* Clear/Diffused Epoxy Dome */}
      <path
        d="M 27 50 
           L 27 30 
           A 18 18 0 0 1 63 30 
           L 63 50 
           Z"
        fill={isLit ? rgbString : '#334155'}
        fillOpacity={isLit ? 0.85 : 0.4}
        stroke="#94a3b8"
        strokeWidth="1"
      />

      {/* Specular Highlight Arc */}
      <path d="M 33 28 A 12 12 0 0 1 48 16" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
};
