import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { CircuitComponent, ComponentType } from '../../types/circuit';
import {
  pinesArduino,
  PINES_VALIDOS,
  isConnectablePin,
  getPinFriendlyLabel,
} from '../../utils/arduinoPins';

export interface OnboardLedInstance {
  id: string;
  mesh: THREE.Mesh;
  light?: THREE.PointLight;
  color: number;
  baseEmissive: number;
  litEmissive: number;
}

export interface Component3DInstance {
  compId: string;
  type: ComponentType;
  group: THREE.Group;
  pinMeshes: Record<string, THREE.Mesh>;
  glbModel?: THREE.Group;
  rawModelRoot?: THREE.Object3D;
  ledMesh?: THREE.Mesh;
  ledGlowMesh?: THREE.Mesh;
  pointLight?: THREE.PointLight;
  servoHorn?: THREE.Object3D;
  potKnob?: THREE.Object3D;
  onboardLeds?: Record<string, OnboardLedInstance>;
}

export const LED_COLOR_CONFIG: Record<
  string,
  { hex: number; offEmissive: number; litEmissive: number; name: string }
> = {
  red: { hex: 0xef4444, offEmissive: 0x7f1d1d, litEmissive: 0xff2222, name: 'Rojo' },
  green: { hex: 0x22c55e, offEmissive: 0x14532d, litEmissive: 0x22c55e, name: 'Verde' },
  blue: { hex: 0x3b82f6, offEmissive: 0x1e3a8a, litEmissive: 0x60a5fa, name: 'Azul' },
  yellow: { hex: 0xeab308, offEmissive: 0x713f12, litEmissive: 0xfacc15, name: 'Amarillo' },
  orange: { hex: 0xf97316, offEmissive: 0x7c2d12, litEmissive: 0xfb923c, name: 'Naranja' },
  purple: { hex: 0xa855f7, offEmissive: 0x581c87, litEmissive: 0xc084fc, name: 'Púrpura' },
  cyan: { hex: 0x06b6d4, offEmissive: 0x164e63, litEmissive: 0x22d3ee, name: 'Cian' },
  white: { hex: 0xf8fafc, offEmissive: 0x334155, litEmissive: 0xffffff, name: 'Blanco' },
  pink: { hex: 0xec4899, offEmissive: 0x831843, litEmissive: 0xf472b6, name: 'Rosa' },
  amber: { hex: 0xf59e0b, offEmissive: 0x78350f, litEmissive: 0xfbbf24, name: 'Ámbar' },
  lime: { hex: 0x84cc16, offEmissive: 0x365314, litEmissive: 0xa3e635, name: 'Lima' },
  uv: { hex: 0x8b5cf6, offEmissive: 0x4c1d95, litEmissive: 0xa78bfa, name: 'Ultravioleta' },
};

interface PinSpec {
  id: string;
  x: number;
  y: number;
  z: number;
  label: string;
}

interface ModelProfile {
  path: string;
  targetWidth: number; // in centimeters (1 unit = 1 cm)
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
  yOffset?: number;
  pins: PinSpec[];
}

