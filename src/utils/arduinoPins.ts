import * as THREE from 'three';

export interface PinCoord {
  x: number;
  y: number;
  z: number;
}

/**
 * Global dictionary of Arduino UNO pin coordinates from Arduino_ultra2.json
 */
export let pinesArduino: Record<string, PinCoord> = {};

/**
 * Dynamically generated whitelist of valid pin identifiers from the JSON
 */
export let PINES_VALIDOS: string[] = [];

/**
 * Bundled backup coordinates in case network fetch encounters latency
 */
const FALLBACK_PINES: Record<string, PinCoord> = {
  "ARD_IOREF": { "x": -0.04, "y": -0.002, "z": -0.024 },
  "ARD_RESET": { "x": -0.04, "y": -0.002, "z": -0.0215 },
  "ARD_33V": { "x": -0.04, "y": -0.002, "z": -0.0191 },
  "ARD_5V": { "x": -0.04, "y": -0.002, "z": -0.0165 },
  "ARD_GND": { "x": -0.04, "y": -0.002, "z": -0.0141 },
  "ARD_GND_1": { "x": -0.04, "y": -0.002, "z": -0.0116 },
  "ARD_VIN": { "x": -0.04, "y": -0.002, "z": -0.009 },
  "ARD_A0": { "x": -0.0401, "y": -0.002, "z": -0.0039 },
  "ARD_A1": { "x": -0.0401, "y": -0.002, "z": -0.0013 },
  "ARD_A2": { "x": -0.0401, "y": -0.002, "z": 0.0011 },
  "ARD_A3": { "x": -0.04, "y": -0.002, "z": 0.0035 },
  "ARD_A4": { "x": -0.04, "y": -0.002, "z": 0.006 },
  "ARD_A5": { "x": -0.04, "y": -0.002, "z": 0.0086 },
  "ARD_D0": { "x": 0.008, "y": -0.002, "z": 0.0087 },
  "ARD_D1": { "x": 0.0079, "y": -0.002, "z": 0.0061 },
  "ARD_D2": { "x": 0.008, "y": -0.002, "z": 0.0037 },
  "ARD_D3": { "x": 0.008, "y": -0.002, "z": 0.0012 },
  "ARD_D4": { "x": 0.0079, "y": -0.002, "z": -0.0014 },
  "ARD_D5": { "x": 0.0078, "y": -0.002, "z": -0.0039 },
  "ARD_D6": { "x": 0.008, "y": -0.002, "z": -0.0064 },
  "ARD_D7": { "x": 0.008, "y": -0.002, "z": -0.0088 },
  "ARD_D8": { "x": 0.008, "y": -0.002, "z": -0.0129 },
  "ARD_D9": { "x": 0.008, "y": -0.002, "z": -0.0155 },
  "ARD_D10": { "x": 0.0081, "y": -0.002, "z": -0.018 },
  "ARD_D11": { "x": 0.0079, "y": -0.002, "z": -0.0206 },
  "ARD_D12": { "x": 0.0079, "y": -0.002, "z": -0.0233 },
  "ARD_D13": { "x": 0.008, "y": -0.002, "z": -0.0255 },
  "ARD_GND_2": { "x": 0.008, "y": -0.002, "z": -0.0281 },
  "ARD_AREF": { "x": 0.008, "y": -0.002, "z": -0.0307 },
  "ARD_SDA": { "x": 0.008, "y": -0.002, "z": -0.033 },
  "ARD_SCL": { "x": 0.0079, "y": -0.002, "z": -0.0356 },
  "ARD_LED": { "x": -0.0007, "y": -0.0033, "z": -0.0264 },
  "ARD_LED_ESTADO": { "x": -0.006, "y": -0.0033, "z": 0.0032 }
};

// Initialize with fallback immediately
pinesArduino = { ...FALLBACK_PINES };
PINES_VALIDOS = Object.keys(pinesArduino);

/**
 * 1. Carga del JSON al iniciar
 * Fetches ./models/Arduino_ultra2.json and populates pinesArduino and PINES_VALIDOS
 */
