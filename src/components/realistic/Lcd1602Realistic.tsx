import React from 'react';

interface Lcd1602RealisticProps {
  lines?: [string, string];
  backlight?: boolean;
}

export const Lcd1602Realistic: React.FC<Lcd1602RealisticProps> = ({
  lines = ['  ElectroSim 1.0 ', 'Arduino & ESP32 '],
  backlight = true,
}) => {
  const line1 = (lines[0] || '').padEnd(16, ' ').slice(0, 16);
  const line2 = (lines[1] || '').padEnd(16, ' ').slice(0, 16);

  return (
    <svg
      width="270"
      height="125"
      viewBox="0 0 270 125"
      className="select-none filter drop-shadow-xl"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* PCB Blue Gradient */}
        <linearGradient id="lcdPcbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0369a1" />
          <stop offset="100%" stopColor="#075985" />
        </linearGradient>

        {/* LCD Screen Glass (Blue Backlight) */}
        <linearGradient id="lcdGlassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={backlight ? '#1d4ed8' : '#0f172a'} />
          <stop offset="50%" stopColor={backlight ? '#2563eb' : '#090d16'} />
          <stop offset="100%" stopColor={backlight ? '#1e40af' : '#020617'} />
        </linearGradient>

        {/* Metal Bezel */}
        <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Gold Pins */}
        <linearGradient id="lcdGoldPin" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Main PCB Board */}
      <rect x="28" y="10" width="232" height="105" rx="4" fill="url(#lcdPcbGrad)" stroke="#0284c7" strokeWidth="1" />

      {/* 4 Corner Mounting Holes */}
      {[
        { cx: 36, cy: 18 },
        { cx: 252, cy: 18 },
        { cx: 36, cy: 107 },
        { cx: 252, cy: 107 },
      ].map((h, i) => (
        <g key={i}>
          <circle cx={h.cx} cy={h.cy} r="4.5" fill="#94a3b8" />
          <circle cx={h.cx} cy={h.cy} r="2.5" fill="#020617" />
        </g>
      ))}

      {/* Metal Bezel around glass */}
      <rect x="48" y="24" width="192" height="76" rx="2" fill="url(#bezelGrad)" stroke="#475569" strokeWidth="1" />
      {/* Retention metal tabs on bezel */}
      {[60, 110, 160, 210].map((x) => (
        <rect key={x} x={x} y="22" width="12" height="3" fill="#64748b" />
      ))}
      {[60, 110, 160, 210].map((x) => (
        <rect key={x} x={x} y="99" width="12" height="3" fill="#64748b" />
      ))}

      {/* LCD Glass Screen Area */}
      <rect x="58" y="32" width="172" height="60" rx="1" fill="url(#lcdGlassGrad)" stroke="#1e3a8a" strokeWidth="1" />

      {/* 16x2 Character Matrix Background Grid (Faint 5x8 pixel blocks) */}
      {Array.from({ length: 16 }).map((_, c) => (
        <g key={c}>
          <rect
            x={64 + c * 10}
            y="40"
            width="8"
            height="18"
            fill={backlight ? '#1e40af' : '#090d16'}
            opacity="0.5"
          />
          <rect
            x={64 + c * 10}
            y="64"
            width="8"
            height="18"
            fill={backlight ? '#1e40af' : '#090d16'}
            opacity="0.5"
          />
        </g>
      ))}

      {/* ACTUAL TEXT RENDERING: Line 1 and Line 2 */}
      <text
        x="64"
        y="54"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="12.5"
        fontWeight="bold"
        fill={backlight ? '#ffffff' : '#334155'}
        letterSpacing="2.2"
        style={{
          filter: backlight ? 'drop-shadow(0 0 2px rgba(255,255,255,0.7))' : undefined,
        }}
      >
        {line1}
      </text>

      <text
        x="64"
        y="78"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="12.5"
        fontWeight="bold"
        fill={backlight ? '#ffffff' : '#334155'}
        letterSpacing="2.2"
        style={{
          filter: backlight ? 'drop-shadow(0 0 2px rgba(255,255,255,0.7))' : undefined,
        }}
      >
        {line2}
      </text>

      {/* I2C Backpack Board on the Left (PCF8574 I2C adapter) */}
      <g id="i2c-backpack">
        <rect x="6" y="36" width="24" height="72" rx="2" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
        {/* Blue Trimmer Potentiometer for Contrast */}
        <rect x="10" y="40" width="16" height="14" rx="1" fill="#0284c7" />
        <circle cx="18" cy="47" r="3" fill="#f8fafc" />
        {/* 4 Header Pins (GND, VCC, SDA, SCL) */}
        {[
          { id: 'scl', y: 48, label: 'SCL' },
          { id: 'sda', y: 64, label: 'SDA' },
          { id: 'vcc', y: 80, label: 'VCC' },
          { id: 'gnd', y: 96, label: 'GND' },
        ].map((p) => (
          <g key={p.id}>
            <circle cx="18" cy={p.y} r="2.8" fill="url(#lcdGoldPin)" stroke="#b45309" strokeWidth="0.5" />
            <text x="2" y={p.y + 2.5} fontSize="5" fill="#fde047" fontWeight="bold" textAnchor="end">
              {p.label}
            </text>
          </g>
        ))}
      </g>
    </svg>
  );
};
