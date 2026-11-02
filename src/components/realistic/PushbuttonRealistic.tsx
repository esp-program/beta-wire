import React from 'react';

interface PushbuttonRealisticProps {
  isPressed?: boolean;
  onPressChange?: (pressed: boolean) => void;
}

export const PushbuttonRealistic: React.FC<PushbuttonRealisticProps> = ({
  isPressed = false,
  onPressChange,
}) => {
  return (
    <svg
      width="70"
      height="70"
      viewBox="0 0 70 70"
      className="select-none filter drop-shadow-md"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Metal Bracket Gradient */}
        <linearGradient id="btnMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Plunger Button Gradient */}
        <radialGradient id="plungerGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor={isPressed ? '#ef4444' : '#f87171'} />
          <stop offset="60%" stopColor={isPressed ? '#b91c1c' : '#dc2626'} />
          <stop offset="100%" stopColor="#7f1d1d" />
        </radialGradient>
      </defs>

      {/* 4 Corner Solder Terminals (1a, 1b, 2a, 2b) */}
      {[
        { x: 14, y: 16, id: '1a' },
        { x: 56, y: 16, id: '1b' },
        { x: 14, y: 54, id: '2a' },
        { x: 56, y: 54, id: '2b' },
      ].map((p) => (
        <g key={p.id}>
          <rect x={p.x - 3} y={p.y - 3} width="6" height="6" rx="1" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
          <circle cx={p.x} cy={p.y} r="2.2" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
        </g>
      ))}

      {/* Stamped Metal Bracket Cover */}
      <rect x="18" y="18" width="34" height="34" rx="3" fill="url(#btnMetalGrad)" stroke="#64748b" strokeWidth="1" />

      {/* 4 Corner Stamped Rivets */}
      <circle cx="21" cy="21" r="1.5" fill="#475569" />
      <circle cx="49" cy="21" r="1.5" fill="#475569" />
      <circle cx="21" cy="49" r="1.5" fill="#475569" />
      <circle cx="49" cy="49" r="1.5" fill="#475569" />

      {/* Circular Button Well / Bezel */}
      <circle cx="35" cy="35" r="12" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />

      {/* Interactive Plunger Button (Clickable!) */}
      <g
        cursor="pointer"
        onPointerDown={(e) => {
          e.stopPropagation();
          onPressChange?.(true);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          onPressChange?.(false);
        }}
        onPointerLeave={() => {
          if (isPressed) onPressChange?.(false);
        }}
      >
        <circle
          cx="35"
          cy={isPressed ? 36 : 35}
          r={isPressed ? 9 : 9.5}
          fill="url(#plungerGrad)"
          stroke="#991b1b"
          strokeWidth="0.8"
          style={{ transition: 'all 0.08s ease' }}
        />
        {/* Button top glare */}
        <circle cx="33" cy={isPressed ? 34 : 33} r="3" fill="#ffffff" opacity="0.3" />
      </g>
    </svg>
  );
};
