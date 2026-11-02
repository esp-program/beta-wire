/**
 * Arduino & ESP32 C++ Code Transpiler & Simulation Engine
 */

export interface SimulatorCallbacks {
  onPinWrite: (pin: string, value: number, isAnalog: boolean) => void;
  onPinRead: (pin: string) => number;
  onAnalogRead: (pin: string) => number;
  onSerialPrint: (text: string) => void;
  onTone: (pin: string, freq: number) => void;
  onNoTone: (pin: string) => void;
  onServoWrite: (pin: string, angle: number) => void;
  onLcdPrint: (col: number, row: number, text: string) => void;
  onLcdClear: () => void;
  onLcdBacklight: (enabled: boolean) => void;
  onPulseIn: (pin: string, state: number) => number;
  getSerialInputBuffer: () => string;
  consumeSerialInput: (count: number) => string;
}

export class ArduinoInterpreter {
  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private cancelToken: boolean = false;
  private startTime: number = 0;
  private callbacks: SimulatorCallbacks;
  private servoPinMap: Map<string, string> = new Map(); // objName -> pin
  private lcdCursor: { col: number; row: number } = { col: 0, row: 0 };

  constructor(callbacks: SimulatorCallbacks) {
    this.callbacks = callbacks;
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
  }

  public stop() {
    this.cancelToken = true;
    this.isRunning = false;
    this.isPaused = false;
  }