// 1. Precise scale calibration (1 unit = 1 cm) and pin offsets
const PROFILES: Record<ComponentType, ModelProfile> = {
  'arduino-uno': {
    path: '/models/Arduino_ultra2.glb',
    targetWidth: 6.86, // Real Arduino Uno R3 is 6.86 cm x 5.34 cm
    rotationY: 0,
    yOffset: 0.02,
    pins: [
      // Digital pins header (+X edge: X ~ 2.63, Y ~ 0.46)
      // D0..D7 block
      { id: 'D0', x: 2.63, y: 0.46, z: 3.00, label: 'D0 (RX)' },
      { id: 'D1', x: 2.63, y: 0.46, z: 2.70, label: 'D1 (TX)' },
      { id: 'D2', x: 2.63, y: 0.46, z: 2.39, label: 'D2' },
      { id: 'D3', x: 2.63, y: 0.46, z: 2.08, label: 'D3 (~PWM)' },
      { id: 'D4', x: 2.63, y: 0.46, z: 1.78, label: 'D4' },
      { id: 'D5', x: 2.63, y: 0.46, z: 1.47, label: 'D5 (~PWM)' },
      { id: 'D6', x: 2.63, y: 0.46, z: 1.16, label: 'D6 (~PWM)' },
      { id: 'D7', x: 2.63, y: 0.46, z: 0.86, label: 'D7' },
      // D8..D13 + GND + AREF block
      { id: 'D8', x: 2.63, y: 0.46, z: 0.31, label: 'D8' },
      { id: 'D9', x: 2.63, y: 0.46, z: 0.00, label: 'D9 (~PWM)' },
      { id: 'D10', x: 2.63, y: 0.46, z: -0.31, label: 'D10 (~PWM)' },
      { id: 'D11', x: 2.63, y: 0.46, z: -0.61, label: 'D11 (~PWM)' },
      { id: 'D12', x: 2.63, y: 0.46, z: -0.92, label: 'D12' },
      { id: 'D13', x: 2.63, y: 0.46, z: -1.23, label: 'D13 (LED)' },
      { id: 'GND_DIG', x: 2.63, y: 0.46, z: -1.53, label: 'GND' },
      { id: 'AREF', x: 2.63, y: 0.46, z: -1.84, label: 'AREF' },

      // Power header (-X edge: X ~ -2.63, Y ~ 0.46)
      { id: 'IOREF', x: -2.63, y: 0.46, z: 0.86, label: 'IOREF' },
      { id: 'RESET', x: -2.63, y: 0.46, z: 1.16, label: 'RESET' },
      { id: '3V3', x: -2.63, y: 0.46, z: 1.47, label: '3.3V' },
      { id: '5V', x: -2.63, y: 0.46, z: 1.78, label: '5V' },
      { id: 'GND1', x: -2.63, y: 0.46, z: 2.08, label: 'GND' },
      { id: 'GND2', x: -2.63, y: 0.46, z: 2.39, label: 'GND' },
      { id: 'VIN', x: -2.63, y: 0.46, z: 2.70, label: 'VIN' },

      // Analog In header (-X edge: X ~ -2.63, Y ~ 0.46)
      { id: 'A0', x: -2.63, y: 0.46, z: -0.25, label: 'A0' },
      { id: 'A1', x: -2.63, y: 0.46, z: -0.55, label: 'A1' },
      { id: 'A2', x: -2.63, y: 0.46, z: -0.86, label: 'A2' },
      { id: 'A3', x: -2.63, y: 0.46, z: -1.16, label: 'A3' },
      { id: 'A4', x: -2.63, y: 0.46, z: -1.47, label: 'A4 (SDA)' },
      { id: 'A5', x: -2.63, y: 0.46, z: -1.78, label: 'A5 (SCL)' },
    ],
  },

  'esp32-devkit': {
    path: '/models/esp32_wroom_32.glb',
    targetWidth: 5.15, // Real ESP32 DevKit is 5.15 cm x 2.8 cm
    pins: [
      // Left pin row along X at Z = -1.3
      { id: '3V3', x: -2.1, y: 0.22, z: -1.3, label: '3V3' },
      { id: 'EN', x: -1.8, y: 0.22, z: -1.3, label: 'EN' },
      { id: 'VP', x: -1.5, y: 0.22, z: -1.3, label: 'VP (36)' },
      { id: 'VN', x: -1.2, y: 0.22, z: -1.3, label: 'VN (39)' },
      { id: 'D34', x: -0.9, y: 0.22, z: -1.3, label: 'D34' },
      { id: 'D35', x: -0.6, y: 0.22, z: -1.3, label: 'D35' },
      { id: 'D32', x: -0.3, y: 0.22, z: -1.3, label: 'D32' },
      { id: 'D33', x: 0.0, y: 0.22, z: -1.3, label: 'D33' },
      { id: 'D25', x: 0.3, y: 0.22, z: -1.3, label: 'D25' },
      { id: 'D26', x: 0.6, y: 0.22, z: -1.3, label: 'D26' },
      { id: 'D27', x: 0.9, y: 0.22, z: -1.3, label: 'D27' },
      { id: 'D14', x: 1.2, y: 0.22, z: -1.3, label: 'D14' },
      { id: 'D12', x: 1.5, y: 0.22, z: -1.3, label: 'D12' },
      { id: 'D13', x: 1.8, y: 0.22, z: -1.3, label: 'D13' },
      { id: 'GND1', x: 2.1, y: 0.22, z: -1.3, label: 'GND' },

      // Right pin row along X at Z = +1.3
      { id: 'D23', x: -2.1, y: 0.22, z: 1.3, label: 'D23' },
      { id: 'D22', x: -1.8, y: 0.22, z: 1.3, label: 'D22' },
      { id: 'TX0', x: -1.5, y: 0.22, z: 1.3, label: 'TX0' },
      { id: 'RX0', x: -1.2, y: 0.22, z: 1.3, label: 'RX0' },
      { id: 'D21', x: -0.9, y: 0.22, z: 1.3, label: 'D21' },
      { id: 'D19', x: -0.6, y: 0.22, z: 1.3, label: 'D19' },
      { id: 'D18', x: -0.3, y: 0.22, z: 1.3, label: 'D18' },
      { id: 'D5', x: 0.0, y: 0.22, z: 1.3, label: 'D5' },
      { id: 'TX2', x: 0.3, y: 0.22, z: 1.3, label: 'TX2' },
      { id: 'RX2', x: 0.6, y: 0.22, z: 1.3, label: 'RX2' },
      { id: 'D4', x: 0.9, y: 0.22, z: 1.3, label: 'D4' },
      { id: 'D2', x: 1.2, y: 0.22, z: 1.3, label: 'D2' },
      { id: 'D15', x: 1.5, y: 0.22, z: 1.3, label: 'D15' },
      { id: 'GND2', x: 1.8, y: 0.22, z: 1.3, label: 'GND' },
      { id: 'VIN', x: 2.1, y: 0.22, z: 1.3, label: 'VIN' },
    ],
  },

  'breadboard': {
    path: '/models/protoboard.glb',
    targetWidth: 16.5, // Standard 830-point breadboard is 16.5 cm long
    pins: generateBreadboardPinSpecs(),
  },

  'led': {
    path: '/models/led_red.glb',
    targetWidth: 0.65, // Standard 5mm LED: dome diameter ~0.50cm, flange ~0.58cm, leads pitch 0.254cm
    pins: [
      { id: 'anode', x: 0.12, y: 0.05, z: 0, label: 'Ánodo (+)' },
      { id: 'cathode', x: -0.16, y: 0.05, z: 0, label: 'Cátodo (-)' },
    ],
  },

  'rgb-led': {
    path: '/models/led_red.glb',
    targetWidth: 0.70,
    pins: [
      { id: 'red', x: -0.21, y: 0.05, z: 0, label: 'R (Rojo)' },
      { id: 'cathode', x: -0.07, y: 0.05, z: 0, label: 'GND (-)' },
      { id: 'green', x: 0.07, y: 0.05, z: 0, label: 'G (Verde)' },
      { id: 'blue', x: 0.21, y: 0.05, z: 0, label: 'B (Azul)' },
    ],
  },

  'resistor': {
    path: '/models/resistor_220.glb',
    targetWidth: 1.8, // 1/4W resistor with bent leads spans ~1.8 cm
    pins: [
      { id: 'pin1', x: -0.86, y: 0.10, z: 0, label: 'Pin 1' },
      { id: 'pin2', x: 0.86, y: 0.10, z: 0, label: 'Pin 2' },
    ],
  },

  'potentiometer': {
    path: '/models/potentiometer_10k.glb',
    targetWidth: 1.6, // 16mm rotary pot
    pins: [
      { id: 'vcc', x: -0.40, y: 0.10, z: 0.53, label: 'VCC' },
      { id: 'wiper', x: 0.0, y: 0.10, z: 0.53, label: 'Wiper / Señal' },
      { id: 'gnd', x: 0.40, y: 0.10, z: 0.53, label: 'GND' },
    ],
  },

  'hc-sr04': {
    path: '/models/ultrasonic_hc_sr04.glb',
    targetWidth: 4.5, // 4.5 cm wide PCB
    pins: [
      { id: 'vcc', x: -0.53, y: 0.14, z: 0.53, label: 'VCC (+5V)' },
      { id: 'trig', x: -0.18, y: 0.14, z: 0.53, label: 'TRIG' },
      { id: 'echo', x: 0.18, y: 0.14, z: 0.53, label: 'ECHO' },
      { id: 'gnd', x: 0.53, y: 0.14, z: 0.53, label: 'GND' },
    ],
  },

  'sg90-servo': {
    path: '/models/servomotor_sg90.glb',
    targetWidth: 2.6, // 2.3cm body, 2.6cm overall
    pins: [
      { id: 'gnd', x: -0.20, y: 0.16, z: 0.90, label: 'GND (Marrón)' },
      { id: 'vcc', x: 0.0, y: 0.16, z: 0.90, label: 'VCC 5V (Rojo)' },
      { id: 'sig', x: 0.20, y: 0.16, z: 0.90, label: 'Señal PWM (Naranja)' },
    ],
  },

  'lcd-1602-i2c': {
    path: '/models/display_lcd_16x2.glb',
    targetWidth: 8.0, // 8.0 cm PCB width
    pins: [
      { id: 'gnd', x: -1.20, y: 0.34, z: -1.58, label: 'GND' },
      { id: 'vcc', x: -0.73, y: 0.34, z: -1.58, label: 'VCC (5V)' },
      { id: 'sda', x: -0.24, y: 0.34, z: -1.58, label: 'SDA' },
      { id: 'scl', x: 0.24, y: 0.34, z: -1.58, label: 'SCL' },
    ],
  },

  'oled-128x64': {
    path: '/models/display_oled_128x64.glb',
    targetWidth: 2.7, // 0.96" OLED PCB is 2.7 cm x 2.7 cm
    pins: [
      { id: 'gnd', x: -0.43, y: 0.21, z: -1.10, label: 'GND' },
      { id: 'vcc', x: -0.14, y: 0.21, z: -1.10, label: 'VCC (3.3V-5V)' },
      { id: 'scl', x: 0.14, y: 0.21, z: -1.10, label: 'SCL' },
      { id: 'sda', x: 0.43, y: 0.21, z: -1.10, label: 'SDA' },
    ],
  },

  'dht11': {
    path: '/models/dht11.glb',
    targetWidth: 1.55, // 1.55 cm case width
    pins: [
      { id: 'vcc', x: -0.27, y: 0.11, z: 0.32, label: 'VCC' },
      { id: 'data', x: 0.0, y: 0.11, z: 0.32, label: 'DATA' },
      { id: 'gnd', x: 0.27, y: 0.11, z: 0.32, label: 'GND' },
    ],
  },

  'pushbutton': {
    path: '/models/push_button.glb',
    targetWidth: 0.70, // Standard 6x6mm tactile button
    pins: [
      { id: 'pin1a', x: -0.22, y: 0.05, z: -0.22, label: 'Pin 1A' },
      { id: 'pin1b', x: 0.22, y: 0.05, z: -0.22, label: 'Pin 1B' },
      { id: 'pin2a', x: -0.22, y: 0.05, z: 0.22, label: 'Pin 2A' },
      { id: 'pin2b', x: 0.22, y: 0.05, z: 0.22, label: 'Pin 2B' },
    ],
  },

  'photoresistor': {
    path: '/models/ldr.glb',
    targetWidth: 0.55, // 5mm LDR
    pins: [
      { id: 'pin1', x: -0.09, y: 0.05, z: 0, label: 'Pin 1' },
      { id: 'pin2', x: 0.09, y: 0.05, z: 0, label: 'Pin 2' },
    ],
  },

  'relay-module': {
    path: '/models/relay_module.glb',
    targetWidth: 4.3, // 4.3 cm PCB
    pins: [
      { id: 'vcc', x: -0.61, y: 0.34, z: 1.69, label: 'VCC (5V)' },
      { id: 'gnd', x: 0.0, y: 0.34, z: 1.69, label: 'GND' },
      { id: 'in', x: 0.61, y: 0.34, z: 1.69, label: 'IN (Trigger)' },
    ],
  },

  'ir-obstacle': {
    path: '/models/ir_sensor.glb',
    targetWidth: 3.2, // 3.2 cm PCB
    rotationX: Math.PI / 2,
    pins: [
      { id: 'vcc', x: -0.43, y: 0.18, z: 1.35, label: 'VCC' },
      { id: 'gnd', x: 0.0, y: 0.18, z: 1.35, label: 'GND' },
      { id: 'out', x: 0.43, y: 0.18, z: 1.35, label: 'OUT' },
    ],
  },

  'sound-sensor': {
    path: '/models/sound_sensor.glb',
    targetWidth: 3.2,
    rotationX: Math.PI / 2,
    pins: [
      { id: 'vcc', x: -0.55, y: 0.18, z: 1.35, label: 'VCC (5V)' },
      { id: 'gnd', x: -0.18, y: 0.18, z: 1.35, label: 'GND' },
      { id: 'do', x: 0.18, y: 0.18, z: 1.35, label: 'DO (Digital)' },
      { id: 'ao', x: 0.55, y: 0.18, z: 1.35, label: 'AO (Analog)' },
    ],
  },

  'buzzer': {
    path: '/models/potentiometer_10k.glb',
    targetWidth: 1.2,
    pins: [
      { id: 'positive', x: -0.19, y: 0.08, z: 0, label: 'Positivo (+)' },
      { id: 'negative', x: 0.19, y: 0.08, z: 0, label: 'Negativo (-)' },
    ],
  },

  'pir-motion': {
    path: '/models/ultrasonic_hc_sr04.glb',
    targetWidth: 2.8,
    pins: [
      { id: 'vcc', x: -0.41, y: 0.18, z: 0.59, label: 'VCC' },
      { id: 'out', x: 0.0, y: 0.18, z: 0.59, label: 'OUT' },
      { id: 'gnd', x: 0.41, y: 0.18, z: 0.59, label: 'GND' },
    ],
  },
};

