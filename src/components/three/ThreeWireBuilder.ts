import * as THREE from 'three';
import { WireColor } from '../../types/circuit';
import { silverMetalMaterial } from './materials';

/**
 * Builds a realistic 3D flexible tube wire between two 3D pin locations
 */
export function create3DWireMesh(
  startPos: THREE.Vector3,
  endPos: THREE.Vector3,
  color: WireColor | string
): THREE.Group {
  const wireGroup = new THREE.Group();

  const dist = startPos.distanceTo(endPos);
  // Realistic arch height: cables rise up out of the pin socket and arch over the board
  const archHeight = Math.min(2.5, Math.max(0.6, dist * 0.28));

  // 4 or 5 Catmull-Rom control points
  const p0 = startPos.clone();
  const p1 = startPos.clone().add(new THREE.Vector3(0, archHeight * 0.8, 0));
  const pMid = new THREE.Vector3()
    .addVectors(startPos, endPos)
    .multiplyScalar(0.5)
    .add(new THREE.Vector3(0, archHeight, 0));
  const p2 = endPos.clone().add(new THREE.Vector3(0, archHeight * 0.8, 0));
  const p3 = endPos.clone();

  const curve = new THREE.CatmullRomCurve3([p0, p1, pMid, p2, p3]);

  // Tube geometry: 32 segments, radius 0.045
  const tubeGeom = new THREE.TubeGeometry(curve, 36, 0.045, 10, false);
  const tubeMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.35,
    metalness: 0.15,
  });

  const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
  tubeMesh.castShadow = true;
  wireGroup.add(tubeMesh);

  // Terminal crimp collars at both ends (silver metal boots)
  const collarGeom = new THREE.CylinderGeometry(0.065, 0.065, 0.15, 12);
  const collar1 = new THREE.Mesh(collarGeom, silverMetalMaterial);
  collar1.position.copy(p0).add(new THREE.Vector3(0, 0.075, 0));
  wireGroup.add(collar1);

  const collar2 = new THREE.Mesh(collarGeom, silverMetalMaterial);
  collar2.position.copy(p3).add(new THREE.Vector3(0, 0.075, 0));
  wireGroup.add(collar2);

  return wireGroup;
}
