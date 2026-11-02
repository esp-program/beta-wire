import React from 'react';

interface PirRealisticProps {
  motionDetected?: boolean;
  onToggleMotion?: (m: boolean) => void;
}

export const PirRealistic: React.FC<PirRealisticProps> = ({
  motionDetected = false,
  onToggleMotion,
}) => {
  return (
    <svg
      width="105"
      height="105"
      viewBox="0 0 105 105"
      className="select-none filter drop-shadow-md"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* PCB Green Gradient */}
        <linearGradient id="pirPcbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#166534" />
        </linearGradient>

        {/* White Fresnel Lens Dome Gradient */}
        <radialGradient id="fresnelGrad" cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#f1f5f9" />
          <stop offset="85%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </radialGradient>
      </defs>

      {/* 3 Header Pins at bottom (VCC, OUT, GND) */}
      {[
        { id: 'vcc', x: 32, label: 'VCC' },
        { id: 'out', x: 52, label: 'OUT' },
        { id: 'gnd', x: 72, label: 'GND' },
      ].map((p) => (
        <g key={p.id}>
          <rect x={p.x - 2} y="78" width="4" height="20" rx="1" fill="#cbd5e1" />
          <circle cx={p.x} cy="96" r="2.8" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
          <text x={p.x} y="74" fontSize="5" fill="#ffffff" fontWeight="bold" textAnchor="middle">
            {p.label}
          </text>
        </g>
      ))}

      {/* Rectangular Green PCB Base */}
      <rect x="12" y="10" width="81" height="66" rx="4" fill="url(#pirPcbGrad)" stroke="#14532d" strokeWidth="1" />

      {/* Dual Orange/Blue Trimmer Pots for Sensitivity & Delay Time */}
      <rect x="16" y="16" width="10" height="12" rx="1" fill="#ea580c" />
      <circle cx="21" cy="22" r="2.5" fill="#f8fafc" />
      <rect x="79" y="16" width="10" height="12" rx="1" fill="#ea580c" />
      <circle cx="84" cy="22" r="2.5" fill="#f8fafc" />

      {/* Hemispherical White Faceted Fresnel Lens Dome */}
      <g
        cursor="pointer"
        onClick={(e) => {
          e.stopPropagation();
          onToggleMotion?.(!motionDetected);
        }}
      >
        <circle cx="52.5" cy="42" r="24" fill="url(#fresnelGrad)" stroke="#94a3b8" strokeWidth="1" />

        {/* Faceted Fresnel Honeycomb Grid Lines */}
        <circle cx="52.5" cy="42" r="17" fill="none" stroke="#94a3b8" strokeWidth="0.6" strokeDasharray="2 2" />
        <circle cx="52.5" cy="42" r="10" fill="none" stroke="#94a3b8" strokeWidth="0.6" />
        <line x1="28.5" y1="42" x2="76.5" y2="42" stroke="#94a3b8" strokeWidth="0.5" />
        <line x1="52.5" y1="18" x2="52.5" y2="66" stroke="#94a3b8" strokeWidth="0.5" />

        {/* Motion Detection Glow Dot */}
        {motionDetected && (
          <circle cx="52.5" cy="42" r="6" fill="#ef4444" className="animate-pulse" />
        )}
      </g>

      {/* Detection State Tag */}
      <text
        x="52.5"
        y="6"
        fontSize="5.5"
        fill={motionDetected ? '#ef4444' : '#94a3b8'}
        fontWeight="bold"
        textAnchor="middle"
      >
        {motionDetected ? '● MOVIMIENTO ACTIVO' : 'PIR STANDBY'}
      </text>
    </svg>
  );
};
