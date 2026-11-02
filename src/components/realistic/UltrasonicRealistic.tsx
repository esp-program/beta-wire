import React from 'react';

interface UltrasonicRealisticProps {
  distance?: number; // 2 to 400 cm
  onChangeDistance?: (dist: number) => void;
}

export const UltrasonicRealistic: React.FC<UltrasonicRealisticProps> = ({
  distance = 45,
  onChangeDistance,
}) => {
  return (
    <svg
      width="170"
      height="95"
      viewBox="0 0 170 95"
      className="select-none filter drop-shadow-xl"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* PCB Blue */}
        <linearGradient id="hcPcbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </linearGradient>

        {/* Metal Cylinder Gradient */}
        <linearGradient id="metalCylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="30%" stopColor="#e2e8f0" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* Transducer Mesh Pattern */}
        <pattern id="meshPattern" width="4" height="4" patternUnits="userSpaceOnUse">
          <path d="M 0 2 L 4 2 M 2 0 L 2 4" stroke="#475569" strokeWidth="0.6" />
        </pattern>
      </defs>

      {/* Blue Substrate Board */}
      <rect x="10" y="8" width="150" height="72" rx="4" fill="url(#hcPcbGrad)" stroke="#075985" strokeWidth="1.2" />

      {/* Silkscreen text */}
      <text x="85" y="20" fontSize="8" fill="#ffffff" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
        HC-SR04
      </text>

      {/* Quartz Crystal (Silver Can between the cylinders) */}
      <rect x="80" y="26" width="10" height="20" rx="4" fill="url(#metalCylinderGrad)" stroke="#475569" strokeWidth="0.6" />
      <text x="85" y="38" fontSize="4" fill="#334155" textAnchor="middle">4.00</text>

      {/* Ultrasonic Transmitter "T" (Left Cylinder) */}
      <g id="transducer-t">
        <circle cx="44" cy="44" r="24" fill="url(#metalCylinderGrad)" stroke="#475569" strokeWidth="1" />
        <circle cx="44" cy="44" r="21" fill="#1e293b" />
        <circle cx="44" cy="44" r="20" fill="url(#meshPattern)" />
        {/* Piezo center disc */}
        <circle cx="44" cy="44" r="8" fill="url(#metalCylinderGrad)" stroke="#64748b" strokeWidth="0.5" />
        <text x="44" y="47" fontSize="9" fill="#0f172a" fontWeight="bold" textAnchor="middle">T</text>
      </g>

      {/* Ultrasonic Receiver "R" (Right Cylinder) */}
      <g id="transducer-r">
        <circle cx="126" cy="44" r="24" fill="url(#metalCylinderGrad)" stroke="#475569" strokeWidth="1" />
        <circle cx="126" cy="44" r="21" fill="#1e293b" />
        <circle cx="126" cy="44" r="20" fill="url(#meshPattern)" />
        {/* Piezo center disc */}
        <circle cx="126" cy="44" r="8" fill="url(#metalCylinderGrad)" stroke="#64748b" strokeWidth="0.5" />
        <text x="126" y="47" fontSize="9" fill="#0f172a" fontWeight="bold" textAnchor="middle">R</text>
      </g>

      {/* 4 Bottom Pins Header */}
      <rect x="56" y="76" width="58" height="12" rx="1" fill="#0f172a" stroke="#1e293b" strokeWidth="0.8" />
      {[
        { id: 'vcc', x: 64, label: 'Vcc' },
        { id: 'trig', x: 78, label: 'Trig' },
        { id: 'echo', x: 92, label: 'Echo' },
        { id: 'gnd', x: 106, label: 'Gnd' },
      ].map((p) => (
        <g key={p.id}>
          <circle cx={p.x} cy="86" r="2.5" fill="#fde047" stroke="#b45309" strokeWidth="0.5" />
          <text x={p.x} y="74" fontSize="5.5" fill="#ffffff" fontWeight="600" textAnchor="middle">
            {p.label}
          </text>
        </g>
      ))}

      {/* Interactive Distance Tag on Top */}
      <g
        cursor="ew-resize"
        onClick={(e) => {
          e.stopPropagation();
          const newD = distance < 100 ? 150 : distance < 250 ? 320 : 25;
          onChangeDistance?.(newD);
        }}
      >
        <rect x="58" y="2" width="54" height="12" rx="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
        <text x="85" y="11" fontSize="7" fill="#38bdf8" fontWeight="bold" textAnchor="middle">
          {distance} cm
        </text>
      </g>
    </svg>
  );
};