function generateBreadboardPinSpecs(): PinSpec[] {
  const specs: PinSpec[] = [];
  // Top power rails (+ and -): 20 accessible pins across X
  for (let i = 0; i < 20; i++) {
    const x = -6.85 + i * 0.72;
    specs.push({
      id: `pwr_top_plus_${i}`,
      x,
      y: 0.48,
      z: -2.88,
      label: `+ (${i + 1})`,
    });
    specs.push({
      id: `pwr_top_minus_${i}`,
      x,
      y: 0.48,
      z: -2.34,
      label: `- (${i + 1})`,
    });
  }

  // Bottom power rails (+ and -)
  for (let i = 0; i < 20; i++) {
    const x = -6.85 + i * 0.72;
    specs.push({
      id: `pwr_bot_plus_${i}`,
      x,
      y: 0.48,
      z: 2.88,
      label: `+ (${i + 1})`,
    });
    specs.push({
      id: `pwr_bot_minus_${i}`,
      x,
      y: 0.48,
      z: 2.34,
      label: `- (${i + 1})`,
    });
  }

  // 30 terminal strip columns
  const rows = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
  const zOffsets = [-1.65, -1.30, -0.96, -0.62, -0.27, 0.27, 0.62, 0.96, 1.30, 1.65];

  for (let col = 1; col <= 30; col++) {
    const x = -6.85 + (col - 1) * 0.474;
    rows.forEach((r, idx) => {
      specs.push({
        id: `${r}${col}`,
        x,
        y: 0.48,
        z: zOffsets[idx],
        label: `${r.toUpperCase()}${col}`,
      });
    });
  }

  return specs;
}

