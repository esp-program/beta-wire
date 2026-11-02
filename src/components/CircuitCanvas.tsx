import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CircuitComponent, Wire, WireColor } from '../types/circuit';
import { COMPONENT_METADATA } from '../data/componentDefinitions';
import { ComponentRenderer } from './realistic/ComponentRenderer';
import { Trash2, RotateCw, ZoomIn, ZoomOut, Maximize2, MousePointer, PlusCircle } from 'lucide-react';

interface CircuitCanvasProps {
  components: CircuitComponent[];
  wires: Wire[];
  selectedWireColor: WireColor;
  isSimulating: boolean;
  pinStates: Record<string, any>;
  onComponentsChange: (newComps: CircuitComponent[]) => void;
  onWiresChange: (newWires: Wire[]) => void;
  onUpdateComponentConfig: (compId: string, key: string, val: any) => void;
  onOpenComponentDrawer?: () => void;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  components,
  wires,
  selectedWireColor,
  isSimulating,
  pinStates,
  onComponentsChange,
  onWiresChange,
  onUpdateComponentConfig,
  onOpenComponentDrawer,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selection
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [hoveredWireId, setHoveredWireId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);

  // Component Dragging
  const [draggingCompId, setDraggingCompId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; compX: number; compY: number }>({
    mouseX: 0,
    mouseY: 0,
    compX: 0,
    compY: 0,
  });

