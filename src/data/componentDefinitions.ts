import { ComponentType, PinDefinition } from '../types/circuit';

export interface ComponentMetadata {
  type: ComponentType;
  name: string;
  category: 'micro' | 'actuator' | 'sensor' | 'passive' | 'board';
  description: string;
  width: number;
  height: number;
  defaultConfig?: Record<string, any>;
  defaultState?: Record<string, any>;
  pins: PinDefinition[];
}

export const COMPONENT_METADATA: Record<ComponentType, ComponentMetadata> = {
  'arduino-uno': {
    type: 'arduino-uno',
    name: 'Arduino Uno R3',
    category: 'micro',
    description: 'Microcontrolador ATmega328P con 14 pines digitales, 6 entradas analógicas y comunicación serie UART.',
    width: 380,
    height: 260,
    pins: [
      // Top header (digital pins)
      { id: 'AREF', label: 'AREF', type: 'passive', x: 148, y: 16, description: 'Referencia analógica' },
      { id: 'GND1', label: 'GND', type: 'gnd', x: 162, y: 16, description: 'Tierra digital' },
      { id: 'D13', label: 'D13', type: 'digital', x: 176, y: 16, description: 'Pin digital 13 (SCK / LED placa)' },
      { id: 'D12', label: 'D12', type: 'digital', x: 190, y: 16, description: 'Pin digital 12 (MISO)' },
      { id: 'D11', label: 'D11 ~', type: 'pwm', x: 204, y: 16, description: 'Pin digital 11 (PWM / MOSI)' },
      { id: 'D10', label: 'D10 ~', type: 'pwm', x: 218, y: 16, description: 'Pin digital 10 (PWM / SS)' },
      { id: 'D9', label: 'D9 ~', type: 'pwm', x: 232, y: 16, description: 'Pin digital 9 (PWM)' },
      { id: 'D8', label: 'D8', type: 'digital', x: 246, y: 16, description: 'Pin digital 8' },
      // Gap
      { id: 'D7', label: 'D7', type: 'digital', x: 270, y: 16, description: 'Pin digital 7' },
      { id: 'D6', label: 'D6 ~', type: 'pwm', x: 284, y: 16, description: 'Pin digital 6 (PWM)' },
      { id: 'D5', label: 'D5 ~', type: 'pwm', x: 298, y: 16, description: 'Pin digital 5 (PWM)' },
      { id: 'D4', label: 'D4', type: 'digital', x: 312, y: 16, description: 'Pin digital 4' },
      { id: 'D3', label: 'D3 ~', type: 'pwm', x: 326, y: 16, description: 'Pin digital 3 (PWM / INT1)' },
      { id: 'D2', label: 'D2', type: 'digital', x: 340, y: 16, description: 'Pin digital 2 (INT0)' },
      { id: 'D1', label: 'D1/TX', type: 'digital', x: 354, y: 16, description: 'Pin digital 1 (Transmisión Serial TX)' },
      { id: 'D0', label: 'D0/RX', type: 'digital', x: 368, y: 16, description: 'Pin digital 0 (Recepción Serial RX)' },

      // Bottom left (power header)
      { id: 'IOREF', label: 'IOREF', type: 'power', x: 176, y: 244, description: 'Voltaje referencia IO' },
      { id: 'RESET', label: 'RESET', type: 'passive', x: 190, y: 244, description: 'Reset microcontrolador' },
      { id: '3V3', label: '3.3V', type: 'power', x: 204, y: 244, description: 'Salida de alimentación 3.3V' },
      { id: '5V', label: '5V', type: 'power', x: 218, y: 244, description: 'Salida de alimentación 5V' },
      { id: 'GND2', label: 'GND', type: 'gnd', x: 232, y: 244, description: 'Tierra' },
      { id: 'GND3', label: 'GND', type: 'gnd', x: 246, y: 244, description: 'Tierra' },
      { id: 'VIN', label: 'VIN', type: 'power', x: 260, y: 244, description: 'Voltaje de entrada externo' },

      // Bottom right (analog header)
      { id: 'A0', label: 'A0', type: 'analog', x: 288, y: 244, description: 'Entrada analógica 0' },
      { id: 'A1', label: 'A1', type: 'analog', x: 302, y: 244, description: 'Entrada analógica 1' },
      { id: 'A2', label: 'A2', type: 'analog', x: 316, y: 244, description: 'Entrada analógica 2' },
      { id: 'A3', label: 'A3', type: 'analog', x: 330, y: 244, description: 'Entrada analógica 3' },
      { id: 'A4', label: 'A4/SDA', type: 'i2c', x: 344, y: 244, description: 'Entrada analógica 4 / Bus I2C SDA' },
      { id: 'A5', label: 'A5/SCL', type: 'i2c', x: 358, y: 244, description: 'Entrada analógica 5 / Bus I2C SCL' },
    ],
  },

  'esp32-devkit': {
    type: 'esp32-devkit',
    name: 'ESP32 DevKit v1',
    category: 'micro',
    description: 'Módulo SoC Wi-Fi + Bluetooth de doble núcleo Tensilica Xtensa 240MHz con 30 pines.',
    width: 200,
    height: 320,
    pins: [
      // Left side pins (top to bottom)
      { id: '3V3', label: '3V3', type: 'power', x: 16, y: 36, description: 'Alimentación 3.3V regulada' },
      { id: 'EN', label: 'EN', type: 'passive', x: 16, y: 54, description: 'Enable / Reset' },
      { id: 'VP', label: 'VP/D36', type: 'analog', x: 16, y: 72, description: 'Sensor VP / Entrada ADC1' },
      { id: 'VN', label: 'VN/D39', type: 'analog', x: 16, y: 90, description: 'Sensor VN / Entrada ADC1' },
      { id: 'D34', label: 'D34', type: 'analog', x: 16, y: 108, description: 'Entrada GPIO 34 (Solo Input)' },
      { id: 'D35', label: 'D35', type: 'analog', x: 16, y: 126, description: 'Entrada GPIO 35 (Solo Input)' },
      { id: 'D32', label: 'D32', type: 'digital', x: 16, y: 144, description: 'GPIO 32 / ADC1_CH4 / Touch 9' },
      { id: 'D33', label: 'D33', type: 'digital', x: 16, y: 162, description: 'GPIO 33 / ADC1_CH5 / Touch 8' },
      { id: 'D25', label: 'D25', type: 'digital', x: 16, y: 180, description: 'GPIO 25 / DAC1' },
      { id: 'D26', label: 'D26', type: 'digital', x: 16, y: 198, description: 'GPIO 26 / DAC2' },
      { id: 'D27', label: 'D27', type: 'digital', x: 16, y: 216, description: 'GPIO 27 / Touch 7' },
      { id: 'D14', label: 'D14', type: 'digital', x: 16, y: 234, description: 'GPIO 14 / HSPI_CLK' },
      { id: 'D12', label: 'D12', type: 'digital', x: 16, y: 252, description: 'GPIO 12 / HSPI_MISO' },
      { id: 'D13', label: 'D13', type: 'digital', x: 16, y: 270, description: 'GPIO 13 / HSPI_MOSI' },
      { id: 'GND1', label: 'GND', type: 'gnd', x: 16, y: 288, description: 'Tierra común' },

      // Right side pins (top to bottom)
      { id: 'VIN', label: 'VIN', type: 'power', x: 184, y: 36, description: 'Entrada 5V USB/externo' },
      { id: 'GND2', label: 'GND', type: 'gnd', x: 184, y: 54, description: 'Tierra común' },
      { id: 'D15', label: 'D15', type: 'digital', x: 184, y: 72, description: 'GPIO 15' },
      { id: 'D2', label: 'D2', type: 'digital', x: 184, y: 90, description: 'GPIO 2 (LED azul integrado)' },
      { id: 'D4', label: 'D4', type: 'digital', x: 184, y: 108, description: 'GPIO 4' },
      { id: 'RX2', label: 'RX2/16', type: 'digital', x: 184, y: 126, description: 'GPIO 16 / UART2 RX' },
      { id: 'TX2', label: 'TX2/17', type: 'digital', x: 184, y: 144, description: 'GPIO 17 / UART2 TX' },
      { id: 'D5', label: 'D5', type: 'digital', x: 184, y: 162, description: 'GPIO 5 / VSPI_CS' },
      { id: 'D18', label: 'D18', type: 'digital', x: 184, y: 180, description: 'GPIO 18 / VSPI_CLK' },
      { id: 'D19', label: 'D19', type: 'digital', x: 184, y: 198, description: 'GPIO 19 / VSPI_MISO' },
      { id: 'D21', label: 'D21', type: 'i2c', x: 184, y: 216, description: 'GPIO 21 / I2C SDA' },
      { id: 'RX0', label: 'RX0/3', type: 'digital', x: 184, y: 234, description: 'GPIO 3 / UART0 RX' },
      { id: 'TX0', label: 'TX0/1', type: 'digital', x: 184, y: 252, description: 'GPIO 1 / UART0 TX' },
      { id: 'D22', label: 'D22', type: 'i2c', x: 184, y: 270, description: 'GPIO 22 / I2C SCL' },
      { id: 'D23', label: 'D23', type: 'digital', x: 184, y: 288, description: 'GPIO 23 / VSPI_MOSI' },
    ],
  },

  'breadboard': {
    type: 'breadboard',
    name: 'Protoboard (830 puntos)',
    category: 'board',
    description: 'Placa de prototipado sin soldadura con rieles de alimentación y 30 columnas de 5 filas.',
    width: 600,
    height: 220,
    pins: generateBreadboardPins(),
  },

  'led': {
    type: 'led',
    name: 'Diodo LED',
    category: 'actuator',
    description: 'Diodo emisor de luz de 5mm con cúpula difusa y brillo en tiempo real.',
    width: 70,
    height: 90,
    defaultConfig: { ledColor: 'red' },
    defaultState: { brightness: 0 },
    pins: [
      { id: 'anode', label: 'Ánodo (+)', type: 'passive', x: 26, y: 82, description: 'Pata larga positiva (+)' },
      { id: 'cathode', label: 'Cátodo (-)', type: 'passive', x: 44, y: 82, description: 'Pata corta negativa (-) bisel plano' },
    ],
  },

  'rgb-led': {
    type: 'rgb-led',
    name: 'LED RGB (Cátodo común)',
    category: 'actuator',
    description: 'LED RGB multicolor con control individual de canales Rojo, Verde y Azul.',
    width: 90,
    height: 100,
    defaultState: { r: 0, g: 0, b: 0 },
    pins: [
      { id: 'red', label: 'R (Rojo)', type: 'passive', x: 22, y: 92, description: 'Terminal de color rojo' },
      { id: 'cathode', label: 'GND (-)', type: 'gnd', x: 37, y: 92, description: 'Cátodo común a tierra' },
      { id: 'green', label: 'G (Verde)', type: 'passive', x: 52, y: 92, description: 'Terminal de color verde' },
      { id: 'blue', label: 'B (Azul)', type: 'passive', x: 67, y: 92, description: 'Terminal de color azul' },
    ],
  },

  'resistor': {
    type: 'resistor',
    name: 'Resistencia',
    category: 'passive',
    description: 'Resistor de película metálica 1/4W con bandas de color calculadas dinámicamente.',
    width: 110,
    height: 42,
    defaultConfig: { resistance: 220 },
    pins: [
      { id: 'pin1', label: 'Pin 1', type: 'passive', x: 12, y: 21, description: 'Terminal 1' },
      { id: 'pin2', label: 'Pin 2', type: 'passive', x: 98, y: 21, description: 'Terminal 2' },
    ],
  },

  'potentiometer': {
    type: 'potentiometer',
    name: 'Potenciómetro 10kΩ',
    category: 'sensor',
    description: 'Resistencia variable rotativa con perilla giratoria interactiva para lecturas analógicas.',
    width: 100,
    height: 110,
    defaultConfig: { potValue: 512 },
    pins: [
      { id: 'vcc', label: 'VCC (5V/3V3)', type: 'power', x: 24, y: 100, description: 'Terminal positivo' },
      { id: 'wiper', label: 'Señal / Cursor', type: 'analog', x: 50, y: 100, description: 'Salida analógica variable' },
      { id: 'gnd', label: 'GND', type: 'gnd', x: 76, y: 100, description: 'Terminal negativo a tierra' },
    ],
  },

  'hc-sr04': {
    type: 'hc-sr04',
    name: 'Sensor Ultrasonido HC-SR04',
    category: 'sensor',
    description: 'Sensor de medición de distancia por eco ultrasónico (2cm a 400cm) con control interactivo.',
    width: 170,
    height: 95,
    defaultConfig: { distance: 45 },
    pins: [
      { id: 'vcc', label: 'VCC', type: 'power', x: 64, y: 86, description: 'Alimentación 5V' },
      { id: 'trig', label: 'TRIG', type: 'digital', x: 78, y: 86, description: 'Disparo de pulso ultrasónico' },
      { id: 'echo', label: 'ECHO', type: 'digital', x: 92, y: 86, description: 'Retorno de eco ultrasónico' },
      { id: 'gnd', label: 'GND', type: 'gnd', x: 106, y: 86, description: 'Tierra' },
    ],
  },

  'sg90-servo': {
    type: 'sg90-servo',
    name: 'Micro Servo SG90',
    category: 'actuator',
    description: 'Servomotor de 9 gramos con rotación de 0° a 180° por señal PWM y brazo articulado.',
    width: 150,
    height: 140,
    defaultState: { angle: 90 },
    pins: [
      { id: 'gnd', label: 'GND (Marrón)', type: 'gnd', x: 35, y: 130, description: 'Tierra (Cable marrón)' },
      { id: 'vcc', label: 'VCC 5V (Rojo)', type: 'power', x: 50, y: 130, description: 'Alimentación (Cable rojo)' },
      { id: 'signal', label: 'PWM (Naranja)', type: 'pwm', x: 65, y: 130, description: 'Señal de control PWM (Cable naranja)' },
    ],
  },

  'lcd-1602-i2c': {
    type: 'lcd-1602-i2c',
    name: 'Pantalla LCD 16x2 I2C',
    category: 'actuator',
    description: 'Display alfanumérico LCD 16 columnas x 2 filas con retroiluminación azul y módulo I2C (PCF8574).',
    width: 270,
    height: 125,
    defaultState: { lines: ['  ElectroSim 1.0 ', 'Arduino & ESP32 '], backlight: true },
    pins: [
      { id: 'gnd', label: 'GND', type: 'gnd', x: 18, y: 96, description: 'Tierra' },
      { id: 'vcc', label: 'VCC', type: 'power', x: 18, y: 80, description: 'Alimentación 5V' },
      { id: 'sda', label: 'SDA', type: 'i2c', x: 18, y: 64, description: 'Línea de datos I2C' },
      { id: 'scl', label: 'SCL', type: 'i2c', x: 18, y: 48, description: 'Línea de reloj I2C' },
    ],
  },

  'buzzer': {
    type: 'buzzer',
    name: 'Buzzer Piezoeléctrico',
    category: 'actuator',
    description: 'Zumbador acústico piezoeléctrico capaz de reproducir tonos y melodías reales vía Web Audio.',
    width: 80,
    height: 85,
    defaultState: { isPlaying: false, freq: 0 },
    pins: [
      { id: 'pos', label: '(+) Señal', type: 'pwm', x: 26, y: 76, description: 'Terminal positivo (+)' },
      { id: 'neg', label: '(-) Tierra', type: 'gnd', x: 54, y: 76, description: 'Terminal negativo (-)' },
    ],
  },

  'dht11': {
    type: 'dht11',
    name: 'Sensor Temp/Humedad DHT11',
    category: 'sensor',
    description: 'Sensor digital de temperatura (0-50°C) y humedad relativa (20-90% RH) con calibración interna.',
    width: 75,
    height: 105,
    defaultConfig: { temperature: 24, humidity: 55 },
    pins: [
      { id: 'vcc', label: 'VCC', type: 'power', x: 20, y: 98, description: 'Alimentación 3.3V - 5V' },
      { id: 'data', label: 'DATA', type: 'digital', x: 38, y: 98, description: 'Datos digitales 1-Wire' },
      { id: 'gnd', label: 'GND', type: 'gnd', x: 56, y: 98, description: 'Tierra' },
    ],
  },

  'pushbutton': {
    type: 'pushbutton',
    name: 'Pulsador Táctil',
    category: 'sensor',
    description: 'Interruptor pulsador momentáneo 6x6mm con botón pulsable interactivamente en pantalla.',
    width: 70,
    height: 70,
    defaultConfig: { isPressed: false },
    pins: [
      { id: 'pin1a', label: '1A', type: 'passive', x: 14, y: 16, description: 'Terminal 1A' },
      { id: 'pin1b', label: '1B', type: 'passive', x: 56, y: 16, description: 'Terminal 1B' },
      { id: 'pin2a', label: '2A', type: 'passive', x: 14, y: 54, description: 'Terminal 2A' },
      { id: 'pin2b', label: '2B', type: 'passive', x: 56, y: 54, description: 'Terminal 2B' },
    ],
  },

  'photoresistor': {
    type: 'photoresistor',
    name: 'Fotorresistor LDR',
    category: 'sensor',
    description: 'Sensor resistivo sensible a la luz ambiental (lux) con control interactivo de iluminación.',
    width: 65,
    height: 85,
    defaultConfig: { lightLevel: 70 },
    pins: [
      { id: 'pin1', label: 'Pin 1', type: 'passive', x: 23, y: 78, description: 'Terminal fotoconductor 1' },
      { id: 'pin2', label: 'Pin 2', type: 'passive', x: 42, y: 78, description: 'Terminal fotoconductor 2' },
    ],
  },

  'pir-motion': {
    type: 'pir-motion',
    name: 'Sensor Movimiento PIR',
    category: 'sensor',
    description: 'Sensor piroeléctrico pasivo infrarrojo para detección de personas y movimiento.',
    width: 105,
    height: 105,
    defaultConfig: { motionDetected: false },
    pins: [
      { id: 'vcc', label: 'VCC', type: 'power', x: 32, y: 96, description: 'Alimentación 5V' },
      { id: 'out', label: 'OUT', type: 'digital', x: 52, y: 96, description: 'Salida lógica de detección' },
      { id: 'gnd', label: 'GND', type: 'gnd', x: 72, y: 96, description: 'Tierra' },
    ],
  },

  'oled-128x64': {
    type: 'oled-128x64',
    name: 'Pantalla OLED 0.96" I2C',
    category: 'actuator',
    description: 'Display gráfico OLED 128x64 monocromo I2C controlador SSD1306.',
    width: 140,
    height: 120,
    defaultState: { text: 'ElectroSim 3D' },
    pins: [
      { id: 'gnd', label: 'GND', type: 'gnd', x: 25, y: 18, description: 'Tierra' },
      { id: 'vcc', label: 'VCC', type: 'power', x: 55, y: 18, description: 'Alimentación 3.3V-5V' },
      { id: 'scl', label: 'SCL', type: 'i2c', x: 85, y: 18, description: 'Reloj I2C' },
      { id: 'sda', label: 'SDA', type: 'i2c', x: 115, y: 18, description: 'Datos I2C' },
    ],
  },

  'relay-module': {
    type: 'relay-module',
    name: 'Módulo Relé 5V (10A)',
    category: 'actuator',
    description: 'Módulo conmutador de relé electromecánico de 1 canal con aislamiento por optoacoplador.',
    width: 130,
    height: 110,
    defaultConfig: { state: false },
    pins: [
      { id: 'vcc', label: 'VCC', type: 'power', x: 25, y: 95, description: 'Alimentación 5V' },
      { id: 'gnd', label: 'GND', type: 'gnd', x: 65, y: 95, description: 'Tierra' },
      { id: 'in', label: 'IN', type: 'digital', x: 105, y: 95, description: 'Disparo digital' },
    ],
  },

  'ir-obstacle': {
    type: 'ir-obstacle',
    name: 'Sensor Infrarrojo de Obstáculos',
    category: 'sensor',
    description: 'Módulo detector de proximidad óptico por reflexión infrarroja con comparador LM393.',
    width: 110,
    height: 90,
    defaultConfig: { obstacleDetected: false },
    pins: [
      { id: 'vcc', label: 'VCC', type: 'power', x: 25, y: 78, description: 'Alimentación 3.3V-5V' },
      { id: 'gnd', label: 'GND', type: 'gnd', x: 55, y: 78, description: 'Tierra' },
      { id: 'out', label: 'OUT', type: 'digital', x: 85, y: 78, description: 'Salida digital' },
    ],
  },

  'sound-sensor': {
    type: 'sound-sensor',
    name: 'Módulo Sensor de Sonido',
    category: 'sensor',
    description: 'Micrófono de condensador con amplificador operacional y salidas analógica y digital.',
    width: 120,
    height: 90,
    defaultConfig: { soundLevel: 40 },
    pins: [
      { id: 'vcc', label: 'VCC', type: 'power', x: 20, y: 78, description: 'Alimentación 5V' },
      { id: 'gnd', label: 'GND', type: 'gnd', x: 50, y: 78, description: 'Tierra' },
      { id: 'do', label: 'DO', type: 'digital', x: 80, y: 78, description: 'Salida digital' },
      { id: 'ao', label: 'AO', type: 'analog', x: 105, y: 78, description: 'Salida analógica' },
    ],
  },
};


