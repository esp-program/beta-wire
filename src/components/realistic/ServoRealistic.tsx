import React from 'react';

interface ServoRealisticProps {
  angle?: number; // 0 to 180 degrees
}

export const ServoRealistic: React.FC<ServoRealisticProps> = ({ angle = 90 }) => {
  // Clamp angle
  const clamped = Math.min(180, Math.max(0, angle));
  // Horn rotation: maps 0..180 to -90..+90
  const hornRot = clamped - 90;

  return (
    <svg
      width="150"
      height="140"
      viewBox="0 0 150 140"
      className="select-none filter drop-shadow-xl"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Transparent Blue Body */}
        <linearGradient id="servoBlueCase" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#2563eb" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.95" />
        </linearGradient>

        {/* Nylon White Horn */}
        <linearGradient id="hornGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Brass Eyelet */}
        <linearGradient id="brassEyelet" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="50%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#92400e" />
        </linearGradient>
      </defs>

      {/* 3-Wire Ribbon Cable (Brown, Red, Orange) coming out of side/bottom */}
      <g id="ribbon-cable">
        {/* Brown (GND) */}
        <path d="M 35 106 C 30 115, 30 125, 35 130" stroke="#78350f" strokeWidth="3" fill="none" />
        <circle cx="35" cy="130" r="2.5" fill="#94a3b8" />
        {/* Red (5V) */}
        <path d="M 45 106 C 42 115, 42 125, 50 130" stroke="#dc2626" strokeWidth="3" fill="none" />
        <circle cx="50" cy="130" r="2.5" fill="#fde047" />
        {/* Orange (PWM) */}
        <path d="M 55 106 C 54 115, 54 125, 65 130" stroke="#f97316" strokeWidth="3" fill="none" />
        <circle cx="65" cy="130" r="2.5" fill="#38bdf8" />
      </g>

      {/* Mounting Wings / Tabs (Left and Right) */}
      <rect x="8" y="58" width="134" height="12" rx="2" fill="url(#servoBlueCase)" stroke="#1d4ed8" strokeWidth="0.8" />
      {/* Brass Mounting Eyelets */}
      <circle cx="16" cy="64" r="3.5" fill="url(#brassEyelet)" />
      <circle cx="16" cy="64" r="2" fill="#090d16" />
      <circle cx="134" cy="64" r="3.5" fill="url(#brassEyelet)" />
      <circle cx="134" cy="64" r="2" fill="#090d16" />

      {/* Main Blue Rectangular Body */}
      <rect x="26" y="32" width="98" height="74" rx="4" fill="url(#servoBlueCase)" stroke="#1e3a8a" strokeWidth="1.2" />

      {/* Visible Internal Gear Silhouettes */}
      <circle cx="50" cy="50" r="16" fill="#ffffff" opacity="0.15" />
      <circle cx="75" cy="62" r="12" fill="#ffffff" opacity="0.12" />
      <circle cx="95" cy="72" r="14" fill="#ffffff" opacity="0.1" />

      {/* Brand Sticker */}
      <rect x="36" y="70" width="78" height="26" rx="2" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
      <text x="75" y="82" fontSize="7" fill="#ffffff" fontWeight="bold" textAnchor="middle">
        TowerPro SG90
      </text>
      <text x="75" y="91" fontSize="5.5" fill="#38bdf8" textAnchor="middle">
        Micro Servo 9g · 180°
      </text>

      {/* Output Spline Shaft Base (Circular Hub) */}
      <circle cx="50" cy="50" r="14" fill="#1e3a8a" stroke="#172554" strokeWidth="1" />
      <circle cx="50" cy="50" r="11" fill="url(#hornGrad)" />

      {/* ROTATING WHITE NYLON SERVO HORN (Animates to real angle) */}
      <g
        transform={`rotate(${hornRot} 50 50)`}
        style={{ transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)' }}
      >
        {/* Cross / Horn arm shape */}
        <path
          d="M 50 20 
             C 46 20, 44 44, 44 50 
             C 44 56, 46 80, 50 80 
             C 54 80, 56 56, 56 50 
             C 56 44, 54 20, 50 20 Z"
          fill="url(#hornGrad)"
          stroke="#94a3b8"
          strokeWidth="1"
        />
        {/* Horizontal short wings */}
        <path
          d="M 28 50 
             C 28 47, 44 47, 50 47 
             C 56 47, 72 47, 72 50 
             C 72 53, 56 53, 50 53 
             C 44 53, 28 53, 28 50 Z"
          fill="url(#hornGrad)"
          stroke="#94a3b8"
          strokeWidth="0.8"
        />

        {/* Linkage holes on horn arms */}
        <circle cx="50" cy="26" r="1.5" fill="#475569" />
        <circle cx="50" cy="34" r="1.5" fill="#475569" />
        <circle cx="50" cy="66" r="1.5" fill="#475569" />
        <circle cx="50" cy="74" r="1.5" fill="#475569" />
        <circle cx="34" cy="50" r="1.5" fill="#475569" />
        <circle cx="66" cy="50" r="1.5" fill="#475569" />

        {/* Center Metal Retention Screw */}
        <circle cx="50" cy="50" r="4" fill="#cbd5e1" stroke="#475569" strokeWidth="0.5" />
        {/* Phillips screw head cross */}
        <line x1="48" y1="50" x2="52" y2="50" stroke="#334155" strokeWidth="1" />
        <line x1="50" y1="48" x2="50" y2="52" stroke="#334155" strokeWidth="1" />
      </g>

      {/* Angle Readout Tag */}
      <text x="110" y="24" fontSize="7" fill="#38bdf8" fontWeight="bold">
        {clamped}°
      </text>
    </svg>
  );
};