// 2. Setup GLTFLoader with DRACOLoader once
const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/gltf/');
gltfLoader.setDRACOLoader(dracoLoader);

// Model prototype cache: path -> THREE.Group
const rawModelCache: Map<string, THREE.Group> = new Map();
const loadPromises: Map<string, Promise<THREE.Group>> = new Map();

// Pin hitboxes: 100% invisible for rendering so no pegs or dots stick out unnaturally,
// while remaining fully active for Three.js raycasting!
const defaultPinMaterial = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
});

const pinGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.20, 8);

/**
 * Loads and caches raw GLB model with automatic bounding-box normalization
 */
async function loadModel(profile: ModelProfile): Promise<THREE.Group> {
  const cached = rawModelCache.get(profile.path);
  if (cached) {
    return cached.clone(true);
  }

  if (loadPromises.has(profile.path)) {
    const root = await loadPromises.get(profile.path)!;
    return root.clone(true);
  }

  const promise = new Promise<THREE.Group>((resolve, reject) => {
    gltfLoader.load(
      profile.path,
      (gltf) => {
        const root = gltf.scene;

        let meshIdx = 0;
        root.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            if (meshIdx < 8) {
              mesh.castShadow = true;
            }
            mesh.receiveShadow = true;
            meshIdx++;
          }
        });

        // 1. Apply initial profile rotations
        if (profile.rotationX) root.rotation.x = profile.rotationX;
        if (profile.rotationY) root.rotation.y = profile.rotationY;
        if (profile.rotationZ) root.rotation.z = profile.rotationZ;
        root.updateMatrixWorld(true);

        // 2. Measure actual oriented bounding box
        const bbox = new THREE.Box3().setFromObject(root);
        const size = new THREE.Vector3();
        bbox.getSize(size);
        const center = new THREE.Vector3();
        bbox.getCenter(center);

        // 3. Compute scale factor from target width
        const maxDim = Math.max(size.x, size.z, 0.001);
        const scale = profile.targetWidth / maxDim;

        // 4. Anchor group encapsulates centering and uniform scaling
        // This ensures the model bottom is ALWAYS seated at Y = 0 on the workbench
        const anchor = new THREE.Group();
        anchor.name = 'GLB_Anchor';
        anchor.add(root);

        root.position.x = -center.x;
        root.position.y = -bbox.min.y;
        root.position.z = -center.z;

        anchor.scale.setScalar(scale);

        if (profile.yOffset) {
          anchor.position.y += profile.yOffset;
        }

        const container = new THREE.Group();
        container.add(anchor);
        container.userData = { rawRoot: root };
        anchor.userData = { rawRoot: root };

        rawModelCache.set(profile.path, container);
        resolve(container);
      },
      undefined,
      (err) => {
        console.warn(`[GLBCircuitFactory] Error loading ${profile.path}:`, err);
        reject(err);
      }
    );
  });

  loadPromises.set(profile.path, promise);
  const result = await promise;
  return result.clone(true);
}

/**
 * Creates miniature SMD LED indicators for microcontroller and sensor boards
 */