  public async run(rawCppCode: string): Promise<void> {
    this.stop();
    // Allow previous run to settle
    await new Promise((r) => setTimeout(r, 50));

    this.cancelToken = false;
    this.isRunning = true;
    this.isPaused = false;
    this.startTime = Date.now();
    this.servoPinMap.clear();
    this.lcdCursor = { col: 0, row: 0 };

    try {
      const jsCode = this.transpileCppToJs(rawCppCode);
      const executionEnvironment = this.createExecutionEnvironment();

      // Wrap in async function
      const runner = new Function(...Object.keys(executionEnvironment), `
        return (async () => {
          ${jsCode}

          if (typeof setup === 'function') {
            await setup();
          }

          while (!__checkCancelled()) {
            while (__checkPaused() && !__checkCancelled()) {
              await __sleep(100);
            }
            if (__checkCancelled()) break;

            if (typeof loop === 'function') {
              await loop();
            }
            // Yield microtask to prevent browser lockup
            await __sleep(10);
          }
        })();
      `);

      await runner(...Object.values(executionEnvironment));
    } catch (err: any) {
      if (!this.cancelToken) {
        this.callbacks.onSerialPrint(`\n[ERROR DE EJECUCIÓN]: ${err?.message || err}\n`);
      }
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Transpiles Arduino C++ code to safe async JavaScript
   */
  private transpileCppToJs(code: string): string {
    let js = code;

    // Remove preprocessor includes (harmless in transpilation)
    js = js.replace(/#include\s*<[^>]+>/g, '// [Included library]');
    js = js.replace(/#include\s*"[^"]+"/g, '// [Included library]');

    // Replace #define with const
    js = js.replace(/#define\s+([A-Za-z0-9_]+)\s+([^\n]+)/g, 'const $1 = $2;');

    // Handle C++ Servo declarations: Servo myservo;
    js = js.replace(/Servo\s+([A-Za-z0-9_]+)\s*;/g, 'const $1 = new __Servo("$1");');

    // Handle LiquidCrystal_I2C: LiquidCrystal_I2C lcd(0x27, 16, 2);
    js = js.replace(/LiquidCrystal_I2C\s+([A-Za-z0-9_]+)\s*\([^)]*\);/g, 'const $1 = new __LiquidCrystal_I2C();');

    // Handle DHT: DHT dht(pin, DHT11);
    js = js.replace(/DHT\s+([A-Za-z0-9_]+)\s*\(([^)]*)\);/g, 'const $1 = new __DHT($2);');

    // Replace C++ type declarations with let / const
    const types = [
      'unsigned long',
      'unsigned int',
      'unsigned char',
      'uint8_t',
      'uint16_t',
      'uint32_t',
      'int8_t',
      'int16_t',
      'int32_t',
      'int',
      'long',
      'float',
      'double',
      'boolean',
      'bool',
      'char',
      'String',
      'byte',
      'short',
    ];

    for (const t of types) {
      // e.g. "const int ledPin = 13;" -> "const ledPin = 13;"
      const constRegex = new RegExp(`const\\s+${t}\\s+`, 'g');
      js = js.replace(constRegex, 'const ');

      // e.g. "int val = 0;" -> "let val = 0;"
      const letRegex = new RegExp(`(^|\\s|;|\\(|\\{)${t}\\s+`, 'g');
      js = js.replace(letRegex, '$1let ');
    }

    // Convert function definitions: void setup() -> async function setup()
    js = js.replace(/void\s+setup\s*\(\s*\)/g, 'async function setup()');
    js = js.replace(/void\s+loop\s*\(\s*\)/g, 'async function loop()');
    js = js.replace(/(void|int|float|bool|long|double|String)\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*\{/g, 'async function $2($3) {');

    // Convert delay(ms) -> await delay(ms)
    js = js.replace(/delay\s*\(/g, 'await delay(');

    return js;
  }

  /**
   * Creates Arduino-compatible execution environment
   */
  private createExecutionEnvironment(): Record<string, any> {
    const self = this;

    const normalizePin = (p: any): string => {
      const s = String(p).trim().toUpperCase();
      if (!s.startsWith('D') && !s.startsWith('A') && !isNaN(Number(s))) {
        return `D${s}`;
      }
      return s;
    };

    return {
      // Standard Arduino Constants
      HIGH: 1,
      LOW: 0,
      INPUT: 0,
      OUTPUT: 1,
      INPUT_PULLUP: 2,
      LED_BUILTIN: 'D13',
      DHT11: 11,
      DHT22: 22,

      // Control helpers
      __checkCancelled: () => self.cancelToken,
      __checkPaused: () => self.isPaused,
      __sleep: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

      // Core Arduino Functions
      delay: async (ms: number) => {
        const step = 20;
        let remaining = ms;
        while (remaining > 0 && !self.cancelToken) {
          while (self.isPaused && !self.cancelToken) {
            await new Promise((r) => setTimeout(r, 100));
          }
          const sleepNow = Math.min(step, remaining);
          await new Promise((r) => setTimeout(r, sleepNow));
          remaining -= sleepNow;
        }
      },

      delayMicroseconds: async (us: number) => {
        await new Promise((r) => setTimeout(r, Math.max(1, Math.round(us / 1000))));
      },

      millis: () => Date.now() - self.startTime,
      micros: () => (Date.now() - self.startTime) * 1000,

      pinMode: (pin: any, mode: any) => {
        // Mode tracking handled in simulation engine
      },

      digitalWrite: (pin: any, val: any) => {
        const p = normalizePin(pin);
        const v = val === 1 || val === true || val === 'HIGH' ? 1 : 0;
        self.callbacks.onPinWrite(p, v, false);
      },

      digitalRead: (pin: any) => {
        const p = normalizePin(pin);
        return self.callbacks.onPinRead(p);
      },

      analogRead: (pin: any) => {
        const p = normalizePin(pin);
        return self.callbacks.onAnalogRead(p);
      },

      analogWrite: (pin: any, val: any) => {
        const p = normalizePin(pin);
        const pwm = Math.min(255, Math.max(0, Math.round(Number(val) || 0)));
        self.callbacks.onPinWrite(p, pwm, true);
      },

      tone: (pin: any, freq: any) => {
        const p = normalizePin(pin);
        self.callbacks.onTone(p, Number(freq) || 440);
      },

      noTone: (pin: any) => {
        const p = normalizePin(pin);
        self.callbacks.onNoTone(p);
      },

      pulseIn: (pin: any, state: any) => {
        const p = normalizePin(pin);
        return self.callbacks.onPulseIn(p, state === 1 ? 1 : 0);
      },

      map: (x: number, in_min: number, in_max: number, out_min: number, out_max: number) => {
        return ((x - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
      },

      constrain: (amt: number, low: number, high: number) => {
        return Math.min(high, Math.max(low, amt));
      },

      random: (min: number, max?: number) => {
        if (max === undefined) {
          return Math.floor(Math.random() * min);
        }
        return Math.floor(Math.random() * (max - min)) + min;
      },

      // Serial Object
      Serial: {
        begin: (baud: number) => {
          self.callbacks.onSerialPrint(`[Serial iniciado a ${baud || 9600} baudios]\n`);
        },
        print: (msg: any) => {
          self.callbacks.onSerialPrint(String(msg ?? ''));
        },
        println: (msg: any) => {
          self.callbacks.onSerialPrint(String(msg ?? '') + '\n');
        },
        write: (val: any) => {
          self.callbacks.onSerialPrint(String.fromCharCode(Number(val) || 0));
        },
        available: () => {
          return self.callbacks.getSerialInputBuffer().length;
        },
        read: () => {
          const char = self.callbacks.consumeSerialInput(1);
          return char ? char.charCodeAt(0) : -1;
        },
        readString: () => {
          const buf = self.callbacks.getSerialInputBuffer();
          self.callbacks.consumeSerialInput(buf.length);
          return buf;
        },
        readStringUntil: (terminator: string) => {
          const buf = self.callbacks.getSerialInputBuffer();
          const idx = buf.indexOf(terminator);
          if (idx !== -1) {
            const out = buf.slice(0, idx);
            self.callbacks.consumeSerialInput(idx + 1);
            return out;
          }
          return '';
        },
      },

      // Servo Class
      __Servo: class {
        name: string;
        attachedPin: string = '';

        constructor(name: string) {
          this.name = name;
        }

        attach(pin: any) {
          this.attachedPin = normalizePin(pin);
          self.servoPinMap.set(this.name, this.attachedPin);
        }

        write(angle: number) {
          if (this.attachedPin) {
            self.callbacks.onServoWrite(this.attachedPin, Number(angle) || 0);
          }
        }

        read() {
          return 90;
        }
      },

      // LiquidCrystal_I2C Class
      __LiquidCrystal_I2C: class {
        init() {
          self.callbacks.onLcdClear();
        }
        begin() {
          self.callbacks.onLcdClear();
        }
        backlight() {
          self.callbacks.onLcdBacklight(true);
        }
        noBacklight() {
          self.callbacks.onLcdBacklight(false);
        }
        clear() {
          self.callbacks.onLcdClear();
        }
        setCursor(col: number, row: number) {
          self.lcdCursor = { col: Math.max(0, col), row: Math.max(0, row) };
        }
        print(text: any) {
          self.callbacks.onLcdPrint(self.lcdCursor.col, self.lcdCursor.row, String(text));
        }
      },

      // DHT Class
      __DHT: class {
        pin: string;
        type: number;

        constructor(pin: any, type: any) {
          this.pin = normalizePin(pin);
          this.type = type || 11;
        }

        begin() {}

        readTemperature() {
          return self.callbacks.onAnalogRead(`${this.pin}:TEMP`);
        }

        readHumidity() {
          return self.callbacks.onAnalogRead(`${this.pin}:HUM`);
        }
      },
    };
  }
}
