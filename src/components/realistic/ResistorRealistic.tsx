import React from 'react';

interface ResistorRealisticProps {
  resistance?: number; // in Ohms (e.g. 220, 1000, 10000)
}

const COLOR_CODES: Record<number, string> = {
  0: '#18181b', // Black
  1: '#78350f', // Brown
  2: '#dc2626', // Red
  3: '#ea580c', // Orange
  4: '#facc15', // Yellow
  5: '#16a34a', // Green
  6: '#2563eb', // Blue
  7: '#9333ea', // Violet
  8: '#64748b', // Grey
  9: '#ffffff', // White
};

/**
 * Computes the 4-band EIA color code for a given resistance in ohms.
 */
function getResistorBands(ohms: number): [string, string, string, string] {
  if (ohms <= 0) return [COLOR_CODES[0], COLOR_CODES[0], COLOR_CODES[0], '#d97706'];

  const s = ohms.toString();
  const d1 = parseInt(s[0], 10) || 0;
  const d2 = parseInt(s[1] || '0', 10);
  const multiplier = Math.floor(Math.log10(ohms)) - 1;

  const band1 = COLOR_CODES[d1] || COLOR_CODES[2];
  const band2 = COLOR_CODES[d2] || COLOR_CODES[2];
  const band3 = COLOR_CODES[Math.max(0, multiplier)] || COLOR_CODES[1];
  const tolerance = '#d97706'; // 5% Gold

  return [band1, band2, band3, tolerance];
}

export const ResistorRealistic: React.FC<ResistorRealisticProps> = ({
  resistance = 220,
}) => {
  const [b1, b2, b3, b4] = getResistorBands(resistance);

  const formattedValue =
    resistance >= 1000000
      ? `${(resistance / 1000000).toFixed(1)}MΩ`
      : resistance >= 1000
      ? `${(resistance / 1000).toFixed(resistance % 1000 === 0 ? 0 : 1)}kΩ`
      : `${resistance}Ω`;

  return (
    <svg
      width="110"
      height="42"
      viewBox="0 0 110 42"
      className="select-none filter drop-shadow-md"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Metal Axial Lead Gradient */}
        <linearGradient id="resistorLeadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="50%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* Resistor Ceramic Body Gradient */}
        <linearGradient id="resistorBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e7d4b5" />
          <stop offset="35%" stopColor="#f4ede0" />
          <stop offset="70%" stopColor="#d4be9b" />
          <stop offset="100%" stopColor="#9a815a" />
        </linearGradient>
      </defs>

      {/* Left Axial Wire Lead */}
      <line x1="8" y1="21" x2="32" y2="21" stroke="url(#resistorLeadGrad)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="12" cy="21" r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />

      {/* Right Axial Wire Lead */}
      <line x1="78" y1="21" x2="102" y2="21" stroke="url(#resistorLeadGrad)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="98" cy="21" r="2.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.5" />

      {/* Resistor Body with Bulbous Ends */}
      <path
        d="M 32 14 
           C 30 14, 29 18, 29 21 
           C 29 24, 30 28, 32 28 
           L 38 27 
           L 72 27 
           L 78 28 
           C 80 28, 81 24, 81 21 
           C 81 18, 80 14, 78 14 
           L 72 15 
           L 38 15 
           Z"
        fill="url(#resistorBodyGrad)"
        stroke="#854d0e"
        strokeWidth="0.8"
      />

      {/* Color Band 1 (Digit 1) */}
      <rect x="37" y="14.5" width="4.5" height="13" fill={b1} rx="0.5" />

      {/* Color Band 2 (Digit 2) */}
      <rect x="46" y="14.5" width="4.5" height="13" fill={b2} rx="0.5" />

      {/* Color Band 3 (Multiplier) */}
      <rect x="55" y="14.5" width="4.5" height="13" fill={b3} rx="0.5" />

      {/* Color Band 4 (Tolerance - Gold) */}
      <rect x="67" y="14.5" width="4.5" height="13" fill={b4} rx="0.5" />

      {/* Specular Highlight along top edge */}
      <line x1="33" y1="16" x2="77" y2="16" stroke="#ffffff" strokeWidth="1" opacity="0.6" strokeLinecap="round" />

      {/* Value Tag Label underneath */}
      <text x="55" y="38" fontSize="7" fill="#cbd5e1" fontWeight="bold" textAnchor="middle">
        {formattedValue}
      </text>
    </svg>
  );
};
