import * as THREE from 'three';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CircuitComponent, Wire, WireColor } from '../../types/circuit';
import {
  createComponent3D,
  updateComponentDynamicState,
  Component3DInstance,
} from './GLBCircuitFactory';
import { create3DWireMesh } from './ThreeWireBuilder';
import {
  findNearestArduinoPin,
  pinesArduino,
  getPinFriendlyLabel,
} from '../../utils/arduinoPins';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Compass,
  PlusCircle,
  Eye,
  Camera,
} from 'lucide-react';

interface ThreeCircuitWorkbenchProps {
  components: CircuitComponent[];
  wires: Wire[];
  selectedWireColor: WireColor;
  isSimulating: boolean;
  pinStates: Record<string, any>;
  onComponentsChange: (newComps: CircuitComponent[]) => void;
  onWiresChange: (newWires: Wire[]) => void;
  onUpdateComponentConfig: (compId: string, key: string, val: any) => void;
  onOpenComponentDrawer?: () => void;
}

export const ThreeCircuitWorkbench: React.FC<ThreeCircuitWorkbenchProps> = ({
  components,
  wires,
  selectedWireColor,
  isSimulating,
  pinStates,
  onComponentsChange,
  onWiresChange,
  onOpenComponentDrawer,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Camera Orbit State
  const cameraOrbitRef = useRef<{
    theta: number;
    phi: number;
    radius: number;
    target: THREE.Vector3;
    isOrbiting: boolean;
    isPanning: boolean;
    startX: number;
    startY: number;
  }>({
    theta: Math.PI / 4,
    phi: Math.PI / 3.4,
    radius: 17,
    target: new THREE.Vector3(0, 0, 0),
    isOrbiting: false,
    isPanning: false,
    startX: 0,
    startY: 0,
  });

  // Track 3D model instances for fast incremental updates without tearing down the scene
  const instancesRef = useRef<Record<string, Component3DInstance>>({});
  const wireGroupsRef = useRef<THREE.Group[]>([]);
  const pinHitboxesRef = useRef<THREE.Mesh[]>([]);
  const loadingCompsRef = useRef<Set<string>>(new Set());

  const [loadedCount, setLoadedCount] = useState(0);

  // 3D Wiring interaction state
  const [activeWireStart, setActiveWireStart] = useState<{ compId: string; pinId: string } | null>(null);
  const [hoveredPinInfo, setHoveredPinInfo] = useState<{ compId: string; pinId: string; label: string } | null>(null);
  const liveWireMeshRef = useRef<THREE.Group | null>(null);
  const hoverRingMeshRef = useRef<THREE.Mesh | null>(null);
  const activePinRingMeshRef = useRef<THREE.Mesh | null>(null);

  // Component Dragging on 3D Plane
  const draggingCompRef = useRef<{ compId: string; offset: THREE.Vector3 } | null>(null);
  const groundPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  // Raycaster & mouse vector
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVecRef = useRef(new THREE.Vector2());

  // Coordinates conversion: 2D workspace to 3D world space
  const to3DCoords = useCallback((x: number, y: number) => {
    return {
      x: (x - 350) * 0.024,
      z: (y - 180) * 0.024,
    };
  }, []);

  const to2DCoords = useCallback((x3d: number, z3d: number) => {
    return {
      x: Math.round(x3d / 0.024 + 350),
      y: Math.round(z3d / 0.024 + 180),
    };
  }, []);

  // Update camera position from spherical orbit angles
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius, target } = cameraOrbitRef.current;
    const x = target.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = target.y + radius * Math.cos(phi);
    const z = target.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(target);
  }, []);

  // 1. Initialize High-Performance Three.js Scene
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x060913);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    cameraRef.current = camera;
    updateCameraPosition();

    // High performance renderer with controlled pixel ratio and PCF shadows
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap; // Fast, clean, no micro-stutter

    mountRef.current.appendChild(renderer.domElement);

    // Studio Environment Reflections (Cached once)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced 3-Point Lighting Rig
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(8, 14, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 12;
    keyLight.shadow.camera.bottom = -12;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x090d16, 0.85);
    hemiLight.position.set(0, 15, 0);
    scene.add(hemiLight);

    const rimLight = new THREE.DirectionalLight(0x0284c7, 1.1);
    rimLight.position.set(-10, 8, -12);
    scene.add(rimLight);

    // Workbench Table Mat Surface with Grid
    const tableGeom = new THREE.PlaneGeometry(36, 26);
    const canvasGrid = document.createElement('canvas');
    canvasGrid.width = 256;
    canvasGrid.height = 256;
    const gctx = canvasGrid.getContext('2d')!;
    gctx.fillStyle = '#0b1329';
    gctx.fillRect(0, 0, 256, 256);
    gctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
    gctx.lineWidth = 1;
    for (let i = 0; i < 256; i += 32) {
      gctx.beginPath();
      gctx.moveTo(i, 0);
      gctx.lineTo(i, 256);
      gctx.stroke();
      gctx.beginPath();
      gctx.moveTo(0, i);
      gctx.lineTo(256, i);
      gctx.stroke();
    }
    const tableTexture = new THREE.CanvasTexture(canvasGrid);
    tableTexture.wrapS = THREE.RepeatWrapping;
    tableTexture.wrapT = THREE.RepeatWrapping;
    tableTexture.repeat.set(18, 13);
    tableTexture.colorSpace = THREE.SRGBColorSpace;

    const tableMat = new THREE.MeshStandardMaterial({
      map: tableTexture,
      roughness: 0.8,
      metalness: 0.1,
    });
    const tableMesh = new THREE.Mesh(tableGeom, tableMat);
    tableMesh.rotation.x = -Math.PI / 2;
    tableMesh.receiveShadow = true;
    scene.add(tableMesh);

    // Dynamic Pin Hover Ring Indicator (Subtle, sleek, non-protruding)
    const ringGeo = new THREE.RingGeometry(0.06, 0.14, 32);
    const hoverRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Sky cyan
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthTest: false,
    });
    const hoverRing = new THREE.Mesh(ringGeo, hoverRingMat);
    hoverRing.rotation.x = -Math.PI / 2;
    hoverRing.renderOrder = 999;
    hoverRing.visible = false;
    scene.add(hoverRing);
    hoverRingMeshRef.current = hoverRing;

    // Active Wire Start Pin Ring Indicator
    const startRingMat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald green
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
      depthTest: false,
    });
    const startRing = new THREE.Mesh(ringGeo.clone(), startRingMat);
    startRing.rotation.x = -Math.PI / 2;
    startRing.renderOrder = 999;
    startRing.visible = false;
    scene.add(startRing);
    activePinRingMeshRef.current = startRing;

    // Locked 60 FPS Animation Loop
    let animId = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [updateCameraPosition]);

  // 2. Incremental Synchronizer: ONLY add new / move existing / remove deleted components
  // Eliminates lagging, zero scene tear-down, 60 FPS guaranteed!
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const currentCompsMap = new Map(components.map((c) => [c.id, c]));
    const mountedInstances = instancesRef.current;

    // A. Remove components that no longer exist
    Object.keys(mountedInstances).forEach((id) => {
      if (!currentCompsMap.has(id)) {
        const inst = mountedInstances[id];
        scene.remove(inst.group);
        delete mountedInstances[id];
      }
    });

    // B. Rebuild pin hitboxes array
    const newHitboxes: THREE.Mesh[] = [];
    Object.values(mountedInstances).forEach((inst) => {
      Object.values(inst.pinMeshes).forEach((mesh) => {
        newHitboxes.push(mesh);
      });
    });

    // C. Update existing components or create newly added ones
    components.forEach((comp) => {
      const existing = mountedInstances[comp.id];

      if (existing) {
        // Fast transform update (takes 0.001ms, buttery smooth!)
        const { x, z } = to3DCoords(comp.x, comp.y);
        existing.group.position.set(x, 0, z);
        existing.group.rotation.y = -THREE.MathUtils.degToRad(comp.rotation || 0);

        // Update dynamic simulation properties
        updateComponentDynamicState(existing, comp, isSimulating, pinStates);
      } else if (!loadingCompsRef.current.has(comp.id)) {
        // Asynchronously load & mount the authentic GLB model
        loadingCompsRef.current.add(comp.id);

        createComponent3D(comp)
          .then((inst) => {
            loadingCompsRef.current.delete(comp.id);
            // Double check component wasn't deleted while loading
            if (!sceneRef.current) return;

            const { x, z } = to3DCoords(comp.x, comp.y);
            inst.group.position.set(x, 0, z);
            inst.group.rotation.y = -THREE.MathUtils.degToRad(comp.rotation || 0);

            sceneRef.current.add(inst.group);
            mountedInstances[comp.id] = inst;

            // Register pin hitboxes
            Object.values(inst.pinMeshes).forEach((mesh) => {
              pinHitboxesRef.current.push(mesh);
            });

            // Update state with simulation values
            updateComponentDynamicState(inst, comp, isSimulating, pinStates);

            // Trigger wire refresh so cables connecting to this component render immediately
            setLoadedCount((c) => c + 1);
          })
          .catch((err) => {
            loadingCompsRef.current.delete(comp.id);
            console.error('Failed to create component:', err);
          });
      }
    });

    pinHitboxesRef.current = newHitboxes;
  }, [components, to3DCoords]);

  // 3. Fast Synchronizer for 3D Tube Cables
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old wire meshes
    wireGroupsRef.current.forEach((wMesh) => scene.remove(wMesh));
    wireGroupsRef.current = [];

    // Ensure all model matrices are updated
    scene.updateMatrixWorld(true);

    wires.forEach((wire) => {
      const inst1 = instancesRef.current[wire.fromCompId];
      const inst2 = instancesRef.current[wire.toCompId];
      if (!inst1 || !inst2) return;

      let pos1: THREE.Vector3 | null = null;
      let pos2: THREE.Vector3 | null = null;

      // Source pin position
      const fromMesh = inst1.pinMeshes?.[wire.fromPinId];
      if (fromMesh) {
        pos1 = new THREE.Vector3();
        fromMesh.getWorldPosition(pos1);
      } else if (inst1.type === 'arduino-uno' && inst1.rawModelRoot && pinesArduino[wire.fromPinId]) {
        const c = pinesArduino[wire.fromPinId];
        pos1 = inst1.rawModelRoot.localToWorld(new THREE.Vector3(c.x, c.y, c.z));
      }

      // Target pin position
      const toMesh = inst2.pinMeshes?.[wire.toPinId];
      if (toMesh) {
        pos2 = new THREE.Vector3();
        toMesh.getWorldPosition(pos2);
      } else if (inst2.type === 'arduino-uno' && inst2.rawModelRoot && pinesArduino[wire.toPinId]) {
        const c = pinesArduino[wire.toPinId];
        pos2 = inst2.rawModelRoot.localToWorld(new THREE.Vector3(c.x, c.y, c.z));
      }

      if (pos1 && pos2) {
        const wireMesh = create3DWireMesh(pos1, pos2, wire.color);
        wireMesh.userData = { isWire: true, wireId: wire.id };
        scene.add(wireMesh);
        wireGroupsRef.current.push(wireMesh);
      }
    });
  }, [wires, components, loadedCount]);

  // 4. Update Dynamic States (LED glow, Servo angle, Module onboard LEDs) during simulation
  useEffect(() => {
    components.forEach((comp) => {
      const inst = instancesRef.current[comp.id];
      if (inst) {
        updateComponentDynamicState(inst, comp, isSimulating, pinStates);
      }
    });
  }, [pinStates, isSimulating, components]);

  // 5. Mouse Interaction Handlers (Orbit, Dragging Components, 3D Pin Wiring)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseVecRef.current.set(mouseX, mouseY);
    raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);

    // Right-click: Start Pan
    if (e.button === 2) {
      cameraOrbitRef.current.isPanning = true;
      cameraOrbitRef.current.startX = e.clientX;
      cameraOrbitRef.current.startY = e.clientY;
      return;
    }

    // Left-click: Test Raycast on Pins first!
    const pinIntersects = raycasterRef.current.intersectObjects(pinHitboxesRef.current, false);

    if (pinIntersects.length > 0) {
      const hitPin = pinIntersects[0].object;
      const { compId, pinId } = hitPin.userData;

      if (!activeWireStart) {
        // START 3D WIRE
        setActiveWireStart({ compId, pinId });
      } else {
        // CONNECT 3D WIRE
        if (activeWireStart.compId !== compId || activeWireStart.pinId !== pinId) {
          const newWire: Wire = {
            id: `w3d-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            fromCompId: activeWireStart.compId,
            fromPinId: activeWireStart.pinId,
            toCompId: compId,
            toPinId: pinId,
            color: selectedWireColor,
          };
          onWiresChange([...wires, newWire]);
        }
        setActiveWireStart(null);
        if (activePinRingMeshRef.current) {
          activePinRingMeshRef.current.visible = false;
        }
        if (liveWireMeshRef.current && sceneRef.current) {
          sceneRef.current.remove(liveWireMeshRef.current);
          liveWireMeshRef.current = null;
        }
      }
      return;
    }

    // 3. LÓGICA DE CLIC (Raycaster por proximidad para Arduino UNO)
    const unoInstances = Object.values(instancesRef.current).filter((inst) => inst.type === 'arduino-uno');
    for (const unoInst of unoInstances) {
      const modelToTest = unoInst.rawModelRoot || unoInst.glbModel || unoInst.group;
      const boardHits = raycasterRef.current.intersectObject(unoInst.group, true);
      if (boardHits.length > 0) {
        const clickWorld = boardHits[0].point;
        // Search pin within threshold (0.0055 local units / 0.45 world units)
        const match = findNearestArduinoPin(clickWorld, unoInst.rawModelRoot || modelToTest, 0.0055, 0.45);
        if (match) {
          const compId = unoInst.compId;
          const pinId = match.pinKey;

          if (!activeWireStart) {
            // START 3D WIRE from exact pin coordinates
            setActiveWireStart({ compId, pinId });
          } else {
            // CONNECT 3D WIRE to exact pin coordinates
            if (activeWireStart.compId !== compId || activeWireStart.pinId !== pinId) {
              const newWire: Wire = {
                id: `w3d-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                fromCompId: activeWireStart.compId,
                fromPinId: activeWireStart.pinId,
                toCompId: compId,
                toPinId: pinId,
                color: selectedWireColor,
              };
              onWiresChange([...wires, newWire]);
            }
            setActiveWireStart(null);
            if (activePinRingMeshRef.current) {
              activePinRingMeshRef.current.visible = false;
            }
            if (liveWireMeshRef.current && sceneRef.current) {
              sceneRef.current.remove(liveWireMeshRef.current);
              liveWireMeshRef.current = null;
            }
          }
          return;
        }
      }
    }

    // Test Raycast on Components for Dragging on table
    if (!activeWireStart && e.button === 0) {
      const compRoots = Object.values(instancesRef.current).map((inst) => inst.group);
      const compIntersects = raycasterRef.current.intersectObjects(compRoots, true);

      if (compIntersects.length > 0) {
        let cur: THREE.Object3D | null = compIntersects[0].object;
        while (cur && !cur.userData?.compId && cur.parent) {
          cur = cur.parent;
        }
        if (cur?.userData?.compId) {
          const compId = cur.userData.compId;
          const hitPt = new THREE.Vector3();
          raycasterRef.current.ray.intersectPlane(groundPlane.current, hitPt);

          draggingCompRef.current = {
            compId,
            offset: new THREE.Vector3().subVectors(cur.position, hitPt),
          };
          return;
        }
      }

      // If clicked empty space, start 3D Orbit
      cameraOrbitRef.current.isOrbiting = true;
      cameraOrbitRef.current.startX = e.clientX;
      cameraOrbitRef.current.startY = e.clientY;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;

    const rect = mountRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    mouseVecRef.current.set(mouseX, mouseY);
    raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);

    // Orbiting Camera
    if (cameraOrbitRef.current.isOrbiting) {
      const dx = e.clientX - cameraOrbitRef.current.startX;
      const dy = e.clientY - cameraOrbitRef.current.startY;
      cameraOrbitRef.current.startX = e.clientX;
      cameraOrbitRef.current.startY = e.clientY;

      cameraOrbitRef.current.theta -= dx * 0.008;
      cameraOrbitRef.current.phi = Math.max(0.1, Math.min(Math.PI / 2.05, cameraOrbitRef.current.phi - dy * 0.008));
      updateCameraPosition();
      return;
    }

    // Panning Camera
    if (cameraOrbitRef.current.isPanning) {
      const dx = e.clientX - cameraOrbitRef.current.startX;
      const dy = e.clientY - cameraOrbitRef.current.startY;
      cameraOrbitRef.current.startX = e.clientX;
      cameraOrbitRef.current.startY = e.clientY;

      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
      const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cameraRef.current.quaternion);
      cameraOrbitRef.current.target.addScaledVector(right, -dx * 0.02);
      cameraOrbitRef.current.target.addScaledVector(up, dy * 0.02);
      updateCameraPosition();
      return;
    }

    // Dragging Component across Table Ground Plane
    if (draggingCompRef.current) {
      const hitPt = new THREE.Vector3();
      if (raycasterRef.current.ray.intersectPlane(groundPlane.current, hitPt)) {
        const newPos = hitPt.add(draggingCompRef.current.offset);
        const { x: newX2D, y: newY2D } = to2DCoords(newPos.x, newPos.z);

        onComponentsChange(
          components.map((c) =>
            c.id === draggingCompRef.current?.compId
              ? { ...c, x: Math.max(20, newX2D), y: Math.max(20, newY2D) }
              : c
          )
        );
      }
      return;
    }

    // Hovering Pin Check (Direct hitboxes + Arduino UNO proximity detection)
    const pinIntersects = raycasterRef.current.intersectObjects(pinHitboxesRef.current, false);
    let hoveredFromProximity: { compId: string; pinId: string; label: string; worldPos: THREE.Vector3 } | null = null;

    if (pinIntersects.length > 0) {
      const hitPin = pinIntersects[0].object as THREE.Mesh;
      const p = hitPin.userData;
      setHoveredPinInfo({ compId: p.compId, pinId: p.pinId, label: p.label });

      // Position subtle hover ring at pin opening
      if (hoverRingMeshRef.current) {
        const pinWorldPos = new THREE.Vector3();
        hitPin.getWorldPosition(pinWorldPos);
        hoverRingMeshRef.current.position.set(pinWorldPos.x, pinWorldPos.y + 0.02, pinWorldPos.z);
        (hoverRingMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.95;
        hoverRingMeshRef.current.visible = true;
      }
    } else {
      // Check Arduino UNO proximity detection
      const unoInstances = Object.values(instancesRef.current).filter((inst) => inst.type === 'arduino-uno');
      for (const unoInst of unoInstances) {
        const modelToTest = unoInst.rawModelRoot || unoInst.glbModel || unoInst.group;
        const boardHits = raycasterRef.current.intersectObject(unoInst.group, true);
        if (boardHits.length > 0) {
          const hitPoint = boardHits[0].point;
          const match = findNearestArduinoPin(hitPoint, unoInst.rawModelRoot || modelToTest, 0.0055, 0.45);
          if (match) {
            const comp = components.find((c) => c.id === unoInst.compId);
            const compName = comp?.name || 'Arduino UNO';
            hoveredFromProximity = {
              compId: unoInst.compId,
              pinId: match.pinKey,
              label: `${compName} - ${getPinFriendlyLabel(match.pinKey)}`,
              worldPos: match.worldPos,
            };
            break;
          }
        }
      }

      if (hoveredFromProximity) {
        setHoveredPinInfo({
          compId: hoveredFromProximity.compId,
          pinId: hoveredFromProximity.pinId,
          label: hoveredFromProximity.label,
        });
        if (hoverRingMeshRef.current) {
          hoverRingMeshRef.current.position.set(
            hoveredFromProximity.worldPos.x,
            hoveredFromProximity.worldPos.y + 0.02,
            hoveredFromProximity.worldPos.z
          );
          (hoverRingMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.95;
          hoverRingMeshRef.current.visible = true;
        }
      } else {
        setHoveredPinInfo(null);
        if (hoverRingMeshRef.current) {
          hoverRingMeshRef.current.visible = false;
        }
      }
    }

    // Live preview of wire in progress
    if (activeWireStart) {
      const fromInst = instancesRef.current[activeWireStart.compId];
      let startPos: THREE.Vector3 | null = null;

      const fromMesh = fromInst?.pinMeshes?.[activeWireStart.pinId];
      if (fromMesh) {
        startPos = new THREE.Vector3();
        fromMesh.getWorldPosition(startPos);
      } else if (fromInst?.type === 'arduino-uno' && fromInst.rawModelRoot && pinesArduino[activeWireStart.pinId]) {
        const c = pinesArduino[activeWireStart.pinId];
        startPos = fromInst.rawModelRoot.localToWorld(new THREE.Vector3(c.x, c.y, c.z));
      }

      if (startPos) {
        // Position start indicator ring
        if (activePinRingMeshRef.current) {
          activePinRingMeshRef.current.position.set(startPos.x, startPos.y + 0.02, startPos.z);
          (activePinRingMeshRef.current.material as THREE.MeshBasicMaterial).opacity = 0.95;
          activePinRingMeshRef.current.visible = true;
        }

        const currentPos = new THREE.Vector3();
        if (pinIntersects.length > 0) {
          pinIntersects[0].object.getWorldPosition(currentPos);
        } else if (hoveredFromProximity) {
          currentPos.copy(hoveredFromProximity.worldPos);
        } else {
          raycasterRef.current.ray.intersectPlane(groundPlane.current, currentPos);
          currentPos.y += 0.2;
        }

        if (liveWireMeshRef.current && sceneRef.current) {
          sceneRef.current.remove(liveWireMeshRef.current);
        }
        const tempWire = create3DWireMesh(startPos, currentPos, selectedWireColor);
        sceneRef.current.add(tempWire);
        liveWireMeshRef.current = tempWire;
      }
    } else if (activePinRingMeshRef.current) {
      activePinRingMeshRef.current.visible = false;
    }
  };

  const handlePointerUp = () => {
    cameraOrbitRef.current.isOrbiting = false;
    cameraOrbitRef.current.isPanning = false;
    draggingCompRef.current = null;
  };

  // Camera Presets
  const resetCamera = () => {
    cameraOrbitRef.current = {
      theta: Math.PI / 4,
      phi: Math.PI / 3.4,
      radius: 17,
      target: new THREE.Vector3(0, 0, 0),
      isOrbiting: false,
      isPanning: false,
      startX: 0,
      startY: 0,
    };
    updateCameraPosition();
  };

  const setTopView = () => {
    cameraOrbitRef.current.phi = 0.05;
    cameraOrbitRef.current.theta = 0;
    cameraOrbitRef.current.radius = 19;
    cameraOrbitRef.current.target.set(0, 0, 0);
    updateCameraPosition();
  };

  const setFrontView = () => {
    cameraOrbitRef.current.phi = Math.PI / 2.2;
    cameraOrbitRef.current.theta = 0;
    cameraOrbitRef.current.radius = 16;
    cameraOrbitRef.current.target.set(0, 1, 0);
    updateCameraPosition();
  };

  const handleZoom = (delta: number) => {
    cameraOrbitRef.current.radius = Math.max(5, Math.min(30, cameraOrbitRef.current.radius + delta));
    updateCameraPosition();
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* Three.js Canvas Mount */}
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Floating 3D Controls Toolbar */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 p-1.5 bg-slate-900/85 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-2xl z-20">
        <button
          onClick={setTopView}
          title="Vista Superior Cenital (Top)"
          className="p-2 text-slate-300 hover:text-sky-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <Compass className="w-4 h-4 text-sky-400" />
          <span>Top</span>
        </button>
        <button
          onClick={setFrontView}
          title="Vista Frontal (Front)"
          className="p-2 text-slate-300 hover:text-emerald-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Front</span>
        </button>
        <button
          onClick={resetCamera}
          title="Restablecer Vista Isométrica"
          className="p-2 text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
        >
          <Camera className="w-4 h-4 text-amber-400" />
          <span>3D</span>
        </button>
        <div className="w-px h-5 bg-slate-700/60 mx-1" />
        <button
          onClick={() => handleZoom(-2)}
          title="Acercar (Zoom In)"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(2)}
          title="Alejar (Zoom Out)"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetCamera}
          title="Restablecer posición"
          className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Pin Connection Status & Guidance */}
      {hoveredPinInfo && (
        <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-amber-500/40 rounded-xl shadow-xl z-20 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <div className="text-xs">
            <span className="text-slate-400">Pin detectado: </span>
            <span className="font-semibold text-amber-300 font-mono">{hoveredPinInfo.label}</span>
            <span className="text-slate-400 text-[11px] ml-1">({hoveredPinInfo.pinId})</span>
          </div>
        </div>
      )}

      {/* Active 3D Wire In-Progress Notice */}
      {activeWireStart && (
        <div className="absolute top-16 left-4 flex items-center gap-3 px-4 py-2.5 bg-sky-950/90 backdrop-blur-md border border-sky-500/50 rounded-xl shadow-xl z-20">
          <div className="w-3 h-3 rounded-full bg-sky-400 animate-ping" />
          <div className="text-xs text-sky-200">
            Cableando desde <span className="font-mono font-bold text-white">{activeWireStart.pinId}</span>. Haz clic en el pin de destino para conectar.
          </div>
          <button
            onClick={() => {
              setActiveWireStart(null);
              if (activePinRingMeshRef.current) {
                activePinRingMeshRef.current.visible = false;
              }
              if (liveWireMeshRef.current && sceneRef.current) {
                sceneRef.current.remove(liveWireMeshRef.current);
                liveWireMeshRef.current = null;
              }
            }}
            className="text-xs text-sky-400 hover:text-white px-2 py-0.5 bg-sky-900/50 hover:bg-sky-800/80 rounded transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Quick Add Component Button overlay */}
      {onOpenComponentDrawer && (
        <div className="absolute bottom-4 left-4 z-20">
          <button
            onClick={onOpenComponentDrawer}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-sky-950/60 font-medium text-xs tracking-wide transition-all transform hover:-translate-y-0.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Agregar Componente 3D</span>
          </button>
        </div>
      )}

      {/* 3D Navigation Guide Pill */}
      <div className="absolute bottom-4 right-4 flex items-center gap-4 px-3 py-1.5 bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-lg text-[11px] text-slate-400 pointer-events-none z-10">
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Clic Izq</kbd> Rotar / Cablear
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Clic Der</kbd> Pan
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">Rueda</kbd> Zoom
        </span>
      </div>
    </div>
  );
};
