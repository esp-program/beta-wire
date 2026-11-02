import React from 'react';

interface Dht11RealisticProps {
  temperature?: number;
  humidity?: number;
  onChangeTemp?: (t: number) => void;
  onChangeHum?: (h: number) => void;
}

export const Dht11Realistic: React.FC<Dht11RealisticProps> = ({
  temperature = 24,
  humidity = 55,
  onChangeTemp,
  onChangeHum,
}) => {
  return (
    <svg
      width="75"
      height="105"
      viewBox="0 0 75 105"
      className="select-none filter drop-shadow-md"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* DHT11 Signature Blue Plastic Body */}
        <linearGradient id="dhtBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="40%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        <linearGradient id="dhtPinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* 3 Header Pins at bottom (VCC, DATA, GND) */}
      {[
        { id: 'vcc', x: 20, label: '+' },
        { id: 'data', x: 38, label: 'out' },
        { id: 'gnd', x: 56, label: '-' },
      ].map((p) => (
        <g key={p.id}>
          <rect x={p.x - 2} y="76" width="4" height="22" rx="1" fill="url(#dhtPinGrad)" />
          <circle cx={p.x} cy="98" r="2.8" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
          <text x={p.x} y="74" fontSize="5" fill="#f8fafc" fontWeight="bold" textAnchor="middle">
            {p.label}
          </text>
        </g>
      ))}

      {/* Main Blue Ventilated Grille Housing */}
      <rect x="8" y="8" width="58" height="66" rx="4" fill="url(#dhtBlueGrad)" stroke="#0284c7" strokeWidth="1" />

      {/* Vent Grille Slots */}
      {Array.from({ length: 4 }).map((_, r) => (
        <g key={r}>
          <rect x="16" y={16 + r * 10} width="18" height="4" rx="1.5" fill="#0369a1" />
          <rect x="40" y={16 + r * 10} width="18" height="4" rx="1.5" fill="#0369a1" />
        </g>
      ))}

      {/* Internal Sensing Element visible behind slots */}
      <rect x="22" y="22" width="30" height="20" rx="1" fill="#f8fafc" opacity="0.3" />

      {/* Silkscreen text */}
      <text x="37" y="62" fontSize="6.5" fill="#ffffff" fontWeight="bold" textAnchor="middle">
        DHT11
      </text>

      {/* Live Readouts Tag on Top */}
      <g
        cursor="pointer"
        onClick={(e) => {
          e.stopPropagation();
          const nextT = temperature >= 35 ? 18 : temperature + 4;
          const nextH = humidity >= 80 ? 40 : humidity + 10;
          onChangeTemp?.(nextT);
          onChangeHum?.(nextH);
        }}
      >
        <rect x="10" y="0" width="54" height="9" rx="4.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.6" />
        <text x="37" y="6.5" fontSize="5" fill="#38bdf8" fontWeight="bold" textAnchor="middle">
          {temperature}°C · {humidity}%
        </text>
      </g>
    </svg>
  );
};
