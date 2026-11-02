import React from 'react';

interface BuzzerRealisticProps {
  isPlaying?: boolean;
  freq?: number;
}

export const BuzzerRealistic: React.FC<BuzzerRealisticProps> = ({
  isPlaying = false,
  freq = 0,
}) => {
  return (
    <svg
      width="80"
      height="85"
      viewBox="0 0 80 85"
      className="select-none filter drop-shadow-md"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Buzzer Plastic Cylinder */}
        <radialGradient id="buzzerCaseGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="60%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#090d16" />
        </radialGradient>

        <linearGradient id="buzzerLead" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
      </defs>

      {/* Acoustic wave rings when buzzing */}
      {isPlaying && (
        <g opacity="0.8">
          <circle cx="40" cy="38" r="36" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" className="animate-ping" />
          <circle cx="40" cy="38" r="30" fill="none" stroke="#38bdf8" strokeWidth="1.2" opacity="0.6" />
        </g>
      )}

      {/* Two Metallic Leads at bottom */}
      {/* Positive (+) */}
      <rect x="24" y="56" width="4" height="20" rx="1" fill="url(#buzzerLead)" />
      <circle cx="26" cy="76" r="2.8" fill="#f59e0b" stroke="#b45309" strokeWidth="0.5" />
      <text x="26" y="54" fontSize="6.5" fill="#ef4444" fontWeight="bold" textAnchor="middle">+</text>

      {/* Negative (-) */}
      <rect x="52" y="56" width="4" height="20" rx="1" fill="url(#buzzerLead)" />
      <circle cx="54" cy="76" r="2.8" fill="#94a3b8" stroke="#475569" strokeWidth="0.5" />
      <text x="54" y="54" fontSize="8" fill="#94a3b8" fontWeight="bold" textAnchor="middle">-</text>

      {/* Main Cylindrical Piezo Casing */}
      <circle cx="40" cy="38" r="30" fill="url(#buzzerCaseGrad)" stroke="#334155" strokeWidth="1.5" />
      <circle cx="40" cy="38" r="26" fill="#18181b" stroke="#090d16" strokeWidth="1" />

      {/* Central Acoustic Aperture / Sound Hole */}
      <circle cx="40" cy="38" r="8" fill="#020617" stroke="#334155" strokeWidth="1" />
      <circle cx="40" cy="38" r="4" fill="#000000" />

      {/* Top Label & Frequency */}
      <text x="40" y="20" fontSize="5.5" fill="#94a3b8" fontWeight="600" textAnchor="middle">
        PIEZO BUZZER
      </text>
      {isPlaying && (
        <text x="40" y="57" fontSize="6" fill="#38bdf8" fontWeight="bold" textAnchor="middle">
          {freq} Hz
        </text>
      )}
    </svg>
  );
};
