import React from 'react';

interface ArduinoUnoRealisticProps {
  pinStates?: Record<string, { value: number; mode: string }>;
  isSimulating?: boolean;
}

export const ArduinoUnoRealistic: React.FC<ArduinoUnoRealisticProps> = ({
  pinStates = {},
  isSimulating = false,
}) => {
  // Built-in LED on D13
  const d13State = pinStates['D13']?.value || 0;
  const isLOn = d13State > 0;
  // RX / TX blinking simulation
  const isTxRxActive = isSimulating;

  return (
    <svg
      width="380"
      height="260"
      viewBox="0 0 380 260"
      className="select-none filter drop-shadow-xl"
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* PCB Blue Gradient */}
        <linearGradient id="unoPcbGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#028491" />
          <stop offset="60%" stopColor="#00727d" />
          <stop offset="100%" stopColor="#005d66" />
        </linearGradient>

        {/* Metallic USB Jack */}
        <linearGradient id="metalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="30%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>

        {/* DC Barrel Jack */}
        <linearGradient id="blackPlasticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="50%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        {/* Gold Plated Pins */}
        <linearGradient id="goldPinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* LED Glow Filter */}
        <filter id="ledGlowAmber" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="ledGlowGreen" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* PCB Base Outline with Realistic Notches */}
      <path
        d="M 12 12 
           L 368 12 
           A 6 6 0 0 1 374 18 
           L 374 242 
           A 6 6 0 0 1 368 248 
           L 18 248 
           A 6 6 0 0 1 12 242 
           Z"
        fill="url(#unoPcbGrad)"
        stroke="#004d55"
        strokeWidth="2"
      />

      {/* PCB Ground Traces & Silkscreen Graphics */}
      <g opacity="0.25" stroke="#ffffff" strokeWidth="1" fill="none">
        <path d="M 50 40 L 110 40 L 130 70 L 130 140" />
        <path d="M 180 80 L 220 80 L 250 120 L 320 120" />
        <path d="M 290 140 L 320 170 L 350 170" />
        <path d="M 80 180 L 120 180 L 140 210" />
        <circle cx="210" cy="140" r="28" strokeDasharray="3 3" />
      </g>

      {/* Mounting Holes with Tin-Plated Rings */}
      {[
        { cx: 58, cy: 30 },
        { cx: 350, cy: 38 },
        { cx: 350, cy: 222 },
        { cx: 62, cy: 232 },
      ].map((hole, i) => (
        <g key={i}>
          <circle cx={hole.cx} cy={hole.cy} r="6.5" fill="#94a3b8" />
          <circle cx={hole.cx} cy={hole.cy} r="5.5" fill="#cbd5e1" />
          <circle cx={hole.cx} cy={hole.cy} r="3.5" fill="#0b1120" />
          <circle cx={hole.cx} cy={hole.cy} r="3.5" fill="#020617" />
        </g>
      ))}

      {/* USB-B Metal Connector (Realistic top-left) */}
      <g id="usb-connector">
        <rect x="0" y="32" width="54" height="44" rx="3" fill="url(#metalGrad)" stroke="#475569" strokeWidth="1.5" />
        <rect x="2" y="36" width="50" height="36" rx="2" fill="#64748b" opacity="0.3" />
        <rect x="0" y="44" width="8" height="20" rx="1" fill="#1e293b" />
        {/* Retention prongs */}
        <rect x="18" y="40" width="18" height="6" rx="1" fill="#475569" />
        <rect x="18" y="62" width="18" height="6" rx="1" fill="#475569" />
      </g>

      {/* DC Barrel Jack (Realistic bottom-left) */}
      <g id="dc-jack">
        <rect x="0" y="160" width="52" height="50" rx="3" fill="url(#blackPlasticGrad)" stroke="#0f172a" strokeWidth="1.5" />
        <rect x="6" y="166" width="40" height="38" rx="2" fill="#090d16" />
        <circle cx="26" cy="185" r="9" fill="url(#metalGrad)" />
        <circle cx="26" cy="185" r="5" fill="#020617" />
      </g>

      {/* Voltage Regulator (AMS1117-5.0 / SOT-223) */}
      <g id="voltage-regulator">
        <rect x="68" y="125" width="24" height="20" rx="1" fill="#1e293b" stroke="#0f172a" />
        {/* Metal cooling tab */}
        <rect x="69" y="119" width="22" height="6" rx="1" fill="url(#metalGrad)" />
        {/* 3 output pins */}
        <rect x="71" y="145" width="4" height="6" fill="url(#metalGrad)" />
        <rect x="78" y="145" width="4" height="6" fill="url(#metalGrad)" />
        <rect x="85" y="145" width="4" height="6" fill="url(#metalGrad)" />
      </g>

      {/* 16 MHz Quartz Crystal Oscillator (Silver Can) */}
      <g id="crystal">
        <rect x="180" y="125" width="14" height="30" rx="6" fill="url(#metalGrad)" stroke="#64748b" strokeWidth="0.8" />
        <text x="187" y="142" fontSize="5" fill="#334155" fontFamily="monospace" textAnchor="middle" transform="rotate(-90 187 142)">
          16.000
        </text>
      </g>

      {/* Tactile Reset Button */}
      <g id="reset-button">
        <rect x="74" y="24" width="20" height="20" rx="2" fill="url(#metalGrad)" stroke="#64748b" strokeWidth="1" />
        <circle cx="84" cy="34" r="5.5" fill="#dc2626" />
        <circle cx="84" cy="34" r="3.5" fill="#ef4444" />
        <text x="84" y="52" fontSize="6.5" fill="#ffffff" fontWeight="600" textAnchor="middle">
          RESET
        </text>
      </g>

      {/* ATmega328P DIP-28 Microcontroller IC (Realistic) */}
      <g id="atmega328p">
        {/* IC Socket */}
        <rect x="208" y="172" width="138" height="34" rx="2" fill="#090d16" stroke="#1e293b" strokeWidth="1" />
        {/* IC Body */}
        <rect x="210" y="174" width="134" height="30" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="0.8" />
        {/* Pin 1 orientation notch */}
        <path d="M 210 185 A 4 4 0 0 1 210 193 Z" fill="#090d16" />
        <circle cx="218" cy="180" r="1.5" fill="#64748b" />
        {/* Silkscreen text on chip */}
        <text x="277" y="190" fontSize="7" fill="#94a3b8" fontFamily="monospace" fontWeight="600" textAnchor="middle" letterSpacing="0.8">
          ATMEGA328P-PU
        </text>
        <text x="277" y="198" fontSize="5" fill="#64748b" fontFamily="monospace" textAnchor="middle">
          ATMEL 2348 TH
        </text>
        {/* Dual inline pins (14 top + 14 bottom) */}
        {Array.from({ length: 14 }).map((_, i) => (
          <g key={i}>
            <rect x={216 + i * 9} y="169" width="3" height="5" fill="url(#metalGrad)" />
            <rect x={216 + i * 9} y="204" width="3" height="5" fill="url(#metalGrad)" />
          </g>
        ))}
      </g>

      {/* Silkscreen Branding & Italian Flag / Infinity Logo */}
      <g id="silkscreen-branding">
        <text x="200" y="52" fontSize="13" fill="#ffffff" fontWeight="bold" letterSpacing="1">
          ARDUINO
        </text>
        <text x="272" y="52" fontSize="9" fill="#fde047" fontWeight="bold">
          UNO
        </text>
        {/* Infinity logo */}
        <path
          d="M 174 48 C 168 43, 162 53, 168 48 C 174 43, 180 53, 174 48"
          stroke="#ffffff"
          strokeWidth="2"
          fill="none"
        />
        <text x="200" y="64" fontSize="6.5" fill="#e2e8f0" opacity="0.8">
          www.arduino.cc - Made in Italy
        </text>
      </g>

      {/* Status LEDs: ON, L (D13), TX, RX */}
      <g id="status-leds">
        {/* ON LED (Green) */}
        <rect x="96" y="80" width="7" height="4" rx="1" fill="#15803d" />
        <circle cx="99.5" cy="82" r="2.5" fill={isSimulating ? '#4ade80' : '#22c55e'} filter="url(#ledGlowGreen)" />
        <text x="99.5" y="93" fontSize="5" fill="#ffffff" textAnchor="middle">ON</text>

        {/* L LED (Amber/Yellow on D13) */}
        <rect x="146" y="80" width="7" height="4" rx="1" fill="#854d0e" />
        <circle
          cx="149.5"
          cy="82"
          r="2.5"
          fill={isLOn ? '#facc15' : '#713f12'}
          filter={isLOn ? 'url(#ledGlowAmber)' : undefined}
        />
        <text x="149.5" y="93" fontSize="5" fill="#ffffff" textAnchor="middle">L</text>

        {/* TX LED */}
        <rect x="146" y="100" width="7" height="4" rx="1" fill="#854d0e" />
        <circle
          cx="149.5"
          cy="102"
          r="2.5"
          fill={isTxRxActive ? '#facc15' : '#713f12'}
          filter={isTxRxActive ? 'url(#ledGlowAmber)' : undefined}
        />
        <text x="149.5" y="112" fontSize="5" fill="#ffffff" textAnchor="middle">TX</text>

        {/* RX LED */}
        <rect x="146" y="118" width="7" height="4" rx="1" fill="#854d0e" />
        <circle
          cx="149.5"
          cy="120"
          r="2.5"
          fill={isTxRxActive ? '#facc15' : '#713f12'}
          filter={isTxRxActive ? 'url(#ledGlowAmber)' : undefined}
        />
        <text x="149.5" y="130" fontSize="5" fill="#ffffff" textAnchor="middle">RX</text>
      </g>

      {/* TOP PIN HEADER STRIP (Digital Pins 0-13, GND, AREF) */}
      <g id="top-header">
        {/* Header Black Housing Strip */}
        <rect x="140" y="8" width="236" height="16" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
        
        {/* Individual Pin Sockets with Metallic Contacts */}
        {[
          { id: 'AREF', x: 148, label: 'AREF' },
          { id: 'GND1', x: 162, label: 'GND' },
          { id: 'D13', x: 176, label: '13' },
          { id: 'D12', x: 190, label: '12' },
          { id: 'D11', x: 204, label: '~11' },
          { id: 'D10', x: 218, label: '~10' },
          { id: 'D9', x: 232, label: '~9' },
          { id: 'D8', x: 246, label: '8' },
          // Gap
          { id: 'D7', x: 270, label: '7' },
          { id: 'D6', x: 284, label: '~6' },
          { id: 'D5', x: 298, label: '~5' },
          { id: 'D4', x: 312, label: '4' },
          { id: 'D3', x: 326, label: '~3' },
          { id: 'D2', x: 340, label: '2' },
          { id: 'D1', x: 354, label: 'TX' },
          { id: 'D0', x: 368, label: 'RX' },
        ].map((p) => {
          const state = pinStates[p.id.replace('~', '')];
          const isHigh = state && state.value > 0;
          return (
            <g key={p.id}>
              {/* Square socket with inner hole */}
              <rect x={p.x - 5} y="11" width="10" height="10" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
              <rect x={p.x - 2.5} y="13.5" width="5" height="5" rx="0.5" fill="#090d16" />
              <circle cx={p.x} cy="16" r="1.5" fill="url(#goldPinGrad)" />
              {/* Dynamic pin indicator dot if active */}
              {isHigh && (
                <circle cx={p.x} cy="7" r="1.5" fill="#38bdf8" />
              )}
              {/* Label below header */}
              <text x={p.x} y="31" fontSize="6.5" fill="#ffffff" fontWeight="600" textAnchor="middle">
                {p.label}
              </text>
            </g>
          );
        })}
        <text x="212" y="40" fontSize="6" fill="#cbd5e1" textAnchor="middle">
          DIGITAL (PWM ~)
        </text>
      </g>

      {/* BOTTOM POWER HEADER STRIP (IOREF, RESET, 3.3V, 5V, GND, VIN) */}
      <g id="bottom-power-header">
        <rect x="168" y="236" width="100" height="16" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
        {[
          { id: 'IOREF', x: 176, label: 'IOREF' },
          { id: 'RESET', x: 190, label: 'RES' },
          { id: '3V3', x: 204, label: '3.3V' },
          { id: '5V', x: 218, label: '5V' },
          { id: 'GND2', x: 232, label: 'GND' },
          { id: 'GND3', x: 246, label: 'GND' },
          { id: 'VIN', x: 260, label: 'VIN' },
        ].map((p) => (
          <g key={p.id}>
            <rect x={p.x - 5} y="239" width="10" height="10" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
            <rect x={p.x - 2.5} y="241.5" width="5" height="5" rx="0.5" fill="#090d16" />
            <circle cx={p.x} cy="244" r="1.5" fill="url(#goldPinGrad)" />
            <text x={p.x} y="233" fontSize="6" fill="#fde047" fontWeight="600" textAnchor="middle">
              {p.label}
            </text>
          </g>
        ))}
        <text x="218" y="224" fontSize="6" fill="#cbd5e1" textAnchor="middle">
          POWER
        </text>
      </g>

      {/* BOTTOM ANALOG HEADER STRIP (A0 to A5) */}
      <g id="bottom-analog-header">
        <rect x="280" y="236" width="90" height="16" rx="2" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
        {[
          { id: 'A0', x: 288, label: 'A0' },
          { id: 'A1', x: 302, label: 'A1' },
          { id: 'A2', x: 316, label: 'A2' },
          { id: 'A3', x: 330, label: 'A3' },
          { id: 'A4', x: 344, label: 'A4' },
          { id: 'A5', x: 358, label: 'A5' },
        ].map((p) => (
          <g key={p.id}>
            <rect x={p.x - 5} y="239" width="10" height="10" rx="1" fill="#1e293b" stroke="#334155" strokeWidth="0.5" />
            <rect x={p.x - 2.5} y="241.5" width="5" height="5" rx="0.5" fill="#090d16" />
            <circle cx={p.x} cy="244" r="1.5" fill="url(#goldPinGrad)" />
            <text x={p.x} y="233" fontSize="6.5" fill="#ffffff" fontWeight="600" textAnchor="middle">
              {p.label}
            </text>
          </g>
        ))}
        <text x="323" y="224" fontSize="6" fill="#cbd5e1" textAnchor="middle">
          ANALOG IN
        </text>
      </g>
    </svg>
  );
};