function createSmdLed(
  id: string,
  x: number,
  y: number,
  z: number,
  color: number,
  baseEmissive: number,
  litEmissive: number
): OnboardLedInstance {
  const geo = new THREE.BoxGeometry(0.12, 0.04, 0.08);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(baseEmissive),
    emissiveIntensity: 0.25,
    roughness: 0.2,
    metalness: 0.1,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.name = `SMD_LED_${id}`;

  const light = new THREE.PointLight(color, 0, 1.5, 2.0);
  light.position.set(x, y + 0.05, z);

  return { id, mesh, light, color, baseEmissive, litEmissive };
}

/**
 * Creates a clean 3D circuit component using strictly authentic GLB 3D models,
 * uniform real-world centimeter scaling, and invisible pin sockets.
 */
export async function createComponent3D(comp: CircuitComponent): Promise<Component3DInstance> {
  const group = new THREE.Group();
  group.name = `${comp.type}-${comp.id}`;
  group.userData = { compId: comp.id, type: comp.type };

  const pinMeshes: Record<string, THREE.Mesh> = {};
  const onboardLeds: Record<string, OnboardLedInstance> = {};
  const profile = PROFILES[comp.type] || PROFILES['arduino-uno'];

  let glbModel: THREE.Group | undefined;
  let ledMesh: THREE.Mesh | undefined;
  let ledGlowMesh: THREE.Mesh | undefined;
  let pointLight: THREE.PointLight | undefined;
  let servoHorn: THREE.Object3D | undefined;
  let potKnob: THREE.Object3D | undefined;

  try {
    glbModel = await loadModel(profile);
    glbModel.name = 'GLB_Root';
    group.add(glbModel);

    // Identify dynamic meshes and enhance materials for LED (Strict capsule vs. leads separation)
    if (comp.type === 'led' || comp.type === 'rgb-led') {
      const colorName = comp.customConfig?.ledColor || (comp.type === 'rgb-led' ? 'red' : 'red');
      const palette = LED_COLOR_CONFIG[colorName] || LED_COLOR_CONFIG.red;

      let capsuleMesh: THREE.Mesh | null = null;
      const pinLeadMeshes: THREE.Mesh[] = [];

      glbModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          const childName = (child.name || '').toLowerCase();
          const matName = ((m.material as any)?.name || '').toLowerCase();

          // Capsule identification: vidro, glass, lens, dome, capsula
          const isCapsule =
            childName.includes('vidro') ||
            childName.includes('glass') ||
            childName.includes('lens') ||
            childName.includes('capsul') ||
            childName.includes('dome') ||
            childName.includes('bulb') ||
            matName.includes('vidro') ||
            matName.includes('glass');

          // Leads identification: aluminio, metal, lead, pin, patilla
          const isPins =
            childName.includes('aluminio') ||
            childName.includes('alum') ||
            childName.includes('lead') ||
            childName.includes('pin') ||
            childName.includes('patill') ||
            childName.includes('leg') ||
            matName.includes('aluminio') ||
            matName.includes('alum');

          if (isCapsule) {
            capsuleMesh = m;
          } else if (isPins) {
            pinLeadMeshes.push(m);
          } else if (childName.includes('cobre') || matName.includes('cobre')) {
            // Internal copper cup inside the bulb
            m.material = new THREE.MeshStandardMaterial({
              color: 0xf59e0b,
              metalness: 0.85,
              roughness: 0.25,
              emissive: new THREE.Color(0x000000),
              emissiveIntensity: 0,
            });
          }
        }
      });

      // Height fallback: If mesh names were generic, the upper mesh is the bulb capsule
      let targetCapsule: THREE.Mesh | null = capsuleMesh;
      if (!targetCapsule) {
        let highestY = -Infinity;
        glbModel.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            const bbox = new THREE.Box3().setFromObject(m);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            if (center.y > highestY) {
              highestY = center.y;
              targetCapsule = m;
            }
          }
        });
      }

      // 1. Configure the Capsule (epoxy dome / bulb) - ONLY this part emits light!
      if (targetCapsule) {
        const domeMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(palette.hex),
          emissive: new THREE.Color(palette.offEmissive),
          emissiveIntensity: 0.35,
          roughness: 0.12,
          metalness: 0.04,
          transparent: true,
          opacity: 0.92,
          depthWrite: true,
        });
        (targetCapsule as THREE.Mesh).material = domeMat;
        (targetCapsule as THREE.Mesh).castShadow = true;
        ledMesh = targetCapsule as THREE.Mesh;
      }

      // 2. Configure the Pins / Leads (patillas) - STRICTLY non-emissive matte metal
      pinLeadMeshes.forEach((pinMesh) => {
        pinMesh.material = new THREE.MeshStandardMaterial({
          color: 0x94a3b8, // Clean matte metallic silver
          metalness: 0.88,
          roughness: 0.40,
          emissive: new THREE.Color(0x000000), // NO glow on legs
          emissiveIntensity: 0,
        });
        pinMesh.castShadow = true;
        pinMesh.receiveShadow = false;
      });

      // 3. Find accurate capsule center to seat the light and glow INSIDE the bulb
      const capsuleCenter = new THREE.Vector3(0, 1.75, 0);
      if (capsuleMesh) {
        const box = new THREE.Box3().setFromObject(capsuleMesh);
        box.getCenter(capsuleCenter);
      }

      // Internal glowing core for rich realistic bloom (inside capsule)
      const glowGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const glowMat = new THREE.MeshBasicMaterial({
        color: palette.hex,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      ledGlowMesh = new THREE.Mesh(glowGeo, glowMat);
      ledGlowMesh.position.copy(capsuleCenter);
      group.add(ledGlowMesh);

      // Create dynamic point light strictly located inside the LED bulb capsule
      pointLight = new THREE.PointLight(palette.hex, 0, 2.5, 2.0);
      pointLight.position.copy(capsuleCenter);
      group.add(pointLight);
    } else if (comp.type === 'sg90-servo') {
      glbModel.traverse((child) => {
        if (child.name.toLowerCase().includes('horn') || child.name.toLowerCase().includes('braço') || child.name.toLowerCase().includes('gear')) {
          servoHorn = child;
        }
      });
      if (!servoHorn && glbModel.children[0]) {
        servoHorn = glbModel.children[0];
      }
    }

    const rawModelRoot: THREE.Object3D | undefined =
      (glbModel as any)?.userData?.rawRoot ||
      glbModel?.children[0]?.children[0] ||
      glbModel;

    // 2. Add Realistic SMD Module LEDs to Boards
    if (comp.type === 'arduino-uno') {
      // 5. LEDS: Use exact coordinates of ARD_LED and ARD_LED_ESTADO from Arduino_ultra2.json
      const ledCoord = pinesArduino['ARD_LED'] || { x: -0.0007, y: -0.0033, z: -0.0264 };
      const pwrCoord = pinesArduino['ARD_LED_ESTADO'] || { x: -0.006, y: -0.0033, z: 0.0032 };

      if (rawModelRoot) {
        // ARD_LED (Pin 13 builtin Amber LED)
        const ledGeo = new THREE.BoxGeometry(0.0016, 0.0008, 0.0012);
        const ledMat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          emissive: 0x78350f,
          emissiveIntensity: 0.15,
          roughness: 0.2,
          metalness: 0.1,
        });
        const d13LedMesh = new THREE.Mesh(ledGeo, ledMat);
        d13LedMesh.position.set(ledCoord.x, ledCoord.y + 0.0004, ledCoord.z);
        d13LedMesh.name = 'SMD_LED_ARD_LED';
        rawModelRoot.add(d13LedMesh);

        const d13Light = new THREE.PointLight(0xf59e0b, 0, 1.2, 2.0);
        d13Light.position.set(ledCoord.x, ledCoord.y + 0.001, ledCoord.z);
        rawModelRoot.add(d13Light);

        const instD13: OnboardLedInstance = {
          id: 'ARD_LED',
          mesh: d13LedMesh,
          light: d13Light,
          color: 0xf59e0b,
          baseEmissive: 0x78350f,
          litEmissive: 0xf59e0b,
        };
        onboardLeds['ARD_LED'] = instD13;
        onboardLeds['L'] = instD13;

        // ARD_LED_ESTADO (Power ON Green LED)
        const pwrGeo = new THREE.BoxGeometry(0.0016, 0.0008, 0.0012);
        const pwrMat = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          emissive: 0x14532d,
          emissiveIntensity: 0.2,
          roughness: 0.2,
          metalness: 0.1,
        });
        const pwrLedMesh = new THREE.Mesh(pwrGeo, pwrMat);
        pwrLedMesh.position.set(pwrCoord.x, pwrCoord.y + 0.0004, pwrCoord.z);
        pwrLedMesh.name = 'SMD_LED_ARD_LED_ESTADO';
        rawModelRoot.add(pwrLedMesh);

        const pwrLight = new THREE.PointLight(0x22c55e, 0, 1.2, 2.0);
        pwrLight.position.set(pwrCoord.x, pwrCoord.y + 0.001, pwrCoord.z);
        rawModelRoot.add(pwrLight);

        const instPwr: OnboardLedInstance = {
          id: 'ARD_LED_ESTADO',
          mesh: pwrLedMesh,
          light: pwrLight,
          color: 0x22c55e,
          baseEmissive: 0x14532d,
          litEmissive: 0x22c55e,
        };
        onboardLeds['ARD_LED_ESTADO'] = instPwr;
        onboardLeds['ON'] = instPwr;
      }
    } else if (comp.type === 'esp32-devkit') {
      // ESP32 SMD LEDs: PWR (Red), D2 (Blue)
      const espLeds = [
        createSmdLed('PWR', -0.20, 0.22, -0.80, 0xef4444, 0x7f1d1d, 0xff2222),
        createSmdLed('D2', 0.20, 0.22, -0.80, 0x3b82f6, 0x1e3a8a, 0x60a5fa),
      ];
      espLeds.forEach((led) => {
        group.add(led.mesh);
        if (led.light) group.add(led.light);
        onboardLeds[led.id] = led;
      });
    } else if (comp.type === 'relay-module') {
      // Relay Module SMD LEDs: PWR (Red), STATE (Green)
      const relayLeds = [
        createSmdLed('PWR', -0.60, 0.35, 1.20, 0xef4444, 0x7f1d1d, 0xff2222),
        createSmdLed('STATE', 0.60, 0.35, 1.20, 0x22c55e, 0x14532d, 0x22c55e),
      ];
      relayLeds.forEach((led) => {
        group.add(led.mesh);
        if (led.light) group.add(led.light);
        onboardLeds[led.id] = led;
      });
    } else if (comp.type === 'ir-obstacle') {
      // IR Sensor: PWR (Red), OUT (Green)
      const irLeds = [
        createSmdLed('PWR', -0.30, 0.18, 0.50, 0xef4444, 0x7f1d1d, 0xff2222),
        createSmdLed('OUT', 0.30, 0.18, 0.50, 0x22c55e, 0x14532d, 0x22c55e),
      ];
      irLeds.forEach((led) => {
        group.add(led.mesh);
        if (led.light) group.add(led.light);
        onboardLeds[led.id] = led;
      });
    } else if (comp.type === 'sound-sensor') {
      // Sound Sensor: PWR (Red), OUT (Green)
      const soundLeds = [
        createSmdLed('PWR', -0.30, 0.18, 0.50, 0xef4444, 0x7f1d1d, 0xff2222),
        createSmdLed('OUT', 0.30, 0.18, 0.50, 0x22c55e, 0x14532d, 0x22c55e),
      ];
      soundLeds.forEach((led) => {
        group.add(led.mesh);
        if (led.light) group.add(led.light);
        onboardLeds[led.id] = led;
      });
    }
  } catch (err) {
    console.error(`Failed to load GLB for ${comp.type}:`, err);
    const placeholder = new THREE.Mesh(
      new THREE.BoxGeometry(2, 0.5, 2),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    group.add(placeholder);
  }

  const rawModelRoot: THREE.Object3D | undefined =
    (glbModel as any)?.userData?.rawRoot ||
    glbModel?.children[0]?.children[0] ||
    glbModel;

  // 3. Attach Precision Pin Hitboxes
  if (comp.type === 'arduino-uno' && rawModelRoot && Object.keys(pinesArduino).length > 0) {
    // Exact JSON coordinates mounted in the unscaled local space of the Arduino model
    const pinGeoLocal = new THREE.CylinderGeometry(0.0012, 0.0012, 0.0025, 8);
    for (const pinKey of PINES_VALIDOS) {
      if (!isConnectablePin(pinKey)) continue;
      const coord = pinesArduino[pinKey];
      if (!coord) continue;

      const pin = new THREE.Mesh(pinGeoLocal, defaultPinMaterial.clone());
      pin.position.set(coord.x, coord.y, coord.z);
      pin.userData = {
        isPin: true,
        compId: comp.id,
        pinId: pinKey,
        label: `${comp.name} - ${getPinFriendlyLabel(pinKey)}`,
      };
      rawModelRoot.add(pin);
      pinMeshes[pinKey] = pin;

      // Also provide standard aliases without ARD_ prefix so existing sketches/wires work seamlessly
      const short = pinKey.replace('ARD_', '');
      pinMeshes[short] = pin;
      if (pinKey === 'ARD_33V') pinMeshes['3V3'] = pin;
      if (pinKey === 'ARD_GND') pinMeshes['GND1'] = pin;
      if (pinKey === 'ARD_GND_1') pinMeshes['GND2'] = pin;
      if (pinKey === 'ARD_GND_2') pinMeshes['GND_DIG'] = pin;
    }
  } else {
    const pinsToMount = profile.pins;
    pinsToMount.forEach((pinSpec) => {
      const pin = new THREE.Mesh(pinGeometry, defaultPinMaterial.clone());
      pin.position.set(pinSpec.x, pinSpec.y, pinSpec.z);
      pin.userData = {
        isPin: true,
        compId: comp.id,
        pinId: pinSpec.id,
        label: `${comp.name} - ${pinSpec.label}`,
      };
      group.add(pin);
      pinMeshes[pinSpec.id] = pin;
    });
  }

  const instance: Component3DInstance = {
    compId: comp.id,
    type: comp.type,
    group,
    pinMeshes,
    glbModel,
    rawModelRoot,
    ledMesh,
    ledGlowMesh,
    pointLight,
    servoHorn,
    potKnob,
    onboardLeds,
  };

  // Apply initial simulation state
  updateComponentDynamicState(instance, comp, false, {});

  return instance;
}

