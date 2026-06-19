import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { makeFrostedMaps, makeEnvTexture, readDarkTheme } from './glassMaterial';

export interface Neuron {
  id: string;
  bornAt: string;
  phaseId: number;
  sessionContent: string;
  maturityLevel: number; // 0-4
  x: number;
  connections: string[];
}

interface HippocampalViewProps {
  neurons: Neuron[];
  onNeuronTap?: (neuron: Neuron) => void;
  phaseNames?: Record<number, string>;
  insightText?: string;
}

const MATURITY_LABELS = [
  'Прогениторная клетка',
  'Ранний нейробласт',
  'Промежуточный нейрон',
  'Зрелая гранулярная клетка',
  'Интегрированный нейрон',
];

// Maturity grows with age — older completed regimes have more integrated neurons.
function computeNeuronMaturity(bornAt: string, floor: number): number {
  const days = (Date.now() - new Date(bornAt).getTime()) / 86_400_000;
  return Math.min(4, Math.max(floor, Math.floor(days / 7)));
}

// Deterministic pseudo-random from a string id, so layout is stable per neuron.
function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}
function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Tube along a curve whose radius tapers linearly from rStart → rEnd.
// (Three's TubeGeometry has constant radius, so we build our own.)
function makeTaperedTube(
  curve: THREE.Curve<THREE.Vector3>,
  tubularSegments: number,
  rStart: number,
  rEnd: number,
  radialSegments: number,
): THREE.BufferGeometry {
  const frames = curve.computeFrenetFrames(tubularSegments, false);
  const positions: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const P = new THREE.Vector3();

  for (let i = 0; i <= tubularSegments; i++) {
    const u = i / tubularSegments;
    curve.getPointAt(u, P);
    const N = frames.normals[i];
    const B = frames.binormals[i];
    const radius = rStart + (rEnd - rStart) * u;
    for (let j = 0; j <= radialSegments; j++) {
      const v = (j / radialSegments) * Math.PI * 2;
      const sin = Math.sin(v);
      const cos = -Math.cos(v);
      const nx = cos * N.x + sin * B.x;
      const ny = cos * N.y + sin * B.y;
      const nz = cos * N.z + sin * B.z;
      const nlen = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      normals.push(nx / nlen, ny / nlen, nz / nlen);
      positions.push(
        P.x + radius * nx,
        P.y + radius * ny,
        P.z + radius * nz,
      );
    }
  }
  for (let i = 1; i <= tubularSegments; i++) {
    for (let j = 1; j <= radialSegments; j++) {
      const a = (radialSegments + 1) * (i - 1) + (j - 1);
      const b = (radialSegments + 1) * i + (j - 1);
      const c = (radialSegments + 1) * i + j;
      const d = (radialSegments + 1) * (i - 1) + j;
      indices.push(a, b, d, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setIndex(indices);
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return geo;
}

export function HippocampalView({
  neurons,
  onNeuronTap,
  phaseNames = {},
  insightText,
}: HippocampalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<Neuron | null>(null);
  const [threeReady, setThreeReady] = useState(false);
  const [isDark, setIsDark] = useState(readDarkTheme);
  const [overview, setOverview] = useState(false);
  // Imperative handle the scene populates so the button can drive the camera.
  const camApiRef = useRef<{ fitAll: () => void; reset: () => void } | null>(
    null,
  );

  // Re-theme on app light/dark toggle.
  useEffect(() => {
    const obs = new MutationObserver(() => setIsDark(readDarkTheme()));
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    let frameId = 0;
    let renderer: THREE.WebGLRenderer | null = null;
    let resizeObserver: ResizeObserver | null = null;
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const W = () => container.clientWidth || 460;
    const H = () => container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(46, W() / H(), 0.1, 200);
    camera.position.set(0, 0, 42);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W(), H());
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.querySelectorAll('canvas').forEach((c) => c.remove());
    container.appendChild(renderer.domElement);
    setThreeReady(true);

    // ── Lighting / environment ──
    const envTex = makeEnvTexture(isDark);
    scene.environment = envTex;
    scene.add(new THREE.AmbientLight(0xffffff, isDark ? 0.4 : 0.75));
    const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.15 : 1.5);
    keyLight.position.set(-6, 9, 12);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(
      isDark ? 0x6fd49a : 0xbfe3cd,
      isDark ? 0.85 : 0.5,
    );
    rimLight.position.set(8, -5, 6);
    scene.add(rimLight);

    const { normalMap, roughnessMap } = makeFrostedMaps(256, 2, 1);

    const graphGroup = new THREE.Group();
    scene.add(graphGroup);

    // Shared glass materials (cell body, dendrite, axon, nucleus).
    const bodyMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.32,
      roughnessMap,
      normalMap,
      normalScale: new THREE.Vector2(0.42, 0.42),
      transmission: 1.0,
      thickness: 2.2,
      ior: 1.46,
      attenuationColor: new THREE.Color(isDark ? 0x3f8c62 : 0x84b598),
      attenuationDistance: 4.5,
      clearcoat: 1.0,
      clearcoatRoughness: 0.16,
      envMap: envTex,
      envMapIntensity: isDark ? 1.0 : 1.3,
      transparent: true,
      emissive: new THREE.Color(0x6fd49a),
      emissiveIntensity: 0,
    });
    const dendriteMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.3,
      transmission: 1.0,
      thickness: 0.8,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.2,
      envMap: envTex,
      envMapIntensity: isDark ? 0.95 : 1.25,
      transparent: true,
    });
    const axonMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.34,
      roughnessMap,
      normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      transmission: 1.0,
      thickness: 1.0,
      ior: 1.45,
      attenuationColor: new THREE.Color(isDark ? 0x4f9e74 : 0x9fc7ad),
      attenuationDistance: 3.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.2,
      envMap: envTex,
      envMapIntensity: isDark ? 0.9 : 1.2,
      transparent: true,
      emissive: new THREE.Color(0x6fd49a),
      emissiveIntensity: 0,
    });
    // Dark-green nucleus that sits inside the translucent body (ref image 3).
    const nucleusMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x0c3a20 : 0x16502f,
      roughness: 0.55,
      metalness: 0,
      transmission: 0.15,
      thickness: 1.2,
      ior: 1.4,
      transparent: true,
      opacity: 0.96,
      emissive: new THREE.Color(0x16a34a),
      emissiveIntensity: isDark ? 0.22 : 0.12,
    });

    const disposables: Array<{ dispose: () => void }> = [
      normalMap,
      roughnessMap,
      envTex,
      bodyMat,
      dendriteMat,
      axonMat,
      nucleusMat,
    ];

    // ── Layout: quasi-chaotic but readable brain-net in a shallow slab ──
    // Neurons spread on a gentle horizontal arc with seeded jitter; z stays
    // shallow so nothing overlaps confusingly when the net tilts.
    const n = neurons.length;
    const positions: THREE.Vector3[] = [];
    const spreadX = Math.min(30, 8 + n * 4.5);
    for (let i = 0; i < n; i++) {
      const seed = hashSeed(neurons[i].id);
      const rng = mulberry32(Math.floor(seed * 1e9) + i * 97);
      const tt = n > 1 ? i / (n - 1) : 0.5;
      const x = (tt - 0.5) * 2 * spreadX;
      const y = (rng() - 0.5) * 14 + Math.sin(tt * Math.PI) * 4;
      const z = (rng() - 0.5) * 8;
      positions.push(new THREE.Vector3(x, y, z));
    }

    interface NeuronViz {
      group: THREE.Group;
      hit: THREE.Mesh;
      neuron: Neuron;
      maturity: number;
      restY: number;
      phase: number;
      pulseMeshes: THREE.Mesh[];
    }
    const vizList: NeuronViz[] = [];

    // ── Build a single glass neuron (body + nucleus + dendrites) ──
    function buildNeuron(neuron: Neuron, pos: THREE.Vector3, maturity: number) {
      const rng = mulberry32(Math.floor(hashSeed(neuron.id) * 1e9) + 13);
      const group = new THREE.Group();
      group.position.copy(pos);

      // size grows with maturity → neurons differ in size (and are tappable)
      const r = 1.7 + maturity * 0.55;

      // Cell body — icosahedron displaced into an organic blob.
      const bodyGeo = new THREE.IcosahedronGeometry(r, 3);
      const posAttr = bodyGeo.attributes.position as THREE.BufferAttribute;
      const v = new THREE.Vector3();
      for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i);
        const nlen = v.length();
        const warp =
          1 +
          Math.sin(v.x * 1.6 + neuron.phaseId) * 0.05 +
          Math.sin(v.y * 1.9 + 1.3) * 0.05 +
          Math.sin(v.z * 1.4 + 2.1) * 0.05 +
          (rng() - 0.5) * 0.04;
        v.multiplyScalar((r * warp) / nlen);
        posAttr.setXYZ(i, v.x, v.y, v.z);
      }
      bodyGeo.computeVertexNormals();
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      // Nucleus inside.
      const nucleus = new THREE.Mesh(
        new THREE.SphereGeometry(r * 0.46, 24, 18),
        nucleusMat,
      );
      nucleus.position.set(r * 0.12, -r * 0.08, r * 0.1);
      group.add(nucleus);

      // Dendrites — tapering glass tubes radiating outward (thick root → thin tip).
      const dendCount = 5 + Math.floor(maturity * 0.8) + Math.floor(rng() * 2);
      const pulseMeshes: THREE.Mesh[] = [];
      for (let d = 0; d < dendCount; d++) {
        const a = (d / dendCount) * Math.PI * 2 + (rng() - 0.5) * 0.4;
        const elev = (rng() - 0.5) * 1.0;
        const dir = new THREE.Vector3(
          Math.cos(a),
          Math.sin(a),
          elev * 0.55,
        ).normalize();
        const len = r * (1.3 + rng() * 0.9);
        const ctrl: THREE.Vector3[] = [];
        const segN = 5;
        for (let s = 0; s <= segN; s++) {
          const tt = s / segN;
          const bend = new THREE.Vector3(
            (rng() - 0.5) * 0.4,
            (rng() - 0.5) * 0.4,
            (rng() - 0.5) * 0.4,
          ).multiplyScalar(tt * len * 0.35);
          ctrl.push(dir.clone().multiplyScalar(r * 0.65 + len * tt).add(bend));
        }
        const curve = new THREE.CatmullRomCurve3(ctrl);
        const dendGeo = makeTaperedTube(curve, 28, r * 0.2, r * 0.02, 7);
        const dend = new THREE.Mesh(dendGeo, dendriteMat);
        group.add(dend);
      }

      // Invisible hit sphere for tapping (slightly larger than body).
      const hit = new THREE.Mesh(
        new THREE.SphereGeometry(r + 1.2, 12, 12),
        new THREE.MeshBasicMaterial({ visible: false }),
      );
      hit.userData = { neuron, maturity };
      group.add(hit);

      pulseMeshes.push(body, nucleus);
      graphGroup.add(group);
      vizList.push({
        group,
        hit,
        neuron,
        maturity,
        restY: pos.y,
        phase: rng() * 6,
        pulseMeshes,
      });
    }

    for (let i = 0; i < n; i++) {
      const m = computeNeuronMaturity(neurons[i].bornAt, neurons[i].maturityLevel);
      buildNeuron(neurons[i], positions[i], m);
    }

    // ── Axons: glass-bead chains linking connected neurons ──
    // Thickness + bead count grow with the *younger* endpoint's maturity, so an
    // axon thickens as related regimes are repeated.
    const idToIndex = new Map<string, number>();
    neurons.forEach((nu, i) => idToIndex.set(nu.id, i));

    function buildAxon(aIdx: number, bIdx: number, maturity: number) {
      const A = positions[aIdx];
      const B = positions[bIdx];
      const dist = A.distanceTo(B);
      const mid = A.clone().lerp(B, 0.5);
      // arc the axon slightly out of plane for depth
      mid.z += (hashSeed(neurons[aIdx].id + neurons[bIdx].id) - 0.5) * 6;
      mid.y += (hashSeed(neurons[bIdx].id) - 0.5) * 4;
      const curve = new THREE.CatmullRomCurve3([
        A.clone(),
        A.clone().lerp(mid, 0.5),
        mid,
        mid.clone().lerp(B, 0.5),
        B.clone(),
      ]);

      // thin connecting fibre always present
      const fibreR = 0.14 + maturity * 0.05;
      const fibre = new THREE.Mesh(
        new THREE.TubeGeometry(curve, 60, fibreR, 8, false),
        axonMat,
      );
      graphGroup.add(fibre);

      // glass beads along it — more beads as the axon matures
      const beadCount = Math.max(2, Math.round(dist / 4) + maturity);
      const beadR = 0.34 + maturity * 0.06;
      const beadGeo = new THREE.SphereGeometry(beadR, 20, 16);
      for (let i = 1; i <= beadCount; i++) {
        const tt = i / (beadCount + 1);
        const p = curve.getPointAt(tt);
        const bead = new THREE.Mesh(beadGeo, axonMat);
        bead.position.copy(p);
        bead.scale.set(1.3, 0.85, 0.85);
        // orient bead along the curve tangent
        const tan = curve.getTangentAt(tt);
        const m = new THREE.Matrix4().lookAt(
          p,
          p.clone().add(tan),
          new THREE.Vector3(0, 0, 1),
        );
        bead.quaternion.setFromRotationMatrix(m);
        bead.rotateY(Math.PI / 2);
        graphGroup.add(bead);
      }
    }

    neurons.forEach((nu, i) => {
      const m = computeNeuronMaturity(nu.bornAt, nu.maturityLevel);
      nu.connections.forEach((cid) => {
        const j = idToIndex.get(cid);
        if (j === undefined) return;
        // axon maturity = min of the two endpoints (the younger fibre)
        const mj = computeNeuronMaturity(
          neurons[j].bornAt,
          neurons[j].maturityLevel,
        );
        buildAxon(i, j, Math.min(m, mj));
      });
    });

    // ── Interaction: light rotation + tap ──
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const hitTargets = vizList.map((vz) => vz.hit);

    let isDragging = false;
    let moved = false;
    const rot = { x: 0.04, y: 0 };
    const target = { x: 0.04, y: 0 };
    let last = { x: 0, y: 0 };
    let hoveredViz: NeuronViz | null = null;

    // Camera dolly — animated in the loop. Default sits close; "fit all" pulls
    // the camera back far enough that every neuron is comfortably on screen.
    const DEFAULT_Z = 42;
    let targetCameraZ = DEFAULT_Z;
    let overviewActive = false;

    // Distance needed to frame the whole net for the current viewport.
    const computeFitDistance = () => {
      if (positions.length === 0) return DEFAULT_Z;
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity,
        maxAbsZ = 0;
      vizList.forEach((vz) => {
        const p = vz.group.position;
        const reach = (1.7 + vz.maturity * 0.55) * 2.6; // body + dendrite span
        minX = Math.min(minX, p.x - reach);
        maxX = Math.max(maxX, p.x + reach);
        minY = Math.min(minY, p.y - reach);
        maxY = Math.max(maxY, p.y + reach);
        maxAbsZ = Math.max(maxAbsZ, Math.abs(p.z) + reach);
      });
      const halfW = (maxX - minX) / 2;
      const halfH = (maxY - minY) / 2;
      const vFov = (camera.fov * Math.PI) / 180;
      const tanV = Math.tan(vFov / 2);
      const aspect = W() / H();
      const distH = halfH / tanV;
      const distW = halfW / (tanV * aspect);
      // pull back past the deepest neuron, with a comfortable margin
      return Math.min(160, Math.max(distH, distW) + maxAbsZ + 6);
    };

    camApiRef.current = {
      fitAll: () => {
        targetCameraZ = computeFitDistance();
        target.x = 0.04; // level the net so it reads cleanly
        target.y = 0;
        overviewActive = true;
        hoveredViz = null;
      },
      reset: () => {
        targetCameraZ = DEFAULT_Z;
        overviewActive = false;
      },
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      moved = false;
      last = { x: e.clientX, y: e.clientY };
      container.style.cursor = 'grabbing';
    };
    const onPointerMove = (e: PointerEvent) => {
      const b = container.getBoundingClientRect();
      pointer.x = ((e.clientX - b.left) / b.width) * 2 - 1;
      pointer.y = -((e.clientY - b.top) / b.height) * 2 + 1;

      if (isDragging) {
        const dx = e.clientX - last.x;
        const dy = e.clientY - last.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) moved = true;
        target.y += dx * 0.005;
        target.x += dy * 0.005;
        // clamp so the net can't be flipped into confusion
        target.x = Math.max(-0.5, Math.min(0.5, target.x));
        target.y = Math.max(-0.7, Math.min(0.7, target.y));
        last = { x: e.clientX, y: e.clientY };
        return;
      }

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(hitTargets, false);
      hoveredViz =
        hits.length > 0
          ? vizList.find((vz) => vz.hit === hits[0].object) || null
          : null;
      container.style.cursor = hoveredViz ? 'pointer' : 'grab';
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      container.style.cursor = hoveredViz ? 'pointer' : 'grab';
      if (moved) return; // drag, not a tap
      const b = container.getBoundingClientRect();
      const px = ((e.clientX - b.left) / b.width) * 2 - 1;
      const py = -((e.clientY - b.top) / b.height) * 2 + 1;
      raycaster.setFromCamera({ x: px, y: py } as THREE.Vector2, camera);
      const hits = raycaster.intersectObjects(hitTargets, false);
      if (active && hits.length > 0) {
        const { neuron, maturity } = hits[0].object.userData as {
          neuron: Neuron;
          maturity: number;
        };
        const enriched = { ...neuron, maturityLevel: maturity };
        setSelected((prev) => (prev?.id === enriched.id ? null : enriched));
        onNeuronTap?.(enriched);
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // ── Animation ──
    let time = 0;
    const tick = () => {
      if (!active || !renderer) return;
      time += 0.016;

      // gentle auto-drift when idle, never fast (paused in overview)
      if (!isDragging && !hoveredViz && !overviewActive && !reduceMotion)
        target.y += 0.0006;

      rot.x += (target.x - rot.x) * 0.07;
      rot.y += (target.y - rot.y) * 0.07;
      graphGroup.rotation.x = rot.x;
      graphGroup.rotation.y = rot.y;

      // smooth camera dolly toward the current target distance
      camera.position.z += (targetCameraZ - camera.position.z) * 0.08;

      // soft breathing of each neuron; hovered one swells slightly
      for (const vz of vizList) {
        if (!reduceMotion) {
          vz.group.position.y =
            vz.restY + Math.sin(time * 0.9 + vz.phase) * 0.18;
        }
        const pulse = 1 + Math.sin(time * 1.2 + vz.phase) * 0.015;
        const aim = hoveredViz === vz ? 1.08 : 1.0;
        const s = vz.group.scale.x + (aim * pulse - vz.group.scale.x) * 0.1;
        vz.group.scale.setScalar(s);
      }
      // subtle shared emissive shimmer so glass edges catch light
      bodyMat.emissiveIntensity = 0.04 + Math.sin(time * 0.8) * 0.02;
      axonMat.emissiveIntensity = 0.05 + Math.sin(time * 0.8 + 1) * 0.02;

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    tick();

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (!active || !renderer) return;
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      active = false;
      if (frameId) cancelAnimationFrame(frameId);
      if (resizeObserver) resizeObserver.disconnect();
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      camApiRef.current = null;

      graphGroup.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
      });
      for (const d of disposables) d.dispose();
      renderer.dispose();
      container.querySelectorAll('canvas').forEach((c) => c.remove());
    };
  }, [neurons, isDark]);

  // Scene is rebuilt when neurons/theme change → drop back to the default view.
  useEffect(() => {
    setOverview(false);
  }, [neurons, isDark]);

  const toggleOverview = () => {
    const api = camApiRef.current;
    if (!api) return;
    if (overview) {
      api.reset();
      setOverview(false);
    } else {
      api.fitAll();
      setOverview(true);
    }
  };

  const isEmpty = neurons.length === 0;

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full h-[360px] rounded-2xl overflow-hidden relative select-none cursor-grab active:cursor-grabbing"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 40%, rgba(24,48,31,0.96) 0%, rgba(13,30,21,0.98) 55%, rgba(7,17,11,1) 100%)'
            : 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.92) 0%, rgba(238,236,231,0.94) 55%, rgba(223,221,215,0.96) 100%)',
          border: '1px solid var(--glass-border)',
          boxShadow: isDark
            ? '0 16px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
            : '0 16px 40px rgba(26,26,26,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
        }}
      >
        {!threeReady && (
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(50% 60% at 50% 55%, var(--glass-2), transparent 75%)',
            }}
          />
        )}

        {/* Minimal eyebrow — no legend, no controls clutter */}
        <div className="absolute inset-x-0 top-0 flex items-center gap-2 p-4 pointer-events-none z-10">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: 'var(--accent-ink)',
              boxShadow: '0 0 8px var(--accent-ink)',
            }}
          />
          <span
            className="font-mono text-[9px] uppercase tracking-[0.22em]"
            style={{ color: 'var(--ink3)' }}
          >
            Нейрогенез · {neurons.length}{' '}
            {neurons.length === 1 ? 'нейрон' : 'нейронов'}
          </span>
        </div>

        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <p
              className="font-serif italic text-[13px] text-center max-w-[240px] leading-relaxed px-4 py-2"
              style={{ color: 'var(--ink3)' }}
            >
              Первый нейрон родится после прохождения режима
            </p>
          </div>
        )}

        {/* Fit-all / return view toggle — only useful with several neurons */}
        {neurons.length >= 2 && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center p-3 z-20">
            <button
              onClick={toggleOverview}
              className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md active:scale-[0.97] transition-transform"
              style={{
                background: 'var(--glass-2)',
                border: '1px solid var(--glass-border)',
                color: 'var(--ink2)',
                boxShadow: isDark
                  ? '0 6px 18px rgba(0,0,0,0.4)'
                  : '0 6px 18px rgba(26,26,26,0.12)',
              }}
            >
              <span
                className="font-mono text-[10px] uppercase tracking-[0.16em]"
              >
                {overview ? 'Вернуть вид' : 'Показать все'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Tap → detail sheet */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 z-[210]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ background: 'var(--scrim)' }}
              onClick={() => setSelected(null)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 z-[220] rounded-t-[32px] p-6 shadow-2xl max-w-full sm:max-w-md mx-auto"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              style={{
                background: 'var(--card)',
                border: '1px solid var(--glass-border)',
                borderBottom: 'none',
              }}
            >
              <div
                className="w-8 h-1 rounded-full mx-auto mb-4"
                style={{ background: 'var(--placeholder)' }}
              />
              <div className="flex items-center justify-between mb-3">
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: 'var(--ink3)' }}
                >
                  {new Date(selected.bornAt).toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                {phaseNames[selected.phaseId] && (
                  <span
                    className="font-mono text-[10px] uppercase tracking-widest"
                    style={{ color: 'var(--ink3)' }}
                  >
                    {phaseNames[selected.phaseId]}
                  </span>
                )}
              </div>
              <p
                className="text-[14px] font-serif italic leading-relaxed mb-4"
                style={{ color: 'var(--ink)' }}
              >
                {selected.sessionContent}
              </p>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{
                  background: 'var(--sunken)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: 'var(--accent-ink)' }}
                />
                <span
                  className="font-mono text-[10px] uppercase tracking-wider"
                  style={{ color: 'var(--ink3)' }}
                >
                  {MATURITY_LABELS[selected.maturityLevel]}
                </span>
              </div>
              {insightText && (
                <>
                  <div
                    className="h-px w-full my-4"
                    style={{ background: 'var(--border)' }}
                  />
                  <p
                    className="text-[13px] leading-relaxed font-mono"
                    style={{ color: 'var(--ink2)' }}
                  >
                    {insightText}
                  </p>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HippocampalView;
