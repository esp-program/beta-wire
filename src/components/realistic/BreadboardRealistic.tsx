import React from 'react';

export const BreadboardRealistic: React.FC = () => {
  return (
    <svg
      width="600"
      height="220"
      viewBox="0 0 600 220"
      className="select-none filter drop-shadow-lg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Breadboard Off-White / Cream Plastic Texture */}
        <linearGradient id="bbBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fdfdfd" />
          <stop offset="2%" stopColor="#f4f4f5" />
          <stop offset="98%" stopColor="#e4e4e7" />
          <stop offset="100%" stopColor="#d4d4d8" />
        </linearGradient>

        {/* Central Divider Notch Gradient */}
        <linearGradient id="troughGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#a1a1aa" />
          <stop offset="50%" stopColor="#71717a" />
          <stop offset="100%" stopColor="#a1a1aa" />
        </linearGradient>

        {/* Metal Tie-Point Clip Interior */}
        <linearGradient id="clipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="50%" stopColor="#27272a" />
          <stop offset="100%" stopColor="#3f3f46" />
        </linearGradient>
      </defs>

      {/* Main ABS Plastic Body with Interlocking Notches */}
      <rect
        x="12"
        y="6"
        width="576"
        height="208"
        rx="8"
        fill="url(#bbBodyGrad)"
        stroke="#cbd5e1"
        strokeWidth="1.5"
      />

      {/* Side Interlocking Tabs (Left & Right) */}
      <path d="M 12 60 L 6 65 L 6 95 L 12 100 Z" fill="#e4e4e7" stroke="#cbd5e1" />
      <path d="M 12 120 L 6 125 L 6 155 L 12 160 Z" fill="#e4e4e7" stroke="#cbd5e1" />
      <path d="M 588 60 L 594 65 L 594 95 L 588 100 Z" fill="#e4e4e7" stroke="#cbd5e1" />
      <path d="M 588 120 L 594 125 L 594 155 L 588 160 Z" fill="#e4e4e7" stroke="#cbd5e1" />

      {/* Central IC Divider Trough */}
      <rect x="24" y="106" width="552" height="8" rx="2" fill="url(#troughGrad)" />
      <line x1="28" y1="110" x2="572" y2="110" stroke="#52525b" strokeWidth="1" />

      {/* TOP POWER RAILS */}
      {/* Red line (+) */}
      <line x1="40" y1="14" x2="560" y2="14" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <text x="32" y="17" fontSize="10" fill="#ef4444" fontWeight="bold">+</text>
      <text x="566" y="17" fontSize="10" fill="#ef4444" fontWeight="bold">+</text>

      {/* Blue line (-) */}
      <line x1="40" y1="44" x2="560" y2="44" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <text x="32" y="47" fontSize="11" fill="#3b82f6" fontWeight="bold">-</text>
      <text x="566" y="47" fontSize="11" fill="#3b82f6" fontWeight="bold">-</text>

      {/* Top Power Rail Tie Points */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = 50 + i * 26;
        return (
          <g key={`top-pwr-${i}`}>
            {/* (+) Hole */}
            <rect x={x - 4} y="16" width="8" height="8" rx="1.5" fill="url(#clipGrad)" stroke="#a1a1aa" strokeWidth="0.5" />
            <circle cx={x} cy="20" r="1.5" fill="#e4e4e7" opacity="0.3" />
            {/* (-) Hole */}
            <rect x={x - 4} y="32" width="8" height="8" rx="1.5" fill="url(#clipGrad)" stroke="#a1a1aa" strokeWidth="0.5" />
            <circle cx={x} cy="36" r="1.5" fill="#e4e4e7" opacity="0.3" />
          </g>
        );
      })}

      {/* ROW LETTERS: a b c d e (Top Bank) and f g h i j (Bottom Bank) */}
      {['e', 'a'].map((letter, idx) => (
        <text key={letter} x="26" y={idx === 0 ? 68 : 98} fontSize="8" fill="#64748b" fontWeight="600">
          {letter}
        </text>
      ))}
      {['f', 'j'].map((letter, idx) => (
        <text key={letter} x="26" y={idx === 0 ? 128 : 158} fontSize="8" fill="#64748b" fontWeight="600">
          {letter}
        </text>
      ))}

      {/* 30 TERMINAL COLUMNS */}
      {Array.from({ length: 30 }).map((_, colIdx) => {
        const col = colIdx + 1;
        const x = 44 + colIdx * 17.5;
        const isNumbered = col === 1 || col % 5 === 0;

        return (
          <g key={`col-${col}`}>
            {/* Column Number at top of bank */}
            {isNumbered && (
              <text x={x} y="56" fontSize="7" fill="#64748b" fontWeight="600" textAnchor="middle">
                {col}
              </text>
            )}

            {/* Row E */}
            <rect x={x - 4} y="61" width="8" height="8" rx="1.5" fill="url(#clipGrad)" stroke="#a1a1aa" strokeWidth="0.5" />
            {/* Row A */}
            <rect x={x - 4} y="91" width="8" height="8" rx="1.5" fill="url(#clipGrad)" stroke="#a1a1aa" strokeWidth="0.5" />

            {/* Row F */}
            <rect x={x - 4} y="121" width="8" height="8" rx="1.5" fill="url(#clipGrad)" stroke="#a1a1aa" strokeWidth="0.5" />
            {/* Row J */}
            <rect x={x - 4} y="151" width="8" height="8" rx="1.5" fill="url(#clipGrad)" stroke="#a1a1aa" strokeWidth="0.5" />

            {/* Column Number at bottom of bank */}
            {isNumbered && (
              <text x={x} y="169" fontSize="7" fill="#64748b" fontWeight="600" textAnchor="middle">
                {col}
              </text>
            )}
          </g>
        );
      })}

      {/* BOTTOM POWER RAILS */}
      {/* Red line (+) */}
      <line x1="40" y1="178" x2="560" y2="178" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <text x="32" y="181" fontSize="10" fill="#ef4444" fontWeight="bold">+</text>
      <text x="566" y="181" fontSize="10" fill="#ef4444" fontWeight="bold">+</text>

      {/* Blue line (-) */}
      <line x1="40" y1="208" x2="560" y2="208" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
      <text x="32" y="211" fontSize="11" fill="#3b82f6" fontWeight="bold">-</text>
      <text x="566" y="211" fontSize="11" fill="#3b82f6" fontWeight="bold">-</text>

      {/* Bottom Power Rail Tie Points */}
      {Array.from({ length: 20 }).map((_, i) => {
        const x = 50 + i * 26;
        return (
          <g key={`bot-pwr-${i}`}>
            {/* (+) Hole */}
            <rect x={x - 4} y="180" width="8" height="8" rx="1.5" fill="url(#clipGrad)" stroke="#a1a1aa" strokeWidth="0.5" />
            <circle cx={x} cy="184" r="1.5" fill="#e4e4e7" opacity="0.3" />
            {/* (-) Hole */}
            <rect x={x - 4} y="196" width="8" height="8" rx="1.5" fill="url(#clipGrad)" stroke="#a1a1aa" strokeWidth="0.5" />
            <circle cx={x} cy="200" r="1.5" fill="#e4e4e7" opacity="0.3" />
          </g>
        );
      })}
    </svg>
  );
};