/**
 * Updates dynamic states (LED emission, module LEDs, servo angle) with ultra-fast 60 FPS execution
 */
export function updateComponentDynamicState(
  inst: Component3DInstance,
  comp: CircuitComponent,
  isSimulating: boolean = false,
  pinStates: Record<string, any> = {}
) {
  // 1. Standalone LED / RGB-LED Glow
  if (inst.ledMesh) {
    const mat = inst.ledMesh.material as THREE.MeshStandardMaterial;
    if (mat) {
      if (comp.type === 'led') {
        const brightness = comp.state?.brightness || 0;
        const colorName = comp.customConfig?.ledColor || 'red';
        const palette = LED_COLOR_CONFIG[colorName] || LED_COLOR_CONFIG.red;

        mat.color.setHex(palette.hex);
        if (brightness > 0) {
          mat.emissive.setHex(palette.litEmissive);
          mat.emissiveIntensity = 1.0 + 3.8 * brightness;
          mat.opacity = 0.96;
          if (inst.ledGlowMesh) {
            (inst.ledGlowMesh.material as THREE.MeshBasicMaterial).color.setHex(palette.hex);
            (inst.ledGlowMesh.material as THREE.MeshBasicMaterial).opacity = 0.85 * brightness;
          }
          if (inst.pointLight) {
            inst.pointLight.color.setHex(palette.hex);
            inst.pointLight.intensity = 4.2 * brightness;
          }
        } else {
          mat.emissive.setHex(palette.offEmissive);
          mat.emissiveIntensity = 0.35;
          mat.opacity = 0.90;
          if (inst.ledGlowMesh) {
            (inst.ledGlowMesh.material as THREE.MeshBasicMaterial).opacity = 0;
          }
          if (inst.pointLight) {
            inst.pointLight.intensity = 0;
          }
        }
      } else if (comp.type === 'rgb-led') {
        const r = (comp.state?.r || 0) / 255;
        const g = (comp.state?.g || 0) / 255;
        const b = (comp.state?.b || 0) / 255;
        const isLit = r > 0 || g > 0 || b > 0;
        if (isLit) {
          mat.color.setRGB(r, g, b);
          mat.emissive.setRGB(r, g, b);
          mat.emissiveIntensity = 3.6;
          mat.opacity = 0.96;
          if (inst.ledGlowMesh) {
            (inst.ledGlowMesh.material as THREE.MeshBasicMaterial).color.setRGB(r, g, b);
            (inst.ledGlowMesh.material as THREE.MeshBasicMaterial).opacity = 0.85;
          }
          if (inst.pointLight) {
            inst.pointLight.color.setRGB(r, g, b);
            inst.pointLight.intensity = 4.2;
          }
        } else {
          mat.color.setHex(0xf1f5f9);
          mat.emissive.setHex(0x64748b);
          mat.emissiveIntensity = 0.25;
          mat.opacity = 0.85;
          if (inst.ledGlowMesh) {
            (inst.ledGlowMesh.material as THREE.MeshBasicMaterial).opacity = 0;
          }
          if (inst.pointLight) {
            inst.pointLight.intensity = 0;
          }
        }
      }
    }
  }

  // 2. Module On-Board SMD LEDs (Arduino Uno, ESP32, Relay, Sensors)
  if (inst.onboardLeds) {
    if (inst.type === 'arduino-uno') {
      const onLed = inst.onboardLeds['ARD_LED_ESTADO'] || inst.onboardLeds['ON'];
      const lLed = inst.onboardLeds['ARD_LED'] || inst.onboardLeds['L'];
      const txLed = inst.onboardLeds['TX'];
      const rxLed = inst.onboardLeds['RX'];

      if (isSimulating) {
        // ON LED (ARD_LED_ESTADO) is lit whenever circuit is powered
        if (onLed) setSmdLedState(onLed, true, 3.2, 0.8);

        // L LED (ARD_LED) tracks Digital Pin 13
        const d13Val =
          pinStates['13']?.value ??
          pinStates['D13']?.value ??
          pinStates['ARD_D13']?.value ??
          pinStates[`${comp.id}:D13`]?.value ??
          pinStates[`${comp.id}:ARD_D13`]?.value ??
          pinStates[`${comp.id}:13`]?.value ??
          comp.state?.pin13 ??
          0;

        const isD13Lit = d13Val > 0;
        if (lLed) setSmdLedState(lLed, isD13Lit, 4.0, 1.2);

        // TX/RX LEDs pulse during serial activity
        const isTxLit = Math.random() < 0.15;
        const isRxLit = Math.random() < 0.08;
        if (txLed) setSmdLedState(txLed, isTxLit, 2.5, 0.4);
        if (rxLed) setSmdLedState(rxLed, isRxLit, 2.5, 0.4);
      } else {
        if (onLed) setSmdLedState(onLed, false, 0.1, 0);
        if (lLed) setSmdLedState(lLed, false, 0.1, 0);
        if (txLed) setSmdLedState(txLed, false, 0.1, 0);
        if (rxLed) setSmdLedState(rxLed, false, 0.1, 0);
      }
    } else if (inst.type === 'esp32-devkit') {
      const pwrLed = inst.onboardLeds['PWR'];
      const d2Led = inst.onboardLeds['D2'];

      if (isSimulating) {
        if (pwrLed) setSmdLedState(pwrLed, true, 3.2, 0.8);
        const d2Val =
          pinStates['2']?.value ??
          pinStates['D2']?.value ??
          pinStates[`${comp.id}:D2`]?.value ??
          0;
        if (d2Led) setSmdLedState(d2Led, d2Val > 0, 3.8, 1.0);
      } else {
        if (pwrLed) setSmdLedState(pwrLed, false, 0.1, 0);
        if (d2Led) setSmdLedState(d2Led, false, 0.1, 0);
      }
    } else if (inst.type === 'relay-module') {
      const pwrLed = inst.onboardLeds['PWR'];
      const stateLed = inst.onboardLeds['STATE'];

      if (isSimulating) {
        if (pwrLed) setSmdLedState(pwrLed, true, 3.2, 0.8);
        const isRelayOn = !!comp.customConfig?.state || !!comp.state?.state;
        if (stateLed) setSmdLedState(stateLed, isRelayOn, 3.8, 1.0);
      } else {
        if (pwrLed) setSmdLedState(pwrLed, false, 0.1, 0);
        if (stateLed) setSmdLedState(stateLed, false, 0.1, 0);
      }
    } else if (inst.type === 'ir-obstacle') {
      const pwrLed = inst.onboardLeds['PWR'];
      const outLed = inst.onboardLeds['OUT'];

      if (isSimulating) {
        if (pwrLed) setSmdLedState(pwrLed, true, 3.0, 0.6);
        const isObstacle = !!comp.customConfig?.obstacleDetected;
        if (outLed) setSmdLedState(outLed, isObstacle, 3.8, 1.0);
      } else {
        if (pwrLed) setSmdLedState(pwrLed, false, 0.1, 0);
        if (outLed) setSmdLedState(outLed, false, 0.1, 0);
      }
    } else if (inst.type === 'sound-sensor') {
      const pwrLed = inst.onboardLeds['PWR'];
      const outLed = inst.onboardLeds['OUT'];

      if (isSimulating) {
        if (pwrLed) setSmdLedState(pwrLed, true, 3.0, 0.6);
        const soundLevel = comp.customConfig?.soundLevel ?? 40;
        if (outLed) setSmdLedState(outLed, soundLevel > 60, 3.8, 1.0);
      } else {
        if (pwrLed) setSmdLedState(pwrLed, false, 0.1, 0);
        if (outLed) setSmdLedState(outLed, false, 0.1, 0);
      }
    }
  }

  // 3. SG90 Servo Angle
  if (inst.servoHorn && typeof comp.state?.angle === 'number') {
    const angleRad = THREE.MathUtils.degToRad(comp.state.angle - 90);
    inst.servoHorn.rotation.y = angleRad;
  }
}

function setSmdLedState(
  smd: OnboardLedInstance,
  isLit: boolean,
  emissiveIntensity: number,
  lightIntensity: number
) {
  const mat = smd.mesh.material as THREE.MeshStandardMaterial;
  if (mat) {
    if (isLit) {
      mat.emissive.setHex(smd.litEmissive);
      mat.emissiveIntensity = emissiveIntensity;
      if (smd.light) {
        smd.light.color.setHex(smd.color);
        smd.light.intensity = lightIntensity;
      }
    } else {
      mat.emissive.setHex(smd.baseEmissive);
      mat.emissiveIntensity = 0.15;
      if (smd.light) {
        smd.light.intensity = 0;
      }
    }
  }
}
