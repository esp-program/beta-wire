import React from 'react';

interface PhotoresistorRealisticProps {
  lightLevel?: number; // 0 to 100%
  onChangeLight?: (l: number) => void;
}

export const PhotoresistorRealistic: React.FC<PhotoresistorRealisticProps> = ({
  lightLevel = 70,
  onChangeLight,
}) => {
  return (
    <svg
      width="65"
      height="85"
      viewBox="0 0 65 85"
      className="select-none filter drop-shadow-md"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* LDR Ceramic Base */}
        <radialGradient id="ldrBaseGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#fef3c7" />
          <stop offset="70%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>
      </defs>

      {/* Two Metal Leads */}
      <rect x="21" y="44" width="3.5" height="34" rx="0.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />
      <circle cx="23" cy="78" r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />

      <rect x="40" y="44" width="3.5" height="34" rx="0.5" fill="#cbd5e1" stroke="#64748b" strokeWidth="0.5" />
      <circle cx="42" cy="78" r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />

      {/* Round Ceramic Substrate Disc */}
      <circle cx="32.5" cy="28" r="22" fill="url(#ldrBaseGrad)" stroke="#b45309" strokeWidth="1" />

      {/* Cadmium Sulfide (CdS) Red Serpentine / Zig-zag Track */}
      <path
        d="M 18 20 
           L 47 20 
           L 47 24 
           L 18 24 
           L 18 28 
           L 47 28 
           L 47 32 
           L 18 32 
           L 18 36 
           L 47 36"
        fill="none"
        stroke="#dc2626"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Clear Epoxy Coating Glare */}
      <circle cx="32.5" cy="28" r="20" fill="#ffffff" opacity={0.1 + (lightLevel / 100) * 0.25} />
      <path d="M 20 22 A 16 16 0 0 1 38 12" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.6" />

      {/* Interactive Light Level Tag */}
      <g
        cursor="pointer"
        onClick={(e) => {
          e.stopPropagation();
          const next = lightLevel >= 90 ? 15 : lightLevel + 25;
          onChangeLight?.(next);
        }}
      >
        <rect x="12" y="0" width="41" height="9" rx="4.5" fill="#0f172a" stroke="#facc15" strokeWidth="0.6" />
        <text x="32.5" y="6.5" fontSize="5" fill="#facc15" fontWeight="bold" textAnchor="middle">
          ☀ {lightLevel}% Lux
        </text>
      </g>
    </svg>
  );
};