  // Wiring creation state
  const [activeWireStart, setActiveWireStart] = useState<{ compId: string; pinId: string } | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPin, setHoveredPin] = useState<{ compId: string; pinId: string; label: string; desc?: string } | null>(null);

  // Helper to convert screen coordinates to canvas coordinates (accounting for pan & zoom)
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    return { x, y };
  }, [pan, zoom]);

  // Helper to get absolute coordinates of a pin
  const getPinAbsoluteCoords = useCallback((compId: string, pinId: string) => {
    const comp = components.find((c) => c.id === compId);
    if (!comp) return { x: 0, y: 0 };
    const pin = comp.pins.find((p) => p.id === pinId);
    if (!pin) return { x: comp.x, y: comp.y };

    // Apply rotation if needed (around component center)
    const meta = COMPONENT_METADATA[comp.type];
    const width = meta?.width || 100;
    const height = meta?.height || 100;

    let px = pin.x;
    let py = pin.y;

    if (comp.rotation === 90) {
      px = width - pin.y;
      py = pin.x;
    } else if (comp.rotation === 180) {
      px = width - pin.x;
      py = height - pin.y;
    } else if (comp.rotation === 270) {
      px = pin.y;
      py = height - pin.x;
    }

    return {
      x: comp.x + px,
      y: comp.y + py,
    };
  }, [components]);

  // Mouse Move listener for Canvas
  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setMouseCanvasPos(coords);

    // Pan canvas
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    // Drag component
    if (draggingCompId) {
      const deltaX = (e.clientX - dragStartRef.current.mouseX) / zoom;
      const deltaY = (e.clientY - dragStartRef.current.mouseY) / zoom;

      // Snap to 5px grid for clean alignment
      const newX = Math.round((dragStartRef.current.compX + deltaX) / 5) * 5;
      const newY = Math.round((dragStartRef.current.compY + deltaY) / 5) * 5;

      onComponentsChange(
        components.map((c) =>
          c.id === draggingCompId ? { ...c, x: Math.max(0, newX), y: Math.max(0, newY) } : c
        )
      );
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking on background with left button, start panning or deselect
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      if (activeWireStart) {
        // Cancel active wire if clicked empty space
        setActiveWireStart(null);
        return;
      }
      setSelectedCompId(null);
      setSelectedWireId(null);

      // Start pan
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - pan.x,
        y: e.clientY - pan.y,
      };
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingCompId(null);
  };

  // Zoom with wheel
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(2.5, Math.max(0.4, zoom * zoomFactor));

    // Zoom towards mouse position
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      setPan({
        x: mouseX - (mouseX - pan.x) * (newZoom / zoom),
        y: mouseY - (mouseY - pan.y) * (newZoom / zoom),
      });
      setZoom(newZoom);
    }
  };

  // Handle Pin Click -> WIRING INTERACTION
  const handlePinClick = (compId: string, pinId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!activeWireStart) {
      // Start drawing a wire from this pin!
      setActiveWireStart({ compId, pinId });
    } else {
      // Don't connect pin to itself
      if (activeWireStart.compId === compId && activeWireStart.pinId === pinId) {
        setActiveWireStart(null);
        return;
      }

      // Check if wire already exists
      const exists = wires.some(
        (w) =>
          (w.fromCompId === activeWireStart.compId &&
            w.fromPinId === activeWireStart.pinId &&
            w.toCompId === compId &&
            w.toPinId === pinId) ||
          (w.fromCompId === compId &&
            w.fromPinId === pinId &&
            w.toCompId === activeWireStart.compId &&
            w.toPinId === activeWireStart.pinId)
      );

      if (!exists) {
        const newWire: Wire = {
          id: `w-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          fromCompId: activeWireStart.compId,
          fromPinId: activeWireStart.pinId,
          toCompId: compId,
          toPinId: pinId,
          color: selectedWireColor,
        };
        onWiresChange([...wires, newWire]);
      }

      // Reset active wire
      setActiveWireStart(null);
    }
  };

  // Component Drag Start
  const handleCompMouseDown = (comp: CircuitComponent, e: React.MouseEvent) => {
    // Only drag with left click and when not currently drawing wire
    if (e.button !== 0 || activeWireStart) return;
    e.stopPropagation();
    setSelectedCompId(comp.id);
    setSelectedWireId(null);
    setDraggingCompId(comp.id);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      compX: comp.x,
      compY: comp.y,
    };
  };

  // Rotate selected component
  const handleRotateSelected = () => {
    if (!selectedCompId) return;
    onComponentsChange(
      components.map((c) =>
        c.id === selectedCompId ? { ...c, rotation: (c.rotation + 90) % 360 } : c
      )
    );
  };

  // Delete selected component and its attached wires
  const handleDeleteSelected = () => {
    if (selectedWireId) {
      onWiresChange(wires.filter((w) => w.id !== selectedWireId));
      setSelectedWireId(null);
      return;
    }
    if (selectedCompId) {
      onComponentsChange(components.filter((c) => c.id !== selectedCompId));
      onWiresChange(
        wires.filter((w) => w.fromCompId !== selectedCompId && w.toCompId !== selectedCompId)
      );
      setSelectedCompId(null);
    }
  };

  // Keyboard shortcut listener (Delete, Escape, R)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveWireStart(null);
        setSelectedCompId(null);
        setSelectedWireId(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only if not in an input/textarea
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        handleDeleteSelected();
      } else if (e.key === 'r' || e.key === 'R') {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        handleRotateSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCompId, selectedWireId, wires, components]);

  // Compute smooth curved Bézier path with realistic wire sag
  const getWirePath = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const distance = Math.hypot(dx, dy);

    // Natural catenary curve: curve downwards with gravity proportional to distance
    const sag = Math.min(80, Math.max(25, distance * 0.22));

    const cp1x = p1.x + dx * 0.25;
    const cp1y = p1.y + dy * 0.25 + sag;

    const cp2x = p1.x + dx * 0.75;
    const cp2y = p1.y + dy * 0.75 + sag;

    return `M ${p1.x} ${p1.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden circuit-grid cursor-crosshair select-none"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* HUD Info Bar & Action Controls */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1.5 shadow-xl">
        <button
          onClick={onOpenComponentDrawer}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md transition-colors shadow-sm"
          title="Abrir catálogo de componentes"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>+ Añadir Componente</span>
        </button>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        <button
          onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Acercar (Zoom In)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          title="Alejar (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 20, y: 20 });
          }}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors text-xs font-mono"
          title="Restablecer vista 100%"
        >
          {Math.round(zoom * 100)}%
        </button>

        {selectedCompId && (
          <>
            <div className="h-4 w-px bg-slate-700 mx-1" />
            <button
              onClick={handleRotateSelected}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded transition-colors"
              title="Girar componente seleccionado (Tecla R)"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Girar</span>
            </button>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded transition-colors"
              title="Eliminar elemento (Tecla Supr/Delete)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar</span>
            </button>
          </>
        )}
      </div>

      {/* Wiring Mode Banner Indicator */}
      {activeWireStart && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-3 bg-amber-500/15 border border-amber-500/40 backdrop-blur-md px-3.5 py-2 rounded-lg text-amber-200 text-xs shadow-lg animate-pulse">
          <span className="font-semibold">Modo Cableado:</span>
          <span>Toca el pin de destino para conectar el cable (o Esc para cancelar)</span>
          <button
            onClick={() => setActiveWireStart(null)}
            className="px-2 py-0.5 bg-amber-500/30 hover:bg-amber-500/50 text-white rounded font-medium text-xs"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Pin Hover Tooltip HUD */}
      {hoveredPin && !activeWireStart && (
        <div
          className="pointer-events-none fixed z-30 bg-slate-900/95 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded shadow-xl"
          style={{
            left: `${mouseCanvasPos.x * zoom + pan.x + (containerRef.current?.getBoundingClientRect().left || 0) + 16}px`,
            top: `${mouseCanvasPos.y * zoom + pan.y + (containerRef.current?.getBoundingClientRect().top || 0) + 16}px`,
          }}
        >
          <div className="font-semibold text-sky-400 flex items-center gap-1.5">
            <span>Pin {hoveredPin.label}</span>
          </div>
          {hoveredPin.desc && <div className="text-slate-400 text-[11px] mt-0.5">{hoveredPin.desc}</div>}
          <div className="text-[10px] text-amber-400/90 mt-1 font-mono">Toca para trazar cable</div>
        </div>
      )}

      {/* SVG Canvas Stage for Components, Pins & Wires */}
      <svg
        className="w-full h-full absolute inset-0 pointer-events-auto"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          {/* Wire drop shadow filter */}
          <filter id="wireShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="3" stdDeviation="2.5" floodColor="#020617" floodOpacity="0.75" />
          </filter>
        </defs>

        {/* 1. COMPONENTS LAYER */}
        {components.map((comp) => {
          const isSelected = selectedCompId === comp.id;
          const meta = COMPONENT_METADATA[comp.type];
          const w = meta?.width || 100;
          const h = meta?.height || 100;

          return (
            <g
              key={comp.id}
              transform={`translate(${comp.x}, ${comp.y}) rotate(${comp.rotation} ${w / 2} ${h / 2})`}
              onMouseDown={(e) => handleCompMouseDown(comp, e)}
              className="cursor-move"
            >
              {/* Selection Halo */}
              {isSelected && (
                <rect
                  x="-6"
                  y="-6"
                  width={w + 12}
                  height={h + 12}
                  rx="8"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  opacity="0.8"
                />
              )}

              {/* Realistic Visual Component */}
              <ComponentRenderer
                component={comp}
                isSimulating={isSimulating}
                pinStates={pinStates}
                onUpdateConfig={onUpdateComponentConfig}
              />

              {/* Interactive Pin Touch Targets */}
              {comp.pins.map((pin) => {
                const isStartPin = activeWireStart?.compId === comp.id && activeWireStart?.pinId === pin.id;
                const isHovered = hoveredPin?.compId === comp.id && hoveredPin?.pinId === pin.id;

                return (
                  <g
                    key={pin.id}
                    className="cursor-pointer group"
                    onClick={(e) => handlePinClick(comp.id, pin.id, e)}
                    onMouseEnter={() =>
                      setHoveredPin({
                        compId: comp.id,
                        pinId: pin.id,
                        label: pin.label,
                        desc: pin.description,
                      })
                    }
                    onMouseLeave={() => setHoveredPin(null)}
                  >
                    {/* Invisible expanded hit target area */}
                    <circle cx={pin.x} cy={pin.y} r="10" fill="transparent" />

                    {/* Visual snap indicator on hover or active wire start */}
                    {(isHovered || isStartPin) && (
                      <circle
                        cx={pin.x}
                        cy={pin.y}
                        r="8"
                        fill="none"
                        stroke={isStartPin ? '#facc15' : '#38bdf8'}
                        strokeWidth="2.5"
                        className={isStartPin ? 'animate-ping' : ''}
                      />
                    )}

                    {/* Terminal core dot */}
                    <circle
                      cx={pin.x}
                      cy={pin.y}
                      r="3"
                      fill={isStartPin ? '#fde047' : isHovered ? '#38bdf8' : '#e2e8f0'}
                      opacity={isHovered || isStartPin ? 1 : 0.4}
                      stroke="#0f172a"
                      strokeWidth="0.8"
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* 2. WIRES LAYER */}
        {wires.map((wire) => {
          const p1 = getPinAbsoluteCoords(wire.fromCompId, wire.fromPinId);
          const p2 = getPinAbsoluteCoords(wire.toCompId, wire.toPinId);
          const path = getWirePath(p1, p2);
          const isHovered = hoveredWireId === wire.id;
          const isSelected = selectedWireId === wire.id;

          return (
            <g
              key={wire.id}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredWireId(wire.id)}
              onMouseLeave={() => setHoveredWireId(null)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWireId(wire.id);
                setSelectedCompId(null);
              }}
            >
              {/* Invisible thicker stroke for easy clicking/hovering */}
              <path d={path} fill="none" stroke="transparent" strokeWidth="16" />

              {/* Wire Drop Shadow */}
              <path
                d={path}
                fill="none"
                stroke="#020617"
                strokeWidth="4"
                opacity="0.4"
                transform="translate(1, 4)"
              />

              {/* Selection / Hover Glow */}
              {(isHovered || isSelected) && (
                <path
                  d={path}
                  fill="none"
                  stroke={isSelected ? '#38bdf8' : '#ffffff'}
                  strokeWidth="7"
                  opacity="0.7"
                />
              )}

              {/* Realistic Insulated Wire Outer Body */}
              <path
                d={path}
                fill="none"
                stroke={wire.color}
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#wireShadow)"
              />

              {/* Specular Highlight along wire top */}
              <path
                d={path}
                fill="none"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.45"
              />

              {/* Copper / Silver Terminals on Wire Ends */}
              <circle cx={p1.x} cy={p1.y} r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
              <circle cx={p2.x} cy={p2.y} r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />

              {/* Delete button indicator when selected */}
              {isSelected && (
                <g
                  transform={`translate(${(p1.x + p2.x) / 2}, ${(p1.y + p2.y) / 2})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onWiresChange(wires.filter((w) => w.id !== wire.id));
                    setSelectedWireId(null);
                  }}
                  className="cursor-pointer hover:scale-110 transition-transform"
                >
                  <circle cx="0" cy="0" r="10" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                  <line x1="-4" y1="-4" x2="4" y2="4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                  <line x1="4" y1="-4" x2="-4" y2="4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}
            </g>
          );
        })}

        {/* 3. ACTIVE LIVE DRAWING WIRE (Following mouse) */}
        {activeWireStart && (
          <g className="pointer-events-none">
            {(() => {
              const p1 = getPinAbsoluteCoords(activeWireStart.compId, activeWireStart.pinId);
              const p2 = mouseCanvasPos;
              const path = getWirePath(p1, p2);

              return (
                <>
                  <path
                    d={path}
                    fill="none"
                    stroke={selectedWireColor}
                    strokeWidth="3.5"
                    strokeDasharray="6 3"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                  <circle cx={p1.x} cy={p1.y} r="4" fill="#fde047" stroke="#b45309" strokeWidth="1" />
                  <circle cx={p2.x} cy={p2.y} r="4" fill={selectedWireColor} stroke="#ffffff" strokeWidth="1.5" />
                </>
              );
            })()}
          </g>
        )}
      </svg>
    </div>
  );
};
