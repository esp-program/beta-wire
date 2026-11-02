import React, { useState, useRef } from 'react';
import { ComponentType, CircuitComponent } from '../types/circuit';
import { COMPONENT_METADATA, ComponentMetadata } from '../data/componentDefinitions';
import { X, Search, Cpu, Radio, Sparkles, Layers, Sliders, Upload, Box } from 'lucide-react';

interface ComponentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAddComponent: (type: ComponentType, customConfig?: Record<string, any>, nameOverride?: string) => void;
  onUploadGLB?: (file: File) => void;
  components?: CircuitComponent[];
}

const LED_COLORS_LIST: {
  id:
    | 'red'
    | 'green'
    | 'blue'
    | 'yellow'
    | 'orange'
    | 'purple'
    | 'cyan'
    | 'white'
    | 'pink'
    | 'amber'
    | 'lime'
    | 'uv';
  label: string;
  color: string;
}[] = [
  { id: 'red', label: 'Rojo', color: '#ef4444' },
  { id: 'green', label: 'Verde', color: '#22c55e' },
  { id: 'blue', label: 'Azul', color: '#3b82f6' },
  { id: 'yellow', label: 'Amarillo', color: '#eab308' },
  { id: 'orange', label: 'Naranja', color: '#f97316' },
  { id: 'purple', label: 'Púrpura', color: '#a855f7' },
  { id: 'cyan', label: 'Cian', color: '#06b6d4' },
  { id: 'white', label: 'Blanco', color: '#f8fafc' },
  { id: 'pink', label: 'Rosa', color: '#ec4899' },
  { id: 'amber', label: 'Ámbar', color: '#f59e0b' },
  { id: 'lime', label: 'Lima', color: '#84cc16' },
  { id: 'uv', label: 'UV', color: '#8b5cf6' },
];

export const ComponentDrawer: React.FC<ComponentDrawerProps> = ({
  isOpen,
  onClose,
  onAddComponent,
  onUploadGLB,
  components = [],
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const hasArduino = components.some((c) => c.type === 'arduino-uno');

  const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'micro', label: 'Microcontroladores' },
    { id: 'sensor', label: 'Sensores' },
    { id: 'actuator', label: 'Actuadores' },
    { id: 'passive', label: 'Pasivos' },
    { id: 'board', label: 'Protoboard' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUploadGLB) {
      onUploadGLB(file);
      onClose();
    }
  };

  const filteredComponents = Object.values(COMPONENT_METADATA).filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="fixed inset-y-0 left-0 w-84 md:w-96 bg-slate-900/98 backdrop-blur-xl border-r border-slate-800 z-50 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-sky-400" />
            <span>Catálogo de Componentes</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Modelos 3D a escala física calibrada
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* GLB File Upload Box */}
      <div className="p-3 bg-sky-950/30 border-b border-sky-900/40">
        <input
          ref={fileInputRef}
          type="file"
          accept=".glb,.gltf"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 p-2.5 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-500/40 hover:border-sky-500 rounded-lg text-sky-300 text-xs font-medium transition-all group"
        >
          <Upload className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
          <span>Importar archivo 3D (.glb / .gltf)</span>
        </button>
        <p className="text-[10px] text-sky-400/80 text-center mt-1 font-mono">
          Carga tus propios modelos 3D directamente
        </p>
      </div>

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800/80">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar componentes (ej. ESP32, Servo, LED, HC-SR04)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-md text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-sky-500"
          />
        </div>

        {/* Category Pills (Functional filter tabs) */}
        <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1 text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-sky-600 text-white font-medium shadow-sm'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredComponents.map((item) => {
          const isArduinoDisabled = item.type === 'arduino-uno' && hasArduino;
          return (
          <div
            key={item.type}
            className={`group p-3 border rounded-lg transition-all duration-150 shadow-sm ${
              isArduinoDisabled
                ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                : 'bg-slate-950/60 hover:bg-slate-800/70 border-slate-800 hover:border-sky-500/50'
            }`}
          >
            <div
              className={isArduinoDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              onClick={() => {
                if (isArduinoDisabled) return;
                onAddComponent(item.type);
                onClose();
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-100 group-hover:text-sky-300 transition-colors flex items-center gap-2">
                    <span>{item.name}</span>
                    {isArduinoDisabled && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-amber-900/60 text-amber-300 border border-amber-600/40 rounded font-normal">
                        Ya en mesa (Límite: 1)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-4">
                    {item.description}
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded ml-2 shrink-0">
                  {item.pins.length} pines
                </span>
              </div>
            </div>

            {/* Special Color Selector for LED */}
            {item.type === 'led' && (
              <div className="mt-2.5 pt-2 border-t border-slate-800/70">
                <span className="text-[10px] text-slate-400 block mb-1.5 font-medium">
                  Elegir color de LED (misma textura difusa):
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {LED_COLORS_LIST.map((c) => (
                    <button
                      key={c.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddComponent('led', { ledColor: c.id }, `Diodo LED (${c.label})`);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-500 rounded text-[10px] text-slate-200 transition-colors"
                      title={`Añadir LED ${c.label}`}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: c.color }}
                      />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div
              onClick={() => {
                if (isArduinoDisabled) return;
                onAddComponent(item.type);
                onClose();
              }}
              className={`mt-2.5 flex items-center justify-between pt-2 border-t border-slate-800/50 text-[10px] ${
                isArduinoDisabled ? 'text-slate-500 cursor-not-allowed' : 'text-slate-400 cursor-pointer'
              }`}
            >
              <span className="capitalize">{item.category}</span>
              <span className={isArduinoDisabled ? 'text-slate-500' : 'text-sky-400 font-medium group-hover:translate-x-0.5 transition-transform'}>
                {isArduinoDisabled ? 'Desactivado (1 en mesa)' : '+ Añadir al lienzo 3D'}
              </span>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};
