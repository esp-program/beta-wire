import { PresetProject } from '../types/circuit';
import { COMPONENT_METADATA } from './componentDefinitions';

export const PRESET_PROJECTS: PresetProject[] = [
  {
    id: 'blink-led',
    title: 'Parpadeo de LED Básico (Blink)',
    board: 'Arduino Uno',
    description: 'Circuito clásico "Hola Mundo" de electrónica: el pin D13 conmuta un LED rojo a través de una resistencia limitadora de 220Ω.',
    components: [
      {
        id: 'uno-1',
        type: 'arduino-uno',
        name: 'Arduino Uno R3',
        x: 60,
        y: 80,
        rotation: 0,
        pins: COMPONENT_METADATA['arduino-uno'].pins,
        state: {},
      },
      {
        id: 'res-1',
        type: 'resistor',
        name: 'Resistencia 220Ω',
        x: 490,
        y: 110,
        rotation: 0,
        pins: COMPONENT_METADATA['resistor'].pins,
        state: {},
        customConfig: { resistance: 220 },
      },
      {
        id: 'led-1',
        type: 'led',
        name: 'LED Rojo 5mm',
        x: 630,
        y: 80,
        rotation: 0,
        pins: COMPONENT_METADATA['led'].pins,
        state: { brightness: 0 },
        customConfig: { ledColor: 'red' },
      },
    ],
    wires: [
      {
        id: 'w-1',
        fromCompId: 'uno-1',
        fromPinId: 'D13',
        toCompId: 'res-1',
        toPinId: 'pin1',
        color: '#ef4444', // Red wire
      },
      {
        id: 'w-2',
        fromCompId: 'res-1',
        fromPinId: 'pin2',
        toCompId: 'led-1',
        toPinId: 'anode',
        color: '#f97316', // Orange
      },
      {
        id: 'w-3',
        fromCompId: 'led-1',
        fromPinId: 'cathode',
        toCompId: 'uno-1',
        toPinId: 'GND1',
        color: '#1e293b', // Black GND
      },
    ],
    code: `// ElectroSim - Ejemplo 01: Parpadeo de LED
// Conecta el pin 13 al ánodo del LED a través de 220 Ohms

const int ledPin = 13;

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("--- Sistema de LED Iniciado ---");
}

void loop() {
  Serial.println("LED: ENCENDIDO (HIGH)");
  digitalWrite(ledPin, HIGH);
  delay(1000);

  Serial.println("LED: APAGADO (LOW)");
  digitalWrite(ledPin, LOW);
  delay(1000);
}
`,
  },

  {
    id: 'pot-pwm-dimmer',
    title: 'Control Dimmer PWM con Potenciómetro',
    board: 'Arduino Uno',
    description: 'Lectura analógica en A0 proveniente de la perilla del potenciómetro para modular el ciclo de trabajo PWM de un LED azul en el pin D9.',
    components: [
      {
        id: 'uno-1',
        type: 'arduino-uno',
        name: 'Arduino Uno R3',
        x: 60,
        y: 80,
        rotation: 0,
        pins: COMPONENT_METADATA['arduino-uno'].pins,
        state: {},
      },
      {
        id: 'pot-1',
        type: 'potentiometer',
        name: 'Potenciómetro 10kΩ',
        x: 480,
        y: 190,
        rotation: 0,
        pins: COMPONENT_METADATA['potentiometer'].pins,
        state: {},
        customConfig: { potValue: 512 },
      },
      {
        id: 'res-1',
        type: 'resistor',
        name: 'Resistencia 220Ω',
        x: 480,
        y: 80,
        rotation: 0,
        pins: COMPONENT_METADATA['resistor'].pins,
        state: {},
        customConfig: { resistance: 220 },
      },
      {
        id: 'led-1',
        type: 'led',
        name: 'LED Azul 5mm',
        x: 620,
        y: 60,
        rotation: 0,
        pins: COMPONENT_METADATA['led'].pins,
        state: { brightness: 0 },
        customConfig: { ledColor: 'blue' },
      },
    ],
    wires: [
      // Potentiometer 5V and GND
      {
        id: 'w-p1',
        fromCompId: 'uno-1',
        fromPinId: '5V',
        toCompId: 'pot-1',
        toPinId: 'vcc',
        color: '#ef4444',
      },
      {
        id: 'w-p2',
        fromCompId: 'uno-1',
        fromPinId: 'GND2',
        toCompId: 'pot-1',
        toPinId: 'gnd',
        color: '#1e293b',
      },
      {
        id: 'w-p3',
        fromCompId: 'pot-1',
        fromPinId: 'wiper',
        toCompId: 'uno-1',
        toPinId: 'A0',
        color: '#eab308', // Yellow signal
      },
      // LED to D9 PWM
      {
        id: 'w-l1',
        fromCompId: 'uno-1',
        fromPinId: 'D9',
        toCompId: 'res-1',
        toPinId: 'pin1',
        color: '#3b82f6',
      },
      {
        id: 'w-l2',
        fromCompId: 'res-1',
        fromPinId: 'pin2',
        toCompId: 'led-1',
        toPinId: 'anode',
        color: '#3b82f6',
      },
      {
        id: 'w-l3',
        fromCompId: 'led-1',
        fromPinId: 'cathode',
        toCompId: 'uno-1',
        toPinId: 'GND1',
        color: '#1e293b',
      },
    ],
    code: `// ElectroSim - Dimmer PWM con Potenciómetro
// ¡Gira la perilla del potenciómetro en pantalla para ver el brillo cambiar!

const int potPin = A0;
const int ledPin = 9; // Pin con soporte PWM (~)

void setup() {
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("--- Dimmer LED Iniciado ---");
}

void loop() {
  int sensorValue = analogRead(potPin); // 0 a 1023
  int brightness = map(sensorValue, 0, 1023, 0, 255); // Mapea a 0 - 255
  
  analogWrite(ledPin, brightness);

  float voltage = sensorValue * (5.0 / 1023.0);
  Serial.print("Lectura ADC: ");
  Serial.print(sensorValue);
  Serial.print(" | Voltaje: ");
  Serial.print(voltage);
  Serial.print("V | Brillo PWM: ");
  Serial.println(brightness);

  delay(150);
}
`,
  },

  {
    id: 'ultrasonic-radar',
    title: 'Sensor Ultrasonido HC-SR04 y Radar de Distancia',
    board: 'Arduino Uno',
    description: 'Emite pulsos sónicos por TRIG (D9) y mide el tiempo de rebote en ECHO (D10). Imprime distancia en vivo en la consola y activa alerta sonora/visual.',
    components: [
      {
        id: 'uno-1',
        type: 'arduino-uno',
        name: 'Arduino Uno R3',
        x: 60,
        y: 80,
        rotation: 0,
        pins: COMPONENT_METADATA['arduino-uno'].pins,
        state: {},
      },
      {
        id: 'sonar-1',
        type: 'hc-sr04',
        name: 'Sensor HC-SR04',
        x: 480,
        y: 90,
        rotation: 0,
        pins: COMPONENT_METADATA['hc-sr04'].pins,
        state: {},
        customConfig: { distance: 35 },
      },
      {
        id: 'led-1',
        type: 'led',
        name: 'LED Alerta Rojo',
        x: 680,
        y: 90,
        rotation: 0,
        pins: COMPONENT_METADATA['led'].pins,
        state: { brightness: 0 },
        customConfig: { ledColor: 'red' },
      },
    ],
    wires: [
      {
        id: 'w-u1',
        fromCompId: 'uno-1',
        fromPinId: '5V',
        toCompId: 'sonar-1',
        toPinId: 'vcc',
        color: '#ef4444',
      },
      {
        id: 'w-u2',
        fromCompId: 'uno-1',
        fromPinId: 'GND2',
        toCompId: 'sonar-1',
        toPinId: 'gnd',
        color: '#1e293b',
      },
      {
        id: 'w-u3',
        fromCompId: 'uno-1',
        fromPinId: 'D9',
        toCompId: 'sonar-1',
        toPinId: 'trig',
        color: '#eab308',
      },
      {
        id: 'w-u4',
        fromCompId: 'uno-1',
        fromPinId: 'D10',
        toCompId: 'sonar-1',
        toPinId: 'echo',
        color: '#06b6d4',
      },
      {
        id: 'w-u5',
        fromCompId: 'uno-1',
        fromPinId: 'D13',
        toCompId: 'led-1',
        toPinId: 'anode',
        color: '#ef4444',
      },
      {
        id: 'w-u6',
        fromCompId: 'led-1',
        fromPinId: 'cathode',
        toCompId: 'uno-1',
        toPinId: 'GND1',
        color: '#1e293b',
      },
    ],
    code: `// ElectroSim - Radar de Distancia con HC-SR04
// Haz clic en la etiqueta de cm del sensor para cambiar la distancia

const int trigPin = 9;
const int echoPin = 10;
const int alertLedPin = 13;

void setup() {
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(alertLedPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("=== RADAR ULTRASONICO HC-SR04 INICIADO ===");
}

void loop() {
  // Dispara pulso de 10us
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // Mide tiempo de retorno
  long duration = pulseIn(echoPin, HIGH);
  long distanceCm = duration / 58.2;

  Serial.print("Distancia: ");
  Serial.print(distanceCm);
  Serial.print(" cm  [");

  // Barra gráfica ASCII
  int bars = map(constrain(distanceCm, 2, 200), 2, 200, 1, 25);
  for (int i = 0; i < bars; i++) {
    Serial.print("=");
  }
  Serial.println("]");

  // Alerta si el objeto está a menos de 20cm
  if (distanceCm < 20) {
    digitalWrite(alertLedPin, HIGH);
    Serial.println(">>> ¡ALERTA! Objeto muy cercano <<<");
  } else {
    digitalWrite(alertLedPin, LOW);
  }

  delay(400);
}
`,
  },

  {
    id: 'servo-pot-control',
    title: 'Control de Servo SG90 con Potenciómetro',
    board: 'Arduino Uno',
    description: 'Control de posición angular servoasistido: la señal analógica del potenciómetro se convierte en un ángulo de 0° a 180° que mueve el brazo del servo.',
    components: [
      {
        id: 'uno-1',
        type: 'arduino-uno',
        name: 'Arduino Uno R3',
        x: 60,
        y: 80,
        rotation: 0,
        pins: COMPONENT_METADATA['arduino-uno'].pins,
        state: {},
      },
      {
        id: 'servo-1',
        type: 'sg90-servo',
        name: 'Micro Servo SG90',
        x: 520,
        y: 60,
        rotation: 0,
        pins: COMPONENT_METADATA['sg90-servo'].pins,
        state: { angle: 90 },
      },
      {
        id: 'pot-1',
        type: 'potentiometer',
        name: 'Potenciómetro 10kΩ',
        x: 520,
        y: 220,
        rotation: 0,
        pins: COMPONENT_METADATA['potentiometer'].pins,
        state: {},
        customConfig: { potValue: 512 },
      },
    ],
    wires: [
      // Servo wiring
      {
        id: 'w-s1',
        fromCompId: 'uno-1',
        fromPinId: 'GND1',
        toCompId: 'servo-1',
        toPinId: 'gnd',
        color: '#78350f', // Brown
      },
      {
        id: 'w-s2',
        fromCompId: 'uno-1',
        fromPinId: '5V',
        toCompId: 'servo-1',
        toPinId: 'vcc',
        color: '#ef4444',
      },
      {
        id: 'w-s3',
        fromCompId: 'uno-1',
        fromPinId: 'D9',
        toCompId: 'servo-1',
        toPinId: 'signal',
        color: '#f97316', // Orange PWM
      },
      // Potentiometer wiring
      {
        id: 'w-p1',
        fromCompId: 'uno-1',
        fromPinId: '5V',
        toCompId: 'pot-1',
        toPinId: 'vcc',
        color: '#ef4444',
      },
      {
        id: 'w-p2',
        fromCompId: 'uno-1',
        fromPinId: 'GND2',
        toCompId: 'pot-1',
        toPinId: 'gnd',
        color: '#1e293b',
      },
      {
        id: 'w-p3',
        fromCompId: 'pot-1',
        fromPinId: 'wiper',
        toCompId: 'uno-1',
        toPinId: 'A0',
        color: '#eab308',
      },
    ],
    code: `// ElectroSim - Servo SG90 & Potenciómetro
#include <Servo.h>

Servo miServo;
const int potPin = A0;

void setup() {
  miServo.attach(9); // Conectado al pin D9 PWM
  Serial.begin(9600);
  Serial.println("Control de Servo SG90 Preparado");
}

void loop() {
  int valorPot = analogRead(potPin);
  int angulo = map(valorPot, 0, 1023, 0, 180);

  miServo.write(angulo);

  Serial.print("Potenciómetro: ");
  Serial.print(valorPot);
  Serial.print(" -> Ángulo Servo: ");
  Serial.print(angulo);
  Serial.println("°");

  delay(80);
}
`,
  },

  {
    id: 'weather-station-esp32',
    title: 'Estación Meteorológica ESP32 + DHT11 + LCD 16x2',
    board: 'ESP32',
    description: 'Microcontrolador ESP32 de 32-bits que adquiere datos de temperatura y humedad ambiental de un DHT11 y los renderiza en un display LCD 16x2 I2C.',
    components: [
      {
        id: 'esp-1',
        type: 'esp32-devkit',
        name: 'ESP32 DevKit v1',
        x: 60,
        y: 60,
        rotation: 0,
        pins: COMPONENT_METADATA['esp32-devkit'].pins,
        state: {},
      },
      {
        id: 'dht-1',
        type: 'dht11',
        name: 'Sensor DHT11',
        x: 320,
        y: 80,
        rotation: 0,
        pins: COMPONENT_METADATA['dht11'].pins,
        state: {},
        customConfig: { temperature: 25, humidity: 62 },
      },
      {
        id: 'lcd-1',
        type: 'lcd-1602-i2c',
        name: 'Pantalla LCD 16x2 I2C',
        x: 460,
        y: 80,
        rotation: 0,
        pins: COMPONENT_METADATA['lcd-1602-i2c'].pins,
        state: { lines: ['Temp: 25.0 C', 'Humedad: 62 %'], backlight: true },
      },
    ],
    wires: [
      // DHT11 Power & Data to ESP32 D4
      {
        id: 'w-e1',
        fromCompId: 'esp-1',
        fromPinId: '3V3',
        toCompId: 'dht-1',
        toPinId: 'vcc',
        color: '#ef4444',
      },
      {
        id: 'w-e2',
        fromCompId: 'esp-1',
        fromPinId: 'GND1',
        toCompId: 'dht-1',
        toPinId: 'gnd',
        color: '#1e293b',
      },
      {
        id: 'w-e3',
        fromCompId: 'esp-1',
        fromPinId: 'D4',
        toCompId: 'dht-1',
        toPinId: 'data',
        color: '#22c55e',
      },
      // LCD I2C to ESP32 (SDA=D21, SCL=D22)
      {
        id: 'w-e4',
        fromCompId: 'esp-1',
        fromPinId: 'VIN',
        toCompId: 'lcd-1',
        toPinId: 'vcc',
        color: '#ef4444',
      },
      {
        id: 'w-e5',
        fromCompId: 'esp-1',
        fromPinId: 'GND2',
        toCompId: 'lcd-1',
        toPinId: 'gnd',
        color: '#1e293b',
      },
      {
        id: 'w-e6',
        fromCompId: 'esp-1',
        fromPinId: 'D21',
        toCompId: 'lcd-1',
        toPinId: 'sda',
        color: '#eab308', // SDA
      },
      {
        id: 'w-e7',
        fromCompId: 'esp-1',
        fromPinId: 'D22',
        toCompId: 'lcd-1',
        toPinId: 'scl',
        color: '#a855f7', // SCL
      },
    ],
    code: `// ElectroSim - Estación Meteorológica ESP32 + LCD I2C
#include <LiquidCrystal_I2C.h>
#include <DHT.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
DHT dht(4, DHT11); // DHT conectado a GPIO 4

void setup() {
  Serial.begin(115200);
  dht.begin();
  lcd.init();
  lcd.backlight();
  
  lcd.setCursor(0, 0);
  lcd.print("ESP32 Clima Lab");
  lcd.setCursor(0, 1);
  lcd.print("Iniciando...");
  delay(1200);
  lcd.clear();
}

void loop() {
  float temp = dht.readTemperature();
  float hum = dht.readHumidity();

  // Imprime en LCD 16x2
  lcd.setCursor(0, 0);
  lcd.print("Temp: " + String(temp, 1) + " C   ");
  
  lcd.setCursor(0, 1);
  lcd.print("Humedad: " + String(hum, 0) + " % ");

  // Telemetría en Monitor Serie
  Serial.print("[ESP32 Sensor] Temperatura: ");
  Serial.print(temp);
  Serial.print(" °C | Humedad: ");
  Serial.print(hum);
  Serial.println(" %");

  delay(1000);
}
`,
  },

  {
    id: 'pir-security-alarm',
    title: 'Alarma Antirrobo PIR + Buzzer + LED Estroboscópico',
    board: 'Arduino Uno',
    description: 'Sistema de detección perimetral: cuando el sensor PIR detecta intrusión, activa un zumbador piezoeléctrico con tonos oscilantes y un destello visual.',
    components: [
      {
        id: 'uno-1',
        type: 'arduino-uno',
        name: 'Arduino Uno R3',
        x: 60,
        y: 80,
        rotation: 0,
        pins: COMPONENT_METADATA['arduino-uno'].pins,
        state: {},
      },
      {
        id: 'pir-1',
        type: 'pir-motion',
        name: 'Sensor PIR',
        x: 480,
        y: 60,
        rotation: 0,
        pins: COMPONENT_METADATA['pir-motion'].pins,
        state: {},
        customConfig: { motionDetected: false },
      },
      {
        id: 'buzzer-1',
        type: 'buzzer',
        name: 'Buzzer Piezo',
        x: 630,
        y: 60,
        rotation: 0,
        pins: COMPONENT_METADATA['buzzer'].pins,
        state: { isPlaying: false, freq: 0 },
      },
      {
        id: 'led-1',
        type: 'led',
        name: 'LED Alarma',
        x: 550,
        y: 200,
        rotation: 0,
        pins: COMPONENT_METADATA['led'].pins,
        state: { brightness: 0 },
        customConfig: { ledColor: 'red' },
      },
    ],
    wires: [
      // PIR wires
      {
        id: 'w-a1',
        fromCompId: 'uno-1',
        fromPinId: '5V',
        toCompId: 'pir-1',
        toPinId: 'vcc',
        color: '#ef4444',
      },
      {
        id: 'w-a2',
        fromCompId: 'uno-1',
        fromPinId: 'GND2',
        toCompId: 'pir-1',
        toPinId: 'gnd',
        color: '#1e293b',
      },
      {
        id: 'w-a3',
        fromCompId: 'uno-1',
        fromPinId: 'D2',
        toCompId: 'pir-1',
        toPinId: 'out',
        color: '#eab308',
      },
      // Buzzer wires
      {
        id: 'w-a4',
        fromCompId: 'uno-1',
        fromPinId: 'D8',
        toCompId: 'buzzer-1',
        toPinId: 'pos',
        color: '#a855f7',
      },
      {
        id: 'w-a5',
        fromCompId: 'buzzer-1',
        fromPinId: 'neg',
        toCompId: 'uno-1',
        toPinId: 'GND1',
        color: '#1e293b',
      },
      // LED wires
      {
        id: 'w-a6',
        fromCompId: 'uno-1',
        fromPinId: 'D13',
        toCompId: 'led-1',
        toPinId: 'anode',
        color: '#ef4444',
      },
      {
        id: 'w-a7',
        fromCompId: 'led-1',
        fromPinId: 'cathode',
        toCompId: 'uno-1',
        toPinId: 'GND1',
        color: '#1e293b',
      },
    ],
    code: `// ElectroSim - Alarma Antirrobo Inteligente
// Haz clic en la cúpula del PIR para simular paso de personas

const int pirPin = 2;
const int buzzerPin = 8;
const int ledPin = 13;

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  Serial.println("SISTEMA DE SEGURIDAD ARMADO");
}

void loop() {
  int movimiento = digitalRead(pirPin);

  if (movimiento == HIGH) {
    Serial.println("¡INTRUSO DETECTADO! Activando sirena...");
    digitalWrite(ledPin, HIGH);
    tone(buzzerPin, 950);
    delay(200);

    digitalWrite(ledPin, LOW);
    tone(buzzerPin, 650);
    delay(200);
  } else {
    noTone(buzzerPin);
    digitalWrite(ledPin, LOW);
    Serial.println("Zona Segura: Sin movimiento.");
    delay(500);
  }
}
`,
  },
];
