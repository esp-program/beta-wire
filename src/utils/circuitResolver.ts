import { CircuitComponent, Wire } from '../types/circuit';

export interface PinIdentifier {
  compId: string;
  pinId: string;
}

export class DisjointSet {
  parent: Map<string, string> = new Map();

  key(compId: string, pinId: string): string {
    return `${compId}::${pinId}`;
  }

  find(item: string): string {
    if (!this.parent.has(item)) {
      this.parent.set(item, item);
      return item;
    }
    if (this.parent.get(item) !== item) {
      this.parent.set(item, this.find(this.parent.get(item)!));
    }
    return this.parent.get(item)!;
  }

  union(a: string, b: string): void {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA !== rootB) {
      this.parent.set(rootA, rootB);
    }
  }

  areConnected(c1: string, p1: string, c2: string, p2: string): boolean {
    return this.find(this.key(c1, p1)) === this.find(this.key(c2, p2));
  }
}

/**
 * Resolves electrical connectivity graph across all components, breadboards, and wires.
 */
export function buildConnectivityGraph(
  components: CircuitComponent[],
  wires: Wire[]
): DisjointSet {
  const ds = new DisjointSet();

  // 1. Breadboard internal rail connectivity
  for (const comp of components) {
    if (comp.type === 'breadboard') {
      // Top power rail (+)
      for (let i = 1; i < 20; i++) {
        ds.union(
          ds.key(comp.id, `pwr_top_plus_0`),
          ds.key(comp.id, `pwr_top_plus_${i}`)
        );
      }
      // Top power rail (-)
      for (let i = 1; i < 20; i++) {
        ds.union(
          ds.key(comp.id, `pwr_top_minus_0`),
          ds.key(comp.id, `pwr_top_minus_${i}`)
        );
      }
      // Bottom power rail (+)
      for (let i = 1; i < 20; i++) {
        ds.union(
          ds.key(comp.id, `pwr_bot_plus_0`),
          ds.key(comp.id, `pwr_bot_plus_${i}`)
        );
      }
      // Bottom power rail (-)
      for (let i = 1; i < 20; i++) {
        ds.union(
          ds.key(comp.id, `pwr_bot_minus_0`),
          ds.key(comp.id, `pwr_bot_minus_${i}`)
        );
      }

      // 30 Columns: group E & A (top bank) and group F & J (bottom bank)
      for (let col = 1; col <= 30; col++) {
        ds.union(
          ds.key(comp.id, `col_${col}_e`),
          ds.key(comp.id, `col_${col}_a`)
        );
        ds.union(
          ds.key(comp.id, `col_${col}_f`),
          ds.key(comp.id, `col_${col}_j`)
        );
      }
    }

    // Pushbutton internal connections (1a and 1b are connected; 2a and 2b are connected)
    if (comp.type === 'pushbutton') {
      ds.union(ds.key(comp.id, 'pin1a'), ds.key(comp.id, 'pin1b'));
      ds.union(ds.key(comp.id, 'pin2a'), ds.key(comp.id, 'pin2b'));
      // When pressed, 1 and 2 bridge together!
      if (comp.customConfig?.isPressed) {
        ds.union(ds.key(comp.id, 'pin1a'), ds.key(comp.id, 'pin2a'));
      }
    }

    // Microcontroller internal GND pins and pin aliases are bridged together
    if (comp.type === 'arduino-uno') {
      // Connect all GNDs together
      const gndKeys = ['GND', 'GND1', 'GND2', 'GND3', 'GND_DIG', 'ARD_GND', 'ARD_GND_1', 'ARD_GND_2'];
      for (let i = 1; i < gndKeys.length; i++) {
        ds.union(ds.key(comp.id, gndKeys[0]), ds.key(comp.id, gndKeys[i]));
      }

      // Link VCC aliases
      ds.union(ds.key(comp.id, '5V'), ds.key(comp.id, 'ARD_5V'));
      ds.union(ds.key(comp.id, '3V3'), ds.key(comp.id, 'ARD_33V'));
      ds.union(ds.key(comp.id, 'VIN'), ds.key(comp.id, 'ARD_VIN'));

      // Link digital pins: D0-D13 <-> ARD_D0-ARD_D13 <-> 0-13
      for (let i = 0; i <= 13; i++) {
        ds.union(ds.key(comp.id, `D${i}`), ds.key(comp.id, `ARD_D${i}`));
        ds.union(ds.key(comp.id, `D${i}`), ds.key(comp.id, `${i}`));
      }

      // Link analog pins: A0-A5 <-> ARD_A0-ARD_A5
      for (let i = 0; i <= 5; i++) {
        ds.union(ds.key(comp.id, `A${i}`), ds.key(comp.id, `ARD_A${i}`));
      }
    }
    if (comp.type === 'esp32-devkit') {
      ds.union(ds.key(comp.id, 'GND1'), ds.key(comp.id, 'GND2'));
    }
  }

  // 2. Wires between pins
  for (const wire of wires) {
    const k1 = ds.key(wire.fromCompId, wire.fromPinId);
    const k2 = ds.key(wire.toCompId, wire.toPinId);
    ds.union(k1, k2);
  }

  return ds;
}

/**
 * Checks if a component's pin is connected to GND
 */
export function isPinGnd(
  ds: DisjointSet,
  compId: string,
  pinId: string,
  components: CircuitComponent[]
): boolean {
  for (const c of components) {
    if (c.type === 'arduino-uno') {
      if (
        ds.areConnected(compId, pinId, c.id, 'GND1') ||
        ds.areConnected(compId, pinId, c.id, 'GND2') ||
        ds.areConnected(compId, pinId, c.id, 'ARD_GND') ||
        ds.areConnected(compId, pinId, c.id, 'ARD_GND_1') ||
        ds.areConnected(compId, pinId, c.id, 'ARD_GND_2')
      ) {
        return true;
      }
    }
    if (c.type === 'esp32-devkit') {
      if (
        ds.areConnected(compId, pinId, c.id, 'GND1') ||
        ds.areConnected(compId, pinId, c.id, 'GND2')
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Checks if a component's pin is connected to 5V or 3.3V
 */
export function isPinVcc(
  ds: DisjointSet,
  compId: string,
  pinId: string,
  components: CircuitComponent[]
): boolean {
  for (const c of components) {
    if (c.type === 'arduino-uno') {
      if (
        ds.areConnected(compId, pinId, c.id, '5V') ||
        ds.areConnected(compId, pinId, c.id, '3V3')
      ) {
        return true;
      }
    }
    if (c.type === 'esp32-devkit') {
      if (
        ds.areConnected(compId, pinId, c.id, '3V3') ||
        ds.areConnected(compId, pinId, c.id, 'VIN')
      ) {
        return true;
      }
    }
  }
  return false;
}
