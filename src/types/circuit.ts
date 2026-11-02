/**
 * Circuit Simulation & Component Types
 */

export type ComponentType =
  | 'arduino-uno'
  | 'esp32-devkit'
  | 'breadboard'
  | 'led'
  | 'rgb-led'
  | 'resistor'
  | 'potentiometer'
  | 'hc-sr04'
  | 'sg90-servo'
  | 'lcd-1602-i2c'
  | 'buzzer'
  | 'dht11'
  | 'pushbutton'
  | 'photoresistor'
  | 'pir-motion'
  | 'oled-128x64'
  | 'relay-module'
  | 'ir-obstacle'
  | 'sound-sensor';

export type PinType = 'digital' | 'analog' | 'power' | 'gnd' | 'pwm' | 'i2c' | 'passive';

export interface PinDefinition {
  id: string; // unique within the component e.g. "D13", "GND1", "A0"
  label: string; // displayed in UI
  type: PinType;
  x: number; // coordinate relative to component top-left (in SVG units)
  y: number;
  description?: string;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  name: string;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  pins: PinDefinition[];
  state: Record<string, any>; // component-specific dynamic state (e.g. brightness, angle, value)
  customConfig?: {
    resistance?: number; // for resistors (ohms)
    ledColor?:
      | 'red'
      | 'green'
      | 'blue'
      | 'yellow'
      | 'orange'
      | 'white'
      | 'purple'
      | 'cyan'
      | 'pink'
      | 'amber'
      | 'lime'
      | 'uv';
    potValue?: number; // 0-1023
    distance?: number; // 2-400 cm for HC-SR04
    temperature?: number; // °C for DHT11
    humidity?: number; // % for DHT11
    lightLevel?: number; // 0-100% for LDR
    isPressed?: boolean; // for pushbutton
    motionDetected?: boolean; // for PIR
    state?: boolean; // for relay
    obstacleDetected?: boolean; // for IR
    soundLevel?: number; // for sound sensor
  };
}

export interface Wire {
  id: string;
  fromCompId: string;
  fromPinId: string;
  toCompId: string;
  toPinId: string;
  color: WireColor;
}

export type WireColor =
  | '#ef4444' // Red (5V/VCC)
  | '#1e293b' // Black (GND)
  | '#3b82f6' // Blue
  | '#eab308' // Yellow
  | '#22c55e' // Green
  | '#a855f7' // Purple
  | '#f97316' // Orange
  | '#f8fafc' // White
  | '#06b6d4' // Cyan
  | '#78350f'; // Brown

export interface SerialLogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: 'out' | 'in' | 'info' | 'error';
}

export interface PinElectricalState {
  mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP';
  value: number; // 0 (LOW), 1 (HIGH), or 0-255 (PWM)
  voltage: number; // 0.0 - 5.0 V
}

export interface SimulationState {
  isRunning: boolean;
  isPaused: boolean;
  speed: number; // 1x, 2x, etc.
  elapsedMillis: number;
  pinStates: Record<string, PinElectricalState>; // key e.g. "arduino-1:D13"
  activeBuzzerFreq: number | null;
  servoAngles: Record<string, number>; // componentId -> angle 0-180
  lcdScreens: Record<string, { lines: [string, string]; backlight: boolean }>;
}

export interface PresetProject {
  id: string;
  title: string;
  board: 'Arduino Uno' | 'ESP32';
  description: string;
  components: CircuitComponent[];
  wires: Wire[];
  code: string;
}
