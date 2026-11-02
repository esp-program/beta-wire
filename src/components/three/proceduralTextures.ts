import * as THREE from 'three';

/**
 * Creates an authentic high-resolution silkscreen texture for Arduino Uno R3
 */
export function createArduinoSilkscreenTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 700;
  const ctx = canvas.getContext('2d')!;

  // Base PCB blue
  ctx.fillStyle = '#007b85';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Silkscreen white linework & text
  ctx.strokeStyle = '#ffffff';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = 2;

  // Board outline inner border
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Arduino Branding
  ctx.font = 'bold 38px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('ARDUINO', 520, 140);
  ctx.fillStyle = '#fde047';
  ctx.fillText('UNO', 730, 140);

  ctx.fillStyle = '#ffffff';
  ctx.font = '20px monospace';
  ctx.fillText('MADE IN ITALY', 520, 175);
  ctx.fillText('www.arduino.cc', 520, 205);

  // Header pin labels (Top Digital)
  ctx.font = 'bold 18px monospace';
  const topPins = ['AREF', 'GND', '13', '12', '~11', '~10', '~9', '8', '7', '~6', '~5', '4', '~3', '2', 'TX', 'RX'];
  topPins.forEach((label, i) => {
    ctx.fillText(label, 360 + i * 38, 70);
  });
  ctx.fillText('DIGITAL (PWM~)', 580, 105);

  // Header pin labels (Bottom Power & Analog)
  const powerPins = ['IOREF', 'RES', '3.3V', '5V', 'GND', 'GND', 'VIN'];
  powerPins.forEach((label, i) => {
    ctx.fillText(label, 440 + i * 38, 640);
  });
  ctx.fillText('POWER', 520, 605);

  const analogPins = ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'];
  analogPins.forEach((label, i) => {
    ctx.fillText(label, 760 + i * 38, 640);
  });
  ctx.fillText('ANALOG IN', 820, 605);

  // Ground copper traces graphics
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(150, 120);
  ctx.lineTo(300, 120);
  ctx.lineTo(360, 250);
  ctx.lineTo(500, 250);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates dynamic LCD 16x2 text canvas texture
 */
export function createLcdTexture(
  line1: string = '  ElectroSim 3D ',
  line2: string = 'Arduino & ESP32 '
): { texture: THREE.CanvasTexture; updateText: (l1: string, l2: string) => void } {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const render = (l1: string, l2: string) => {
    // Blue backlight background
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#1d4ed8');
    grad.addColorStop(0.5, '#2563eb');
    grad.addColorStop(1, '#1e40af');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle 5x8 dot matrix blocks
    ctx.fillStyle = 'rgba(29, 78, 216, 0.6)';
    for (let c = 0; c < 16; c++) {
      ctx.fillRect(20 + c * 30, 20, 24, 38);
      ctx.fillRect(20 + c * 30, 68, 24, 38);
    }

    // Text rendering
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 6;

    const pad1 = (l1 || '').padEnd(16, ' ').slice(0, 16);
    const pad2 = (l2 || '').padEnd(16, ' ').slice(0, 16);

    ctx.fillText(pad1, 24, 50);
    ctx.fillText(pad2, 24, 98);
  };

  render(line1, line2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  return {
    texture,
    updateText: (l1: string, l2: string) => {
      render(l1, l2);
      texture.needsUpdate = true;
    },
  };
}
