import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface LoadedCustomModel {
  name: string;
  scene: THREE.Group;
  pinPositions: Record<string, THREE.Vector3>;
}

const loader = new GLTFLoader();

/**
 * Loads a GLB model from a File or Blob (e.g. user drag-and-drop / file input)
 */
export async function loadGLBFromFile(file: File): Promise<LoadedCustomModel> {
  const arrayBuffer = await file.arrayBuffer();
  return new Promise((resolve, reject) => {
    loader.parse(
      arrayBuffer,
      '',
      (gltf) => {
        const modelGroup = gltf.scene;
        modelGroup.name = file.name.replace(/\.[^/.]+$/, '');

        // Enable shadows on all child meshes
        modelGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Scan for pins or empty markers (e.g. objects named "pin_*", "D13", "GND", etc.)
        const pinPositions: Record<string, THREE.Vector3> = {};
        modelGroup.traverse((obj) => {
          if (obj.name.toLowerCase().includes('pin') || obj.userData?.isPin) {
            const worldPos = new THREE.Vector3();
            obj.getWorldPosition(worldPos);
            pinPositions[obj.name] = worldPos;
          }
        });

        resolve({
          name: modelGroup.name,
          scene: modelGroup,
          pinPositions,
        });
      },
      (error) => {
        reject(error);
      }
    );
  });
}

/**
 * Loads a GLB model from a URL
 */
export async function loadGLBFromURL(url: string): Promise<LoadedCustomModel> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (gltf) => {
        const modelGroup = gltf.scene;
        modelGroup.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        const pinPositions: Record<string, THREE.Vector3> = {};
        modelGroup.traverse((obj) => {
          if (obj.name.toLowerCase().includes('pin') || obj.userData?.isPin) {
            const worldPos = new THREE.Vector3();
            obj.getWorldPosition(worldPos);
            pinPositions[obj.name] = worldPos;
          }
        });

        resolve({
          name: 'CustomModel',
          scene: modelGroup,
          pinPositions,
        });
      },
      undefined,
      (err) => reject(err)
    );
  });
}
