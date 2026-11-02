import * as THREE from 'three';

/**
 * Shared procedural PBR materials for 3D electronics components
 */

// Arduino PCB Blue
export const arduinoPcbMaterial = new THREE.MeshStandardMaterial({
  color: 0x007882,
  roughness: 0.35,
  metalness: 0.1,
});

// ESP32 PCB Matte Black
export const esp32PcbMaterial = new THREE.MeshStandardMaterial({
  color: 0x171717,
  roughness: 0.7,
  metalness: 0.2,
});

// Breadboard Off-White Textured Plastic
export const breadboardPlasticMaterial = new THREE.MeshStandardMaterial({
  color: 0xf1f5f9,
  roughness: 0.55,
  metalness: 0.05,
});

// Metallic Nickel / Silver (USB jacks, crystal cans, brackets)
export const silverMetalMaterial = new THREE.MeshStandardMaterial({
  color: 0xd8e0e8,
  roughness: 0.22,
  metalness: 0.9,
});

// Gold-Plated Header Pins & Contacts
export const goldPinMaterial = new THREE.MeshStandardMaterial({
  color: 0xf59e0b,
  roughness: 0.25,
  metalness: 0.85,
});

// Black Plastic (IC packages, pin header strips, jacks)
export const blackPlasticMaterial = new THREE.MeshStandardMaterial({
  color: 0x1e293b,
  roughness: 0.6,
  metalness: 0.1,
});

// RF Shield Metal (ESP-WROOM-32)
export const rfShieldMaterial = new THREE.MeshStandardMaterial({
  color: 0xcbd5e1,
  roughness: 0.3,
  metalness: 0.85,
});

// Ceramic Resistor Tan
export const ceramicResistorMaterial = new THREE.MeshStandardMaterial({
  color: 0xe5d0ba,
  roughness: 0.45,
  metalness: 0.05,
});

// Blue Transparent Servo Plastic
export const servoBlueMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x1d4ed8,
  roughness: 0.15,
  metalness: 0.1,
  transmission: 0.6,
  transparent: true,
  opacity: 0.85,
  thickness: 0.8,
});

// White Nylon Servo Horn
export const whiteNylonMaterial = new THREE.MeshStandardMaterial({
  color: 0xf8fafc,
  roughness: 0.4,
  metalness: 0.05,
});

// Metal Pin Leads (LEDs, resistors)
export const metalLeadMaterial = new THREE.MeshStandardMaterial({
  color: 0x94a3b8,
  roughness: 0.2,
  metalness: 0.85,
});
