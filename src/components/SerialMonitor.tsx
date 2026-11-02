import React, { useState, useRef, useEffect } from 'react';
import { SerialLogEntry, CircuitComponent } from '../types/circuit';
import { Send, Trash2, ArrowDown, Activity, Sliders, Terminal, Gauge } from 'lucide-react';

interface SerialMonitorProps {
  logs: SerialLogEntry[];
  components: CircuitComponent[];
  pinStates: Record<string, any>;
  wires?: any[];
  onClearLogs: () => void;
  onSendSerialInput: (input: string) => void;
  onUpdateComponentConfig: (compId: string, key: string, val: any) => void;
  onToggleLed?: (compId: string) => void;
}

export const SerialMonitor: React.FC<SerialMonitorProps> = ({
  logs,
  components,
  pinStates,
  onClearLogs,
  onSendSerialInput,
  onUpdateComponentConfig,
  onToggleLed,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'telemetry'>('terminal');
  const [inputText, setInputText] = useState('');
  const [baudRate, setBaudRate] = useState('9600');
  const [autoscroll, setAutoscroll] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoscroll && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoscroll]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText) return;
    onSendSerialInput(inputText + '\n');
    setInputText('');
  };

  // Find interactive sensors & actuators in circuit
  const sensors = components.filter((c) =>
    ['led', 'potentiometer', 'hc-sr04', 'dht11', 'photoresistor', 'pushbutton', 'pir-motion', 'sg90-servo', 'buzzer'].includes(c.type)
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 border-t border-slate-800 select-none">
      {/* Console Header Tabs & Controls */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
        {/* Tabs: Terminal vs Telemetría de Sensores */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'terminal'
                ? 'bg-slate-800 text-sky-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Monitor Serial</span>
            {logs.length > 0 && (
              <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
                {logs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded font-medium transition-colors ${
              activeTab === 'telemetry'
                ? 'bg-slate-800 text-sky-400 border border-slate-700/80 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Telemetría de Sensores</span>
            {sensors.length > 0 && (
              <span className="text-[10px] bg-sky-900 text-sky-200 px-1.5 py-0.2 rounded-full font-mono">
                {sensors.length}
              </span>
            )}
          </button>
        </div>

        {/* Right Toolbar Actions */}
        <div className="flex items-center gap-3">
          {activeTab === 'terminal' && (
            <>
              {/* Baud Rate Selector */}
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <span>Baudios:</span>
                <select
                  value={baudRate}
                  onChange={(e) => setBaudRate(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 rounded px-1.5 py-0.5 outline-none font-mono text-[11px]"
                >
                  <option value="9600">9600 baud</option>
                  <option value="115200">115200 baud</option>
                  <option value="57600">57600 baud</option>
                  <option value="38400">38400 baud</option>
                </select>
              </div>

              {/* Autoscroll toggle */}
              <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={autoscroll}
                  onChange={(e) => setAutoscroll(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-sky-500 w-3 h-3"
                />
                <span>Auto-scroll</span>
              </label>

              {/* Timestamp toggle */}
              <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer hover:text-slate-300">
                <input
                  type="checkbox"
                  checked={showTimestamps}
                  onChange={(e) => setShowTimestamps(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-sky-500 w-3 h-3"
                />
                <span>Marcas de tiempo</span>
              </label>

              {/* Clear button */}
              <button
                onClick={onClearLogs}
                className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                title="Limpiar monitor serial"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Console Body */}
      {activeTab === 'terminal' ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Terminal Logs Output */}
          <div className="flex-1 p-3 overflow-y-auto font-mono text-xs leading-5 text-slate-200 selection:bg-sky-600/30">
            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
                <Terminal className="w-8 h-8 mb-2 opacity-30" />
                <p>El monitor serial está a la espera de datos...</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Inicia la simulación para visualizar lecturas con Serial.print()
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2 py-0.5">
                  {showTimestamps && (
                    <span className="text-slate-400 text-[10px] select-none shrink-0 font-mono">
                      [{log.timestamp}]
                    </span>
                  )}
                  <span
                    className={
                      log.type === 'in'
                        ? 'text-emerald-400 font-semibold'
                        : log.type === 'error'
                        ? 'text-red-400'
                        : log.type === 'info'
                        ? 'text-amber-300'
                        : 'text-slate-100 whitespace-pre-wrap'
                    }
                  >
                    {log.type === 'in' && '> '}
                    {log.text}
                  </span>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Serial Input Sender Bar */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 border-t border-slate-800"
          >
            <span className="text-slate-400 text-xs font-mono font-bold select-none">&gt;</span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe datos para enviar al microcontrolador (Serial.read)..."
              className="flex-1 bg-slate-950 border border-slate-700/80 rounded px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-sky-500 font-mono placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={!inputText}
              className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white rounded text-xs font-medium transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      ) : (
        /* Real-Time Sensor Telemetry Dashboard */
        <div className="flex-1 p-4 overflow-y-auto">
          {sensors.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs">
              <Sliders className="w-8 h-8 mb-2 opacity-30" />
              <p>No hay sensores interactivos en el circuito actual.</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Añade un potenciómetro, sensor ultrasónico HC-SR04 o DHT11 para ajustar lecturas en tiempo real.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sensors.map((c) => {
                const cfg = c.customConfig || {};

                if (c.type === 'potentiometer') {
                  const val = cfg.potValue ?? 512;
                  const volt = ((val / 1023) * 5.0).toFixed(2);
                  return (
                    <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-sky-400">Potenciómetro 10kΩ</span>
                        <span className="text-xs font-mono font-bold text-slate-200">{val} / 1023 ({volt}V)</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1023"
                        value={val}
                        onChange={(e) => onUpdateComponentConfig(c.id, 'potValue', parseInt(e.target.value, 10))}
                        className="w-full accent-sky-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>0V (GND)</span>
                        <span>2.5V</span>
                        <span>5.0V (VCC)</span>
                      </div>
                    </div>
                  );
                }

                if (c.type === 'hc-sr04') {
                  const dist = cfg.distance ?? 45;
                  return (
                    <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-400">Ultrasonido HC-SR04</span>
                        <span className="text-xs font-mono font-bold text-slate-200">{dist} cm</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="400"
                        value={dist}
                        onChange={(e) => onUpdateComponentConfig(c.id, 'distance', parseInt(e.target.value, 10))}
                        className="w-full accent-blue-500 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>2 cm (Mínimo)</span>
                        <span>200 cm</span>
                        <span>400 cm (Máximo)</span>
                      </div>
                    </div>
                  );
                }

                if (c.type === 'dht11') {
                  const temp = cfg.temperature ?? 24;
                  const hum = cfg.humidity ?? 55;
                  return (
                    <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 space-y-2">
                      <div className="text-xs font-semibold text-teal-400">Sensor DHT11 (Clima)</div>
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                          <span>Temperatura:</span>
                          <span className="font-mono font-bold text-amber-300">{temp}°C</span>
                        </div>
                        <input
                          type="range"
                          min="-10"
                          max="50"
                          value={temp}
                          onChange={(e) => onUpdateComponentConfig(c.id, 'temperature', parseInt(e.target.value, 10))}
                          className="w-full accent-amber-500 cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                          <span>Humedad Relativa:</span>
                          <span className="font-mono font-bold text-teal-300">{hum}% RH</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="95"
                          value={hum}
                          onChange={(e) => onUpdateComponentConfig(c.id, 'humidity', parseInt(e.target.value, 10))}
                          className="w-full accent-teal-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  );
                }

                if (c.type === 'photoresistor') {
                  const light = cfg.lightLevel ?? 70;
                  return (
                    <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-amber-400">Fotorresistor LDR</span>
                        <span className="text-xs font-mono font-bold text-slate-200">{light}% Lux</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={light}
                        onChange={(e) => onUpdateComponentConfig(c.id, 'lightLevel', parseInt(e.target.value, 10))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>Oscuridad (0%)</span>
                        <span>Luz Plena (100%)</span>
                      </div>
                    </div>
                  );
                }

                if (c.type === 'pushbutton') {
                  const pressed = cfg.isPressed ?? false;
                  return (
                    <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-rose-400">Pulsador Táctil</span>
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {pressed ? '● PRESIONADO' : '○ SUELTO'}
                        </span>
                      </div>
                      <button
                        onMouseDown={() => onUpdateComponentConfig(c.id, 'isPressed', true)}
                        onMouseUp={() => onUpdateComponentConfig(c.id, 'isPressed', false)}
                        className={`w-full py-2 rounded text-xs font-bold transition-all ${
                          pressed ? 'bg-rose-600 text-white shadow-inner scale-98' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                        }`}
                      >
                        {pressed ? 'Presionando...' : 'Mantener pulsado'}
                      </button>
                    </div>
                  );
                }

                if (c.type === 'pir-motion') {
                  const motion = cfg.motionDetected ?? false;
                  return (
                    <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-emerald-400">Sensor PIR</span>
                        <span className={`text-xs font-mono font-bold ${motion ? 'text-red-400' : 'text-slate-400'}`}>
                          {motion ? '● MOVIMIENTO' : 'STANDBY'}
                        </span>
                      </div>
                      <button
                        onClick={() => onUpdateComponentConfig(c.id, 'motionDetected', !motion)}
                        className={`w-full py-2 rounded text-xs font-medium transition-colors ${
                          motion
                            ? 'bg-red-600 text-white'
                            : 'bg-emerald-600/30 text-emerald-300 hover:bg-emerald-600/50'
                        }`}
                      >
                        {motion ? 'Detener Movimiento' : 'Simular Paso de Persona'}
                      </button>
                    </div>
                  );
                }

                if (c.type === 'sg90-servo') {
                  const angle = c.state?.angle ?? 90;
                  return (
                    <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-blue-400">Micro Servo SG90</span>
                        <span className="text-xs font-mono font-bold text-sky-300">{angle}°</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-sky-500 h-full transition-all duration-150"
                          style={{ width: `${(angle / 180) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>0°</span>
                        <span>90°</span>
                        <span>180°</span>
                      </div>
                    </div>
                  );
                }

                if (c.type === 'buzzer') {
                  const isPlaying = c.state?.isPlaying ?? false;
                  const freq = c.state?.freq ?? 0;
                  return (
                    <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-purple-400">Buzzer Piezo</span>
                        <span className={`text-xs font-mono font-bold ${isPlaying ? 'text-purple-300' : 'text-slate-400'}`}>
                          {isPlaying ? `${freq} Hz (Sonando)` : 'Silencio'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {isPlaying ? 'Reproduciendo audio Web Audio en vivo' : 'En espera de llamada a tone()'}
                      </div>
                    </div>
                  );
                }

                if (c.type === 'led') {
                  const b = c.state?.brightness ?? 0;
                  const isLit = b > 0;
                  const colorKey = c.customConfig?.ledColor || 'red';
                  const colorMap: Record<string, string> = {
                    red: '#ef4444',
                    green: '#22c55e',
                    blue: '#3b82f6',
                    yellow: '#eab308',
                    orange: '#f97316',
                    purple: '#a855f7',
                    cyan: '#06b6d4',
                    white: '#f8fafc',
                    pink: '#ec4899',
                    amber: '#f59e0b',
                    lime: '#84cc16',
                    uv: '#8b5cf6',
                  };
                  const hex = colorMap[colorKey] || '#ef4444';

                  return (
                    <div key={c.id} className="bg-slate-900/90 border border-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="text-xs font-semibold text-slate-100">{c.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                            {c.id}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-mono font-bold ${
                            isLit ? 'text-amber-300' : 'text-slate-500'
                          }`}
                        >
                          {isLit ? `ENCENDIDO (${Math.round(b * 100)}%)` : 'APAGADO'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1 mb-2.5">
                        <div
                          className="h-full transition-all duration-150"
                          style={{
                            width: `${Math.min(100, Math.round(b * 100))}%`,
                            backgroundColor: hex,
                          }}
                        />
                      </div>
                      {onToggleLed && (
                        <button
                          onClick={() => onToggleLed(c.id)}
                          className="w-full py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-[11px] text-slate-200 font-medium transition-colors"
                        >
                          {isLit ? 'Probar Apagar' : 'Probar Encender'}
                        </button>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