/**
 * Generate accurate pin connection points for 830-point breadboard
 */
function generateBreadboardPins(): PinDefinition[] {
  const pins: PinDefinition[] = [];

  // Top Power Rail (+ and -): 20 accessible contact points
  for (let i = 0; i < 20; i++) {
    const x = 50 + i * 26;
    pins.push({
      id: `pwr_top_plus_${i}`,
      label: `+ (${i + 1})`,
      type: 'power',
      x,
      y: 20,
      description: 'Riel positivo superior (+)',
    });
    pins.push({
      id: `pwr_top_minus_${i}`,
      label: `- (${i + 1})`,
      type: 'gnd',
      x,
      y: 36,
      description: 'Riel negativo superior (GND)',
    });
  }

  // 30 Terminal columns (Row groups: A-E on top, F-J on bottom)
  for (let col = 1; col <= 30; col++) {
    const x = 44 + (col - 1) * 17.5;
    // Row E (top bank)
    pins.push({
      id: `col_${col}_e`,
      label: `Col ${col} - E`,
      type: 'passive',
      x,
      y: 65,
      description: `Columna ${col}, fila E`,
    });
    // Row A (top bank bottom)
    pins.push({
      id: `col_${col}_a`,
      label: `Col ${col} - A`,
      type: 'passive',
      x,
      y: 95,
      description: `Columna ${col}, fila A`,
    });
    // Row F (bottom bank top)
    pins.push({
      id: `col_${col}_f`,
      label: `Col ${col} - F`,
      type: 'passive',
      x,
      y: 125,
      description: `Columna ${col}, fila F`,
    });
    // Row J (bottom bank)
    pins.push({
      id: `col_${col}_j`,
      label: `Col ${col} - J`,
      type: 'passive',
      x,
      y: 155,
      description: `Columna ${col}, fila J`,
    });
  }

  // Bottom Power Rail (+ and -)
  for (let i = 0; i < 20; i++) {
    const x = 50 + i * 26;
    pins.push({
      id: `pwr_bot_plus_${i}`,
      label: `+ (${i + 1})`,
      type: 'power',
      x,
      y: 184,
      description: 'Riel positivo inferior (+)',
    });
    pins.push({
      id: `pwr_bot_minus_${i}`,
      label: `- (${i + 1})`,
      type: 'gnd',
      x,
      y: 200,
      description: 'Riel negativo inferior (GND)',
    });
  }

  return pins;
}
