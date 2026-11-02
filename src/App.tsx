/**
 * ElectroSim - Interactive Arduino & ESP32 Circuit Simulator
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  CircuitComponent,
  Wire,
  WireColor,
  SerialLogEntry,
  ComponentType,
} from './types/circuit';
import { COMPONENT_METADATA } from './data/componentDefinitions';
import { PRESET_PROJECTS } from './data/presetProjects';
import { TopNavbar } from './components/TopNavbar';
import { ThreeCircuitWorkbench } from './components/three/ThreeCircuitWorkbench';
import { CodeEditor } from './components/CodeEditor';
import { SerialMonitor } from './components/SerialMonitor';
import { ComponentDrawer } from './components/ComponentDrawer';
import { ArduinoInterpreter } from './utils/arduinoInterpreter';
import { buildConnectivityGraph, isPinGnd, isPinVcc } from './utils/circuitResolver';
import { soundEngine } from './utils/audioEngine';
import { loadGLBFromFile } from './components/three/GLBModelLoader';
import { cargarPines } from './utils/arduinoPins';

export default function App() {
  // Current active project
  const [selectedProjectId, setSelectedProjectId] = useState<string>('blink-led');
  const currentPreset = PRESET_PROJECTS.find((p) => p.id === selectedProjectId) || PRESET_PROJECTS[0];

  // Circuit workspace state (starts empty as requested: clean workshop table)
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [wires, setWires] = useState<Wire[]>([]);
  const [code, setCode] = useState<string>(currentPreset.code);

  // UI state
  const [selectedWireColor, setSelectedWireColor] = useState<WireColor>('#ef4444');
  const [activePanel, setActivePanel] = useState<'split' | 'canvas-only' | 'code-only'>('split');
  const [isComponentDrawerOpen, setIsComponentDrawerOpen] = useState<boolean>(false);
  const [serialHeight, setSerialHeight] = useState<number>(220); // bottom drawer height

  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [pinStates, setPinStates] = useState<Record<string, any>>({});
  const [serialLogs, setSerialLogs] = useState<SerialLogEntry[]>([]);
  const serialInputBufferRef = useRef<string>('');

  // Refs for interpreter and state access
  const interpreterRef = useRef<ArduinoInterpreter | null>(null);
  const componentsRef = useRef<CircuitComponent[]>(components);
  componentsRef.current = components;
  const wiresRef = useRef<Wire[]>(wires);
  wiresRef.current = wires;

  // Format log timestamp
  const getTimestamp = () => {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
  };

  const addSerialLog = useCallback((text: string, type: 'out' | 'in' | 'info' | 'error' = 'out') => {
    setSerialLogs((prev) => [
      ...prev.slice(-300), // Keep last 300 logs for performance
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: getTimestamp(),
        text,
        type,
      },
    ]);
  }, []);

  // Update dynamic component custom configuration (e.g. potValue, distance, etc.)
  const handleUpdateComponentConfig = useCallback((compId: string, key: string, val: any) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === compId
          ? {
              ...c,
              customConfig: {
                ...(c.customConfig || {}),
                [key]: val,
              },
            }
          : c
      )
    );
  }, []);

  // 1. CARGA DEL JSON AL INICIAR
  useEffect(() => {
    async function init() {
      await cargarPines();
      addSerialLog('Mesa de taller lista. Añade un componente.\n', 'info');
    }
    init();
  }, [addSerialLog]);

  // Load Preset Project
  const handleSelectProject = (projId: string) => {
    handleStopSimulation();
    const proj = PRESET_PROJECTS.find((p) => p.id === projId);
    if (!proj) return;
    setSelectedProjectId(projId);
    setComponents(proj.components);
    setWires(proj.wires);
    setCode(proj.code);
    setPinStates({});
    setSerialLogs([
      {
        id: `init-${Date.now()}`,
        timestamp: getTimestamp(),
        text: `[Proyecto cargado]: ${proj.title}\n`,
        type: 'info',
      },
    ]);
  };

  // Add Component from Catalog with individual numbering and custom positioning
  const handleAddComponent = (type: ComponentType, customConfig?: Record<string, any>, nameOverride?: string) => {
    const meta = COMPONENT_METADATA[type];
    let compId = `${type}-${Date.now().toString(36)}`;
    let compName = nameOverride || meta.name;
    let posX = 340 + (Math.random() * 80 - 40);
    let posY = 180 + (Math.random() * 80 - 40);

    // Rule: Only one Arduino UNO allowed on the workbench at a time
    if (type === 'arduino-uno') {
      const alreadyHasArduino = componentsRef.current.some((c) => c.type === 'arduino-uno');
      if (alreadyHasArduino) {
        addSerialLog('[Aviso]: Ya existe un Arduino UNO en la mesa de trabajo (límite: 1).\n', 'info');
        return;
      }
      // Place in exact center of the workshop table
      posX = 350;
      posY = 180;
    }

    if (type === 'led') {
      const existingLeds = componentsRef.current.filter((c) => c.type === 'led');
      let maxNum = 0;
      existingLeds.forEach((c) => {
        const m = c.id.match(/^led-(\d+)$/);
        if (m) {
          const num = parseInt(m[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextIndex = maxNum + 1;
      compId = `led-${nextIndex}`;

      const color = (customConfig?.ledColor || 'red') as string;
      const colorNames: Record<string, string> = {
        red: 'Rojo',
        green: 'Verde',
        blue: 'Azul',
        yellow: 'Amarillo',
        orange: 'Naranja',
        purple: 'Púrpura',
        cyan: 'Cian',
        white: 'Blanco',
        pink: 'Rosa',
        amber: 'Ámbar',
        lime: 'Lima',
        uv: 'UV',
      };
      const colorLabel = colorNames[color] || 'Rojo';
      compName = nameOverride || `LED ${nextIndex} (${colorLabel})`;

      // Arrange newly added LEDs along an orderly offset so they never overlap
      const slot = existingLeds.length;
      posX = 230 + (slot % 5) * 52;
      posY = 220 + Math.floor(slot / 5) * 60;
    }

    const newComp: CircuitComponent = {
      id: compId,
      type,
      name: compName,
      x: posX,
      y: posY,
      rotation: 0,
      pins: meta.pins.map((p) => ({
        ...p,
        label: type === 'led' ? `${compName} - ${p.label}` : p.label,
      })),
      state: meta.defaultState || {},
      customConfig: {
        ...(meta.defaultConfig || {}),
        ...(customConfig || {}),
      },
    };

    setComponents((prev) => [...prev, newComp]);
    addSerialLog(`[Componente añadido]: ${compName} [ID: ${compId}]\n`, 'info');
  };

  // Manual test toggle for individual LEDs
  const handleToggleLed = useCallback((compId: string) => {
    setComponents((prev) =>
      prev.map((c) => {
        if (c.id !== compId) return c;
        const currentB = c.state?.brightness || 0;
        const newB = currentB > 0 ? 0 : 1;
        addSerialLog(`[Prueba LED]: ${c.name} [${c.id}] -> ${newB > 0 ? 'ENCENDIDO' : 'APAGADO'}\n`, 'info');
        return { ...c, state: { ...c.state, brightness: newB } };
      })
    );
  }, [addSerialLog]);

  // Upload and load custom 3D GLB model
  const handleUploadGLB = async (file: File) => {
    try {
      addSerialLog(`[Cargando modelo 3D GLB]: ${file.name}...\n`, 'info');
      const loaded = await loadGLBFromFile(file);

      const customComp: CircuitComponent = {
        id: `custom-glb-${Date.now().toString(36)}`,
        type: 'arduino-uno',
        name: loaded.name || 'Modelo 3D Personalizado',
        x: 350,
        y: 180,
        rotation: 0,
        pins: Object.keys(loaded.pinPositions).length > 0
          ? Object.keys(loaded.pinPositions).map((pId) => ({
              id: pId,
              label: pId,
              type: 'passive',
              x: 0,
              y: 0,
            }))
          : COMPONENT_METADATA['arduino-uno'].pins,
        state: { customGLBScene: loaded.scene },
      };

      setComponents((prev) => [...prev, customComp]);
      addSerialLog(`✓ Modelo 3D "${file.name}" cargado exitosamente en el visor 3D.\n`, 'info');
    } catch (err: any) {
      addSerialLog(`[Error al procesar archivo GLB]: ${err.message || err}\n`, 'error');
    }
  };

  // Build simulator callbacks that evaluate the circuit connectivity graph
  const getSimulatorCallbacks = useCallback(() => {
    return {
      onPinWrite: (pin: string, value: number, isAnalog: boolean) => {
        setPinStates((prev) => ({
          ...prev,
          [pin]: { value, mode: isAnalog ? 'PWM' : 'OUTPUT' },
        }));

        const currentComps = componentsRef.current;
        const currentWires = wiresRef.current;
        const ds = buildConnectivityGraph(currentComps, currentWires);

        // Find MCU component
        const mcu = currentComps.find(
          (c) => c.type === 'arduino-uno' || c.type === 'esp32-devkit'
        );
        if (!mcu) return;

        // Trace effects on connected components
        setComponents((prev) =>
          prev.map((comp) => {
            // 1. LED illumination
            if (comp.type === 'led') {
              const anodeConnected = ds.areConnected(mcu.id, pin, comp.id, 'anode');
              if (anodeConnected) {
                const brightness = isAnalog ? value / 255 : value > 0 ? 1 : 0;
                const prevBrightness = comp.state?.brightness || 0;
                if ((brightness > 0 && prevBrightness === 0) || (brightness === 0 && prevBrightness > 0)) {
                  addSerialLog(
                    `[${comp.name} (${comp.id})]: ${brightness > 0 ? 'ENCENDIDO' : 'APAGADO'} (${isAnalog ? `PWM ${value}` : value > 0 ? 'HIGH' : 'LOW'}) en Pin ${pin}\n`,
                    'out'
                  );
                }
                return { ...comp, state: { ...comp.state, brightness } };
              }
            }

            // 2. RGB LED illumination
            if (comp.type === 'rgb-led') {
              const rConn = ds.areConnected(mcu.id, pin, comp.id, 'red');
              const gConn = ds.areConnected(mcu.id, pin, comp.id, 'green');
              const bConn = ds.areConnected(mcu.id, pin, comp.id, 'blue');
              if (rConn || gConn || bConn) {
                const pwmVal = isAnalog ? value : value > 0 ? 255 : 0;
                return {
                  ...comp,
                  state: {
                    ...comp.state,
                    ...(rConn && { r: pwmVal }),
                    ...(gConn && { g: pwmVal }),
                    ...(bConn && { b: pwmVal }),
                  },
                };
              }
            }

            return comp;
          })
        );
      },

      onPinRead: (pin: string): number => {
        const currentComps = componentsRef.current;
        const currentWires = wiresRef.current;
        const ds = buildConnectivityGraph(currentComps, currentWires);
        const mcu = currentComps.find(
          (c) => c.type === 'arduino-uno' || c.type === 'esp32-devkit'
        );
        if (!mcu) return 0;

        // Check if connected to Pushbutton
        for (const comp of currentComps) {
          if (comp.type === 'pushbutton') {
            const isConn =
              ds.areConnected(mcu.id, pin, comp.id, 'pin1a') ||
              ds.areConnected(mcu.id, pin, comp.id, 'pin1b') ||
              ds.areConnected(mcu.id, pin, comp.id, 'pin2a') ||
              ds.areConnected(mcu.id, pin, comp.id, 'pin2b');
            if (isConn) {
              return comp.customConfig?.isPressed ? 1 : 0;
            }
          }

          // Check if connected to PIR Motion Sensor
          if (comp.type === 'pir-motion') {
            const isConn = ds.areConnected(mcu.id, pin, comp.id, 'out');
            if (isConn) {
              return comp.customConfig?.motionDetected ? 1 : 0;
            }
          }
        }

        return 0;
      },

      onAnalogRead: (pin: string): number => {
        const currentComps = componentsRef.current;
        const currentWires = wiresRef.current;
        const ds = buildConnectivityGraph(currentComps, currentWires);
        const mcu = currentComps.find(
          (c) => c.type === 'arduino-uno' || c.type === 'esp32-devkit'
        );

        // Check virtual DHT reading
        if (pin.includes(':TEMP')) {
          const rawPin = pin.split(':')[0];
          const dht = currentComps.find((c) => c.type === 'dht11');
          return dht?.customConfig?.temperature ?? 24;
        }
        if (pin.includes(':HUM')) {
          const dht = currentComps.find((c) => c.type === 'dht11');
          return dht?.customConfig?.humidity ?? 55;
        }

        if (!mcu) return 0;

        // Check if connected to Potentiometer Wiper
        for (const comp of currentComps) {
          if (comp.type === 'potentiometer') {
            const isConn = ds.areConnected(mcu.id, pin, comp.id, 'wiper');
            if (isConn) {
              return comp.customConfig?.potValue ?? 512;
            }
          }

          // Check if connected to Photoresistor LDR
          if (comp.type === 'photoresistor') {
            const isConn =
              ds.areConnected(mcu.id, pin, comp.id, 'pin1') ||
              ds.areConnected(mcu.id, pin, comp.id, 'pin2');
            if (isConn) {
              const lux = comp.customConfig?.lightLevel ?? 70;
              return Math.round((lux / 100) * 1023);
            }
          }
        }

        // Default analog value if disconnected
        return 0;
      },

      onSerialPrint: (text: string) => {
        addSerialLog(text, 'out');
      },

      onTone: (pin: string, freq: number) => {
        soundEngine.playTone(freq);
        setComponents((prev) =>
          prev.map((c) =>
            c.type === 'buzzer'
              ? { ...c, state: { ...c.state, isPlaying: true, freq } }
              : c
          )
        );
      },

      onNoTone: (pin: string) => {
        soundEngine.stopTone();
        setComponents((prev) =>
          prev.map((c) =>
            c.type === 'buzzer'
              ? { ...c, state: { ...c.state, isPlaying: false, freq: 0 } }
              : c
          )
        );
      },

      onServoWrite: (pin: string, angle: number) => {
        setComponents((prev) =>
          prev.map((c) =>
            c.type === 'sg90-servo'
              ? { ...c, state: { ...c.state, angle } }
              : c
          )
        );
      },

      onLcdPrint: (col: number, row: number, text: string) => {
        setComponents((prev) =>
          prev.map((c) => {
            if (c.type !== 'lcd-1602-i2c') return c;
            const currentLines: [string, string] = c.state?.lines || ['', ''];
            const targetRow = Math.min(1, Math.max(0, row));
            const oldLine = currentLines[targetRow].padEnd(16, ' ');
            const newLine = (
              oldLine.slice(0, col) +
              text +
              oldLine.slice(col + text.length)
            ).slice(0, 16);

            const updatedLines: [string, string] = [...currentLines];
            updatedLines[targetRow] = newLine;
            return {
              ...c,
              state: { ...c.state, lines: updatedLines },
            };
          })
        );
      },

      onLcdClear: () => {
        setComponents((prev) =>
          prev.map((c) =>
            c.type === 'lcd-1602-i2c'
              ? {
                  ...c,
                  state: {
                    ...c.state,
                    lines: ['                ', '                '],
                  },
                }
              : c
          )
        );
      },

      onLcdBacklight: (enabled: boolean) => {
        setComponents((prev) =>
          prev.map((c) =>
            c.type === 'lcd-1602-i2c'
              ? { ...c, state: { ...c.state, backlight: enabled } }
              : c
          )
        );
      },

      onPulseIn: (pin: string, state: number): number => {
        const currentComps = componentsRef.current;
        const currentWires = wiresRef.current;
        const ds = buildConnectivityGraph(currentComps, currentWires);
        const mcu = currentComps.find(
          (c) => c.type === 'arduino-uno' || c.type === 'esp32-devkit'
        );

        if (mcu) {
          const sonar = currentComps.find((c) => c.type === 'hc-sr04');
          if (sonar) {
            const isEchoConn = ds.areConnected(mcu.id, pin, sonar.id, 'echo');
            if (isEchoConn) {
              const distanceCm = sonar.customConfig?.distance ?? 45;
              // Ultrasonic flight time: duration = distance * 58.2 microseconds
              return Math.round(distanceCm * 58.2);
            }
          }
        }
        return 0;
      },

      getSerialInputBuffer: () => serialInputBufferRef.current,

      consumeSerialInput: (count: number) => {
        const chunk = serialInputBufferRef.current.slice(0, count);
        serialInputBufferRef.current = serialInputBufferRef.current.slice(count);
        return chunk;
      },
    };
  }, [addSerialLog]);

  // Start Simulation
  const handleStartSimulation = async () => {
    if (isSimulating && isPaused) {
      // Resume
      interpreterRef.current?.setPaused(false);
      setIsPaused(false);
      return;
    }

    setIsSimulating(true);
    setIsPaused(false);
    addSerialLog('=== INICIANDO SIMULACIÓN DE CIRCUITO ===\n', 'info');

    const callbacks = getSimulatorCallbacks();
    interpreterRef.current = new ArduinoInterpreter(callbacks);
    interpreterRef.current.run(code);
  };

  // Pause Simulation
  const handlePauseSimulation = () => {
    if (!interpreterRef.current) return;
    const nextPaused = !isPaused;
    interpreterRef.current.setPaused(nextPaused);
    setIsPaused(nextPaused);
  };

  // Stop Simulation
  const handleStopSimulation = () => {
    if (interpreterRef.current) {
      interpreterRef.current.stop();
      interpreterRef.current = null;
    }
    soundEngine.stopTone();
    setIsSimulating(false);
    setIsPaused(false);
    setPinStates({});
    // Reset actuator states
    setComponents((prev) =>
      prev.map((c) => {
        if (c.type === 'led') return { ...c, state: { ...c.state, brightness: 0 } };
        if (c.type === 'buzzer') return { ...c, state: { ...c.state, isPlaying: false, freq: 0 } };
        if (c.type === 'rgb-led') return { ...c, state: { ...c.state, r: 0, g: 0, b: 0 } };
        return c;
      })
    );
    addSerialLog('\n[Simulación detenida]\n', 'info');
  };

  // Reset Circuit & Microcontroller
  const handleResetSimulation = () => {
    handleStopSimulation();
    setTimeout(() => {
      handleStartSimulation();
    }, 150);
  };

  // Send input string to Serial
  const handleSendSerialInput = (input: string) => {
    serialInputBufferRef.current += input;
    addSerialLog(input.trim(), 'in');
  };

  // Clear serial logs
  const handleClearLogs = () => {
    setSerialLogs([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      interpreterRef.current?.stop();
      soundEngine.stopTone();
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <TopNavbar
        isSimulating={isSimulating}
        isPaused={isPaused}
        selectedProjectId={selectedProjectId}
        selectedWireColor={selectedWireColor}
        activePanel={activePanel}
        onSelectProject={handleSelectProject}
        onSelectWireColor={setSelectedWireColor}
        onSetActivePanel={setActivePanel}
        onStartSimulation={handleStartSimulation}
        onPauseSimulation={handlePauseSimulation}
        onStopSimulation={handleStopSimulation}
        onResetCircuit={handleResetSimulation}
        onOpenComponentDrawer={() => setIsComponentDrawerOpen(true)}
      />

      {/* Main Workspace Stage */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Circuit Assembly Workbench (3D WebGL or 2D Schema) */}
        {(activePanel === 'split' || activePanel === 'canvas-only') && (
          <div
            className={`relative flex-1 flex flex-col overflow-hidden ${
              activePanel === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <div className="flex-1 relative overflow-hidden">
              <ThreeCircuitWorkbench
                components={components}
                wires={wires}
                selectedWireColor={selectedWireColor}
                isSimulating={isSimulating}
                pinStates={pinStates}
                onComponentsChange={setComponents}
                onWiresChange={setWires}
                onUpdateComponentConfig={handleUpdateComponentConfig}
                onOpenComponentDrawer={() => setIsComponentDrawerOpen(true)}
              />
            </div>

            {/* Bottom Drawer: Serial Monitor & Live Telemetry */}
            <div
              style={{ height: `${serialHeight}px` }}
              className="relative w-full shrink-0 shadow-2xl transition-all"
            >
              <SerialMonitor
                logs={serialLogs}
                components={components}
                pinStates={pinStates}
                wires={wires}
                onClearLogs={handleClearLogs}
                onSendSerialInput={handleSendSerialInput}
                onUpdateComponentConfig={handleUpdateComponentConfig}
                onToggleLed={handleToggleLed}
              />
            </div>
          </div>
        )}

        {/* Right: Arduino C++ Code Editor */}
        {(activePanel === 'split' || activePanel === 'code-only') && (
          <div
            className={`h-full ${
              activePanel === 'split' ? 'w-1/2' : 'w-full'
            }`}
          >
            <CodeEditor
              code={code}
              isSimulating={isSimulating}
              isPaused={isPaused}
              onCodeChange={setCode}
              onStartSimulation={handleStartSimulation}
              onPauseSimulation={handlePauseSimulation}
              onStopSimulation={handleStopSimulation}
              onResetSimulation={handleResetSimulation}
            />
          </div>
        )}
      </div>

      {/* Component Library Catalog Drawer */}
      <ComponentDrawer
        isOpen={isComponentDrawerOpen}
        onClose={() => setIsComponentDrawerOpen(false)}
        onAddComponent={handleAddComponent}
        onUploadGLB={handleUploadGLB}
        components={components}
      />
    </div>
  );
}