export async function cargarPines(): Promise<Record<string, PinCoord>> {
  try {
    let response = await fetch('./models/Arduino_ultra2.json');
    if (!response.ok) {
      response = await fetch('/models/Arduino_ultra2.json');
    }
    if (response.ok) {
      const data = await response.json();
      pinesArduino = data;
      PINES_VALIDOS = Object.keys(pinesArduino);
      console.log('[Ultrawire] Pines Arduino cargados exitosamente:', PINES_VALIDOS.length, 'pines.');
    }
  } catch (err) {
    console.warn('[Ultrawire] No se pudo cargar fetch("./models/Arduino_ultra2.json"), usando fallback:', err);
    pinesArduino = { ...FALLBACK_PINES };
    PINES_VALIDOS = Object.keys(pinesArduino);
  }
  return pinesArduino;
}

/**
 * Check if a pin is a connectable header pin (not an onboard indicator LED)
 */
export function isConnectablePin(pinKey: string): boolean {
  return pinKey !== 'ARD_LED' && pinKey !== 'ARD_LED_ESTADO';
}

/**
 * Get human-readable friendly label for a pin
 */
export function getPinFriendlyLabel(pinKey: string): string {
  if (pinKey === 'ARD_LED') return 'LED L (Pin 13)';
  if (pinKey === 'ARD_LED_ESTADO') return 'LED ON (Power)';
  if (pinKey === 'ARD_33V') return '3.3V';
  if (pinKey === 'ARD_5V') return '5V';
  if (pinKey === 'ARD_GND' || pinKey === 'ARD_GND_1' || pinKey === 'ARD_GND_2') return 'GND';
  if (pinKey === 'ARD_VIN') return 'VIN';
  if (pinKey === 'ARD_AREF') return 'AREF';
  if (pinKey === 'ARD_IOREF') return 'IOREF';
  if (pinKey === 'ARD_RESET') return 'RESET';
  if (pinKey === 'ARD_SDA') return 'SDA';
  if (pinKey === 'ARD_SCL') return 'SCL';
  if (pinKey.startsWith('ARD_D')) return pinKey.replace('ARD_', '');
  if (pinKey.startsWith('ARD_A')) return pinKey.replace('ARD_', '');
  return pinKey;
}

export interface ProximityMatch {
  pinKey: string;
  worldPos: THREE.Vector3;
  localPos: THREE.Vector3;
  distanceLocal: number;
  distanceWorld: number;
}

/**
 * 3. LÓGICA DE CLIC (Raycaster por proximidad)
 * 4. TRANSFORMACIÓN DE COORDENADAS
 * Given the world click point and the unscaled root of the Arduino model,
 * finds the nearest pin within the error threshold (0.005 local units / ~0.45 world units).
 */
export function findNearestArduinoPin(
  worldPoint: THREE.Vector3,
  modeloArduino: THREE.Object3D,
  localThreshold: number = 0.0055,
  worldThreshold: number = 0.45
): ProximityMatch | null {
  if (!modeloArduino || !pinesArduino) return null;

  // Convert click point from world to local coordinates of the unscaled GLB model
  const localClick = modeloArduino.worldToLocal(worldPoint.clone());

  let bestMatch: ProximityMatch | null = null;
  let minLocalDist = Infinity;

  for (const pinKey of PINES_VALIDOS) {
    // Only connectable pins (skip indicator LEDs)
    if (!isConnectablePin(pinKey)) continue;

    const coord = pinesArduino[pinKey];
    if (!coord) continue;

    const pinLocal = new THREE.Vector3(coord.x, coord.y, coord.z);
    const distLocal = localClick.distanceTo(pinLocal);

    // Compute exact world position using modeloArduino.localToWorld
    const pinWorld = modeloArduino.localToWorld(pinLocal.clone());
    const distWorld = worldPoint.distanceTo(pinWorld);

    if (distLocal <= localThreshold || distWorld <= worldThreshold) {
      if (distLocal < minLocalDist) {
        minLocalDist = distLocal;
        bestMatch = {
          pinKey,
          worldPos: pinWorld,
          localPos: pinLocal,
          distanceLocal: distLocal,
          distanceWorld: distWorld,
        };
      }
    }
  }

  return bestMatch;
}
