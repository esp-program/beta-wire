import React from 'react';

interface PotentiometerRealisticProps {
  value?: number; // 0 to 1023
  onChange?: (val: number) => void;
}

export const PotentiometerRealistic: React.FC<PotentiometerRealisticProps> = ({
  value = 512,
  onChange,
}) => {
  // Angle from -135deg (0) to +135deg (1023)
  const angle = -135 + (value / 1023) * 270;
  const voltage = ((value / 1023) * 5.0).toFixed(2);

  const handlePointerDown = (e: React.PointerEvent<SVGGElement>) => {
    e.stopPropagation();
    const startY = e.clientY;
    const startVal = value;

    const handlePointerMove = (moveEv: PointerEvent) => {
      const delta = (startY - moveEv.clientY) * 4;
      const newVal = Math.min(1023, Math.max(0, Math.round(startVal + delta)));
      onChange?.(newVal);
    };

    const handlePointerUp = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  return (
    <svg
      width="100"
      height="110"
      viewBox="0 0 100 110"
      className="select-none filter drop-shadow-lg"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Pot Metal Casing */}
        <radialGradient id="potCaseGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="60%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>

        {/* Knob Metallic / Blue Gradient */}
        <radialGradient id="knobGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="40%" stopColor="#0284c7" />
          <stop offset="85%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#082f49" />
        </radialGradient>

        {/* Solder Lug Metallic Gradient */}
        <linearGradient id="lugGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* 3 Solder Lugs / Terminals at Bottom */}
      {/* VCC */}
      <rect x="22" y="74" width="4" height="26" rx="1" fill="url(#lugGrad)" stroke="#475569" strokeWidth="0.5" />
      <circle cx="24" cy="100" r="3" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />
      <text x="24" y="72" fontSize="5.5" fill="#f87171" fontWeight="bold" textAnchor="middle">VCC</text>

      {/* Wiper (Signal) */}
      <rect x="48" y="74" width="4" height="26" rx="1" fill="url(#lugGrad)" stroke="#475569" strokeWidth="0.5" />
      <circle cx="50" cy="100" r="3" fill="#38bdf8" stroke="#0284c7" strokeWidth="0.5" />
      <text x="50" y="72" fontSize="5.5" fill="#38bdf8" fontWeight="bold" textAnchor="middle">SIG</text>

      {/* GND */}
      <rect x="74" y="74" width="4" height="26" rx="1" fill="url(#lugGrad)" stroke="#475569" strokeWidth="0.5" />
      <circle cx="76" cy="100" r="3" fill="#94a3b8" stroke="#475569" strokeWidth="0.5" />
      <text x="76" y="72" fontSize="5.5" fill="#94a3b8" fontWeight="bold" textAnchor="middle">GND</text>

      {/* Potentiometer Circular Metal Case */}
      <circle cx="50" cy="40" r="34" fill="url(#potCaseGrad)" stroke="#334155" strokeWidth="1.5" />

      {/* Mounting Thread Bushing & Hex Nut */}
      <circle cx="50" cy="40" r="26" fill="#64748b" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Hex nut polygon */}
      <polygon
        points="50,18 69,29 69,51 50,62 31,51 31,29"
        fill="#94a3b8"
        stroke="#475569"
        strokeWidth="0.8"
      />

      {/* Interactive Rotary Knob Body */}
      <g
        cursor="ns-resize"
        onPointerDown={handlePointerDown}
        transform={`rotate(${angle} 50 40)`}
      >
        <circle cx="50" cy="40" r="20" fill="url(#knobGrad)" stroke="#0284c7" strokeWidth="1" />
        {/* Knurled grip grooves */}
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="21"
            x2="50"
            y2="24"
            stroke="#082f49"
            strokeWidth="1.2"
            transform={`rotate(${i * 30} 50 40)`}
          />
        ))}
        {/* Indicator Line / Pointer Notch */}
        <line x1="50" y1="22" x2="50" y2="34" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="50" cy="24" r="1.5" fill="#fde047" />
      </g>

      {/* Center Value Badge */}
      <g pointerEvents="none">
        <text x="50" y="7" fontSize="7" fill="#cbd5e1" fontWeight="bold" textAnchor="middle">
          {value} ({voltage}V)
        </text>
      </g>
    </svg>
  );
};
