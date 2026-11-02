import React from 'react';

interface ESP32RealisticProps {
  pinStates?: Record<string, { value: number; mode: string }>;
  isSimulating?: boolean;
}

export const ESP32Realistic: React.FC<ESP32RealisticProps> = ({
  pinStates = {},
  isSimulating = false,
}) => {
  // Built-in blue LED on GPIO 2
  const d2State = pinStates['D2']?.value || 0;
  const isBlueLedOn = d2State > 0;

  return (
    <svg
      width="200"
      height="320"
      viewBox="0 0 200 320"
      className="select-none filter drop-shadow-xl"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* ESP32 Black PCB Matte Gradient */}
        <linearGradient id="espPcbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#262626" />
          <stop offset="60%" stopColor="#171717" />
          <stop offset="100%" stopColor="#0a0a0a" />
        </linearGradient>

        {/* ESP-WROOM-32 Metal RF Shield */}
        <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="30%" stopColor="#9ca3af" />
          <stop offset="70%" stopColor="#d1d5db" />
          <stop offset="100%" stopColor="#6b7280" />
        </linearGradient>

        {/* Gold Silkscreen / Antenna */}
        <linearGradient id="goldAntennaGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Blue LED Glow Filter */}
        <filter id="ledGlowBlue" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* PCB Base Outline */}
      <rect
        x="8"
        y="10"
        width="184"
        height="300"
        rx="6"
        fill="url(#espPcbGrad)"
        stroke="#404040"
        strokeWidth="1.5"
      />

      {/* 4 Corner Mounting Holes */}
      {[
        { cx: 20, cy: 22 },
        { cx: 180, cy: 22 },
        { cx: 20, cy: 298 },
        { cx: 180, cy: 298 },
      ].map((h, i) => (
        <g key={i}>
          <circle cx={h.cx} cy={h.cy} r="4" fill="#9ca3af" />
          <circle cx={h.cx} cy={h.cy} r="2.5" fill="#09090b" />
        </g>
      ))}

      {/* PCB Trace Wi-Fi / Bluetooth Antenna (Top Section) */}
      <g id="antenna" transform="translate(48, 14)">
        <rect x="0" y="0" width="104" height="28" rx="2" fill="#1c1917" stroke="#78350f" strokeWidth="0.5" />
        {/* Meandering trace lines */}
        <path
          d="M 6 24 L 6 6 L 16 6 L 16 22 L 26 22 L 26 6 L 36 6 L 36 22 L 46 22 L 46 6 L 56 6 L 56 22 L 66 22 L 66 6 L 76 6 L 76 22 L 86 22 L 86 6 L 98 6 L 98 24"
          fill="none"
          stroke="url(#goldAntennaGrad)"
          strokeWidth="2.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
        />
      </g>

      {/* ESP-WROOM-32 Metallic RF Can / Shield */}
      <g id="rf-shield">
        <rect
          x="42"
          y="48"
          width="116"
          height="120"
          rx="3"
          fill="url(#shieldGrad)"
          stroke="#4b5563"
          strokeWidth="1.2"
        />
        {/* Espressif Logo & Text */}
        <text x="100" y="74" fontSize="11" fill="#1f2937" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
          ESPRESSIF
        </text>
        <text x="100" y="94" fontSize="13" fill="#111827" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="0.5">
          ESP-WROOM-32
        </text>
        <text x="100" y="110" fontSize="7" fill="#374151" fontFamily="monospace" textAnchor="middle">
          FCC ID: 2AC7Z-ESPWROOM32
        </text>
        <text x="100" y="122" fontSize="7" fill="#374151" fontFamily="sans-serif" textAnchor="middle">
          Wi-Fi + BT + BLE SoC
        </text>
        <text x="100" y="136" fontSize="6.5" fill="#4b5563" fontFamily="monospace" textAnchor="middle">
          CE 0700 · RoHS · 2.4GHz
        </text>
        {/* Ground tabs around shield */}
        {[55, 75, 95, 115, 135].map((y) => (
          <rect key={y} x="39" y={y} width="3" height="6" fill="#9ca3af" />
        ))}
        {[55, 75, 95, 115, 135].map((y) => (
          <rect key={y} x="158" y={y} width="3" height="6" fill="#9ca3af" />
        ))}
      </g>

      {/* CP2102 / CH340 USB-to-UART Bridge IC */}
      <g id="uart-ic">
        <rect x="85" y="186" width="30" height="30" rx="1" fill="#18181b" stroke="#3f3f46" strokeWidth="0.8" />
        <circle cx="89" cy="190" r="1.2" fill="#71717a" />
        <text x="100" y="202" fontSize="5" fill="#a1a1aa" fontFamily="monospace" textAnchor="middle">
          CP2102
        </text>
        <text x="100" y="210" fontSize="4.5" fill="#71717a" fontFamily="monospace" textAnchor="middle">
          SILABS
        </text>
      </g>

      {/* MicroUSB Connector (Bottom Center) */}
      <g id="microusb">
        <rect x="76" y="284" width="48" height="32" rx="2" fill="url(#shieldGrad)" stroke="#4b5563" strokeWidth="1" />
        <rect x="84" y="302" width="32" height="12" rx="2" fill="#09090b" />
        <rect x="90" y="306" width="20" height="4" fill="#9ca3af" />
      </g>

      {/* EN & BOOT Tactile Buttons */}
      <g id="buttons">
        {/* EN Button (Left) */}
        <rect x="42" y="260" width="20" height="18" rx="2" fill="#d1d5db" stroke="#6b7280" strokeWidth="0.8" />
        <circle cx="52" cy="269" r="4.5" fill="#18181b" />
        <text x="52" y="286" fontSize="6.5" fill="#fbbf24" fontWeight="bold" textAnchor="middle">
          EN
        </text>

        {/* BOOT Button (Right) */}
        <rect x="138" y="260" width="20" height="18" rx="2" fill="#d1d5db" stroke="#6b7280" strokeWidth="0.8" />
        <circle cx="148" cy="269" r="4.5" fill="#18181b" />
        <text x="148" y="286" fontSize="6.5" fill="#fbbf24" fontWeight="bold" textAnchor="middle">
          BOOT
        </text>
      </g>

      {/* Status LEDs: Red (PWR), Blue (GPIO 2) */}
      <g id="esp-leds">
        {/* Power LED (Red) */}
        <circle cx="70" cy="235" r="2" fill={isSimulating ? '#ef4444' : '#7f1d1d'} />
        <text x="70" y="244" fontSize="5" fill="#d4d4d8" textAnchor="middle">PWR</text>

        {/* GPIO 2 User LED (Blue) */}
        <circle
          cx="130"
          cy="235"
          r="2.5"
          fill={isBlueLedOn ? '#38bdf8' : '#0369a1'}
          filter={isBlueLedOn ? 'url(#ledGlowBlue)' : undefined}
        />
        <text x="130" y="244" fontSize="5" fill="#d4d4d8" textAnchor="middle">D2</text>
      </g>

      {/* LEFT PIN HEADER (15 Pins) */}
      <g id="left-header">
        <rect x="8" y="26" width="16" height="272" rx="1" fill="#09090b" stroke="#27272a" strokeWidth="1" />
        {[
          { id: '3V3', y: 36, label: '3V3' },
          { id: 'EN', y: 54, label: 'EN' },
          { id: 'VP', y: 72, label: 'VP' },
          { id: 'VN', y: 90, label: 'VN' },
          { id: 'D34', y: 108, label: '34' },
          { id: 'D35', y: 126, label: '35' },
          { id: 'D32', y: 144, label: '32' },
          { id: 'D33', y: 162, label: '33' },
          { id: 'D25', y: 180, label: '25' },
          { id: 'D26', y: 198, label: '26' },
          { id: 'D27', y: 216, label: '27' },
          { id: 'D14', y: 234, label: '14' },
          { id: 'D12', y: 252, label: '12' },
          { id: 'D13', y: 270, label: '13' },
          { id: 'GND1', y: 288, label: 'GND' },
        ].map((p) => {
          const state = pinStates[p.id];
          const isHigh = state && state.value > 0;
          return (
            <g key={p.id}>
              <rect x="11" y={p.y - 5} width="10" height="10" rx="1" fill="#18181b" stroke="#3f3f46" strokeWidth="0.5" />
              <circle cx="16" cy={p.y} r="2" fill="#fbbf24" />
              {isHigh && <circle cx="5" cy={p.y} r="1.5" fill="#38bdf8" />}
              <text x="28" y={p.y + 2.5} fontSize="6" fill="#f59e0b" fontWeight="600">
                {p.label}
              </text>
            </g>
          );
        })}
      </g>

      {/* RIGHT PIN HEADER (15 Pins) */}
      <g id="right-header">
        <rect x="176" y="26" width="16" height="272" rx="1" fill="#09090b" stroke="#27272a" strokeWidth="1" />
        {[
          { id: 'VIN', y: 36, label: 'VIN' },
          { id: 'GND2', y: 54, label: 'GND' },
          { id: 'D15', y: 72, label: '15' },
          { id: 'D2', y: 90, label: '2' },
          { id: 'D4', y: 108, label: '4' },
          { id: 'RX2', y: 126, label: '16' },
          { id: 'TX2', y: 144, label: '17' },
          { id: 'D5', y: 162, label: '5' },
          { id: 'D18', y: 180, label: '18' },
          { id: 'D19', y: 198, label: '19' },
          { id: 'D21', y: 216, label: '21' },
          { id: 'RX0', y: 234, label: '3' },
          { id: 'TX0', y: 252, label: '1' },
          { id: 'D22', y: 270, label: '22' },
          { id: 'D23', y: 288, label: '23' },
        ].map((p) => {
          const state = pinStates[p.id];
          const isHigh = state && state.value > 0;
          return (
            <g key={p.id}>
              <rect x="179" y={p.y - 5} width="10" height="10" rx="1" fill="#18181b" stroke="#3f3f46" strokeWidth="0.5" />
              <circle cx="184" cy={p.y} r="2" fill="#fbbf24" />
              {isHigh && <circle cx="195" cy={p.y} r="1.5" fill="#38bdf8" />}
              <text x="172" y={p.y + 2.5} fontSize="6" fill="#f59e0b" fontWeight="600" textAnchor="end">
                {p.label}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
};
