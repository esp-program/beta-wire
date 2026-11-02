import React from 'react';
import { WireColor } from '../types/circuit';
import { PRESET_PROJECTS } from '../data/presetProjects';
import { Play, Square, Pause, Cpu, Layers, Terminal, Code, RotateCcw, Sparkles } from 'lucide-react';

interface TopNavbarProps {
  isSimulating: boolean;
  isPaused: boolean;
  selectedProjectId: string;
  selectedWireColor: WireColor;
  activePanel: 'split' | 'canvas-only' | 'code-only';
  onSelectProject: (projId: string) => void;
  onSelectWireColor: (color: WireColor) => void;
  onSetActivePanel: (panel: 'split' | 'canvas-only' | 'code-only') => void;
  onStartSimulation: () => void;
  onPauseSimulation: () => void;
  onStopSimulation: () => void;
  onResetCircuit: () => void;
  onOpenComponentDrawer: () => void;
}

const WIRE_COLORS: { color: WireColor; name: string }[] = [
  { color: '#ef4444', name: 'Rojo (5V / VCC)' },
  { color: '#1e293b', name: 'Negro (GND)' },
  { color: '#3b82f6', name: 'Azul' },
  { color: '#eab308', name: 'Amarillo' },
  { color: '#22c55e', name: 'Verde' },
  { color: '#f97316', name: 'Naranja' },
  { color: '#a855f7', name: 'Púrpura' },
  { color: '#06b6d4', name: 'Cian' },
  { color: '#f8fafc', name: 'Blanco' },
];

export const TopNavbar: React.FC<TopNavbarProps> = ({
  isSimulating,
  isPaused,
  selectedProjectId,
  selectedWireColor,
  activePanel,
  onSelectProject,
  onSelectWireColor,
  onSetActivePanel,
  onStartSimulation,
  onPauseSimulation,
  onStopSimulation,
  onResetCircuit,
  onOpenComponentDrawer,
}) => {
  return (
    <header className="flex items-center justify-between gap-6 px-5 py-2.5 bg-slate-950 border-b border-slate-800 text-slate-100 select-none shrink-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-4 shrink-0">
        <a href="/" className="flex items-center gap-2 text-base font-bold tracking-tight text-white whitespace-nowrap shrink-0 hover:text-sky-400 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm">
            <Cpu className="w-4 h-4" />
          </div>
          <span>ElectroSim 3D</span>
        </a>

        {/* Project Template Preset Dropdown */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300">
          <span className="text-slate-500">Ejemplo:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-md px-2.5 py-1 text-xs text-slate-200 outline-none hover:border-slate-600 focus:border-sky-500 transition-colors"
          >
            {PRESET_PROJECTS.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.board}: {proj.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Zone 2: Navigation / Wire Color Palette & View Panels */}
      <nav className="flex items-center gap-4 text-xs font-medium text-slate-300">
        {/* Real 3D Studio Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-sky-950/60 border border-sky-800/60 rounded-md text-sky-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          <span>Mesa 3D Realista</span>
        </div>

        {/* Wire Color Picker */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md">
          <span className="text-slate-400 text-[11px] mr-1">Cable:</span>
          {WIRE_COLORS.map((w) => (
            <button
              key={w.color}
              onClick={() => onSelectWireColor(w.color)}
              className={`w-3.5 h-3.5 rounded-full transition-transform ${
                selectedWireColor === w.color
                  ? 'ring-2 ring-sky-400 scale-125'
                  : 'hover:scale-110 opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: w.color }}
              title={`Cable ${w.name}`}
            />
          ))}
        </div>

        {/* View Mode Segmented Control */}
        <div className="flex items-center gap-0.5 p-0.5 bg-slate-900 border border-slate-800 rounded-md">
          <button
            onClick={() => onSetActivePanel('split')}
            className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap shrink-0 ${
              activePanel === 'split'
                ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Lienzo y Editor de Código divididos"
          >
            Dividido
          </button>
          <button
            onClick={() => onSetActivePanel('canvas-only')}
            className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap shrink-0 ${
              activePanel === 'canvas-only'
                ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Solo Lienzo"
          >
            Lienzo
          </button>
          <button
            onClick={() => onSetActivePanel('code-only')}
            className={`px-2.5 py-1 text-xs rounded transition-colors whitespace-nowrap shrink-0 ${
              activePanel === 'code-only'
                ? 'bg-slate-800 text-sky-400 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Solo Código"
          >
            Código
          </button>
        </div>


        {/* Catalog Tab Toggle */}
        <button
          onClick={onOpenComponentDrawer}
          className="flex items-center gap-1.5 px-2.5 py-1 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors whitespace-nowrap shrink-0"
        >
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>Componentes</span>
        </button>
      </nav>

      {/* Zone 3: Primary Action (Simulation execution trigger) */}
      <div className="flex items-center gap-2 shrink-0">
        {!isSimulating ? (
          <button
            onClick={onStartSimulation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Iniciar Simulación</span>
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            <button
              onClick={onPauseSimulation}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                isPaused
                  ? 'bg-amber-600 text-white hover:bg-amber-500'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
              }`}
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
              <span>{isPaused ? 'Reanudar' : 'Pausar'}</span>
            </button>
            <button
              onClick={onStopSimulation}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Square className="w-3 h-3 fill-current" />
              <span>Detener</span>
            </button>
          </div>
        )}

        <button
          onClick={onResetCircuit}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Reiniciar circuito actual"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
