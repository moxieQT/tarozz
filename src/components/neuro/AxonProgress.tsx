import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { makeFrostedMaps, makeEnvTexture, readDarkTheme } from './glassMaterial';

export interface AxonProgressProps {
  totalSegments: number;
  completedSegments: number;
  justAddedSegments: number;
  cycleNumber: number;
  intensity: number; // 0-100
  onCycleComplete?: () => void;
}

export function AxonProgress({
  totalSegments,
  completedSegments,
  justAddedSegments,
  cycleNumber,
  intensity: _intensity,
}: AxonProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [threeReady, setThreeReady] = useState(false);
  const [isDark, setIsDark] = useState(readDarkTheme);

  // Re-theme the scene whenever the app toggles light/dark.
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

    const rect = container.getBoundingClientRect();
    let width = rect.width || 360;
    let height = rect.height || 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 0.2, 8.5);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.querySelectorAll('canvas').forEach((c) => c.remove());
    container.appendChild(renderer.domElement);
    setThreeReady(true);

    // ── Theme-dependent lighting / environment ──
    const envTex = makeEnvTexture(isDark);
    scene.environment = envTex;

    const ambient = new THREE.AmbientLight(0xffffff, isDark ? 0.35 : 0.7);
    scene.add(ambient);
    const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.1 : 1.4);
    keyLight.position.set(-4, 6, 8);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(
      isDark ? 0x6fd49a : 0xbfe3cd,
      isDark ? 0.8 : 0.5,
    );
    rimLight.position.set(5, -3, 4);
    scene.add(rimLight);

    // Travelling action-potential glow lives *inside* the glass — a point light.
    const impulseLight = new THREE.PointLight(0x9bf6c4, 0, 6, 2);
    scene.add(impulseLight);

    const { normalMap, roughnessMap } = makeFrostedMaps(256);

    const axonGroup = new THREE.Group();
    scene.add(axonGroup);

    const beadCount = Math.max(1, totalSegments);
    const completed = Math.max(0, Math.min(beadCount, completedSegments));
    const justAdded = Math.max(0, justAddedSegments);

    const spanLen = 9.2; // fixed total length of the axon
    const startX = -spanLen / 2;
    const stepX = beadCount > 1 ? spanLen / (beadCount - 1) : 0;
    
    // Calculate bead dimensions dynamically to prevent overlap on high segment counts
    let beadR = 0.52;
    let beadLen = beadCount > 1 ? stepX * 0.5 : 2.0;
    
    const maxCapsuleLen = beadCount > 1 ? stepX * 0.82 : 3.0; // leave ~18% gap
    const actualCapsuleLen = beadLen + 2 * beadR;
    const scale = actualCapsuleLen > maxCapsuleLen ? maxCapsuleLen / actualCapsuleLen : 1;
    
    beadR *= scale;
    beadLen *= scale;

    // Rest spine — displaced each frame for the slow writhe.
    const spineRest: THREE.Vector3[] = [];
    const spineCtrlCount = 7;
    for (let i = 0; i < spineCtrlCount; i++) {
      const tt = i / (spineCtrlCount - 1);
      spineRest.push(new THREE.Vector3(startX + tt * spanLen, 0, 0));
    }

    const makeGlassMat = (justMatured: boolean) =>
      new THREE.MeshPhysicalMaterial({
        color: justMatured ? (isDark ? 0xbdf5d2 : 0xe9f7ee) : 0xffffff,
        metalness: 0,
        roughness: 0.35,
        roughnessMap,
        normalMap,
        normalScale: new THREE.Vector2(1.2, 1.2),
        transmission: 1.0,
        thickness: 1.4,
        ior: 1.45,
        attenuationColor: new THREE.Color(isDark ? 0x4f9e74 : 0x9fc7ad),
        attenuationDistance: 3.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.18,
        envMap: envTex,
        envMapIntensity: isDark ? 0.9 : 1.2,
        transparent: true,
        emissive: new THREE.Color(0x6fd49a),
        emissiveIntensity: 0,
      });

    interface Bead {
      group: THREE.Group;
      mat: THREE.MeshPhysicalMaterial;
      tAlong: number;
      index: number;
      justMatured: boolean;
    }
    const beads: Bead[] = [];

    // Capsule = cylinder + two hemisphere caps (geometry safe on r128 & r184).
    function buildBead(index: number, justMatured: boolean): Bead {
      const mat = makeGlassMat(justMatured);
      const group = new THREE.Group();

      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(beadR, beadR, beadLen, 40, 1),
        mat,
      );
      body.rotation.z = Math.PI / 2; // cylinder runs along local +X
      group.add(body);

      const capGeo = new THREE.SphereGeometry(
        beadR,
        32,
        20,
        0,
        Math.PI * 2,
        0,
        Math.PI / 2,
      );
      const capL = new THREE.Mesh(capGeo, mat);
      capL.position.x = -beadLen / 2;
      capL.rotation.z = Math.PI / 2;
      group.add(capL);
      const capR = new THREE.Mesh(capGeo, mat);
      capR.position.x = beadLen / 2;
      capR.rotation.z = -Math.PI / 2;
      group.add(capR);

      const tAlong = beadCount > 1 ? index / (beadCount - 1) : 0.5;
      axonGroup.add(group);
      return { group, mat, tAlong, index, justMatured };
    }

    // Thin bare-fibre core spanning the full fixed length (continuity).
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: isDark ? 0x2c4a37 : 0xc7d8cc,
      roughness: 0.55,
      metalness: 0,
      transmission: 0.6,
      thickness: 0.4,
      ior: 1.4,
      transparent: true,
      opacity: 0.5,
      emissive: new THREE.Color(0x6fd49a),
      emissiveIntensity: 0,
    });
    let coreMesh: THREE.Mesh | null = null;

    function rebuildCore(curve: THREE.CatmullRomCurve3) {
      if (coreMesh) {
        coreMesh.geometry.dispose();
        axonGroup.remove(coreMesh);
      }
      const geo = new THREE.TubeGeometry(curve, 80, 0.12, 10, false);
      coreMesh = new THREE.Mesh(geo, coreMat);
      axonGroup.add(coreMesh);
    }

    // Ranvier nodes — small faceted glass studs between completed beads.
    const nodeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.28,
      roughnessMap,
      normalMap,
      normalScale: new THREE.Vector2(0.9, 0.9),
      metalness: 0,
      transmission: 1.0,
      thickness: 0.7,
      ior: 1.45,
      clearcoat: 1.0,
      clearcoatRoughness: 0.2,
      envMap: envTex,
      envMapIntensity: isDark ? 1.0 : 1.3,
      transparent: true,
      emissive: new THREE.Color(0x9bf6c4),
      emissiveIntensity: 0,
    });
    interface NodeStud {
      mesh: THREE.Mesh;
      tAlong: number;
    }
    const nodes: NodeStud[] = [];
    const nodeR = 0.26 * scale;
    const nodeGeo = new THREE.SphereGeometry(nodeR, 24, 18);

    for (let i = 0; i < completed; i++) {
      const justMatured = justAdded > 0 && i >= completed - justAdded;
      beads.push(buildBead(i, justMatured));
      if (i < completed - 1) {
        const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
        nodeMesh.scale.set(1, 0.82, 0.82); // slightly squashed bead-knot
        const tA = beadCount > 1 ? (i + 0.5) / (beadCount - 1) : 0.5;
        nodes.push({ mesh: nodeMesh, tAlong: tA });
        axonGroup.add(nodeMesh);
      }
    }

    // Glow travels only across the completed portion.
    const completedT =
      beadCount > 1 ? (completed - 1) / (beadCount - 1) : completed > 0 ? 1 : 0;

    // ── Pointer parallax ──
    let targetRotY = 0;
    let targetRotX = 0;
    const onPointerMove = (e: PointerEvent) => {
      const b = container.getBoundingClientRect();
      const mx = ((e.clientX - b.left) / b.width) * 2 - 1;
      const my = -((e.clientY - b.top) / b.height) * 2 + 1;
      targetRotY = mx * 0.32;
      targetRotX = -my * 0.18;
    };
    const onPointerLeave = () => {
      targetRotY = 0;
      targetRotX = 0;
    };
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    // ── Spine displacement + placement helpers ──
    const clampT = (v: number) => Math.min(0.999, Math.max(0.001, v));
    const tmpTan = new THREE.Vector3();
    const tmpPos = new THREE.Vector3();
    const up = new THREE.Vector3(0, 0, 1);
    const lookM = new THREE.Matrix4();

    function buildSpineCurve(time: number) {
      const amp = reduceMotion ? 0 : 0.42;
      const pts = spineRest.map((p, i) => {
        const phase = i * 0.9;
        const y = Math.sin(time * 0.6 + phase) * amp;
        const z = Math.cos(time * 0.45 + phase * 0.7) * amp * 0.6;
        return new THREE.Vector3(p.x, p.y + y, p.z + z);
      });
      return new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5);
    }

    function placeAlong(
      curve: THREE.CatmullRomCurve3,
      tAlong: number,
      obj: THREE.Object3D,
      orient: boolean,
    ) {
      const ct = clampT(tAlong);
      curve.getPointAt(ct, tmpPos);
      obj.position.copy(tmpPos);
      if (orient) {
        curve.getTangentAt(ct, tmpTan);
        // Align local -Z to the tangent, then rotate so local +X follows it
        // (the capsule body cylinder runs along local +X).
        lookM.lookAt(tmpPos, tmpPos.clone().add(tmpTan), up);
        obj.quaternion.setFromRotationMatrix(lookM);
        obj.rotateY(Math.PI / 2);
      }
    }

    // ── Animation ──
    let time = 0;
    const loopDuration = 4.2; // seconds for one glow traversal

    const tick = () => {
      if (!active || !renderer) return;
      time += 0.016;

      const curve = buildSpineCurve(time);
      rebuildCore(curve);

      for (const b of beads) placeAlong(curve, b.tAlong, b.group, true);
      for (const n of nodes) placeAlong(curve, n.tAlong, n.mesh, false);

      axonGroup.rotation.y += (targetRotY - axonGroup.rotation.y) * 0.06;
      axonGroup.rotation.x += (targetRotX - axonGroup.rotation.x) * 0.06;
      if (!reduceMotion) axonGroup.rotation.z = Math.sin(time * 0.3) * 0.015;

      if (completed > 0 && completedT > 0 && !reduceMotion) {
        const cyclePos = (time % loopDuration) / loopDuration;
        const headT = cyclePos * completedT;

        curve.getPointAt(clampT(headT), tmpPos);
        impulseLight.position.copy(tmpPos);
        impulseLight.intensity = 1.6;

        for (const b of beads) {
          const d = b.tAlong - headT;
          const glow = Math.max(0, 1 - Math.abs(d) / 0.14);
          const lead = d > 0 && d < 0.05 ? 0.18 : 0; // faint anticipation
          b.mat.emissiveIntensity =
            (b.justMatured ? 0.1 : 0.03) + glow * 0.55 + lead;
        }

        let nearest = 1;
        for (const n of nodes) {
          const dist = Math.abs(n.tAlong - headT);
          nearest = Math.min(nearest, dist);
          const flare = Math.max(0, 1 - dist / 0.04) * 0.6;
          n.mesh.scale.set(1 + flare, 0.82 + flare, 0.82 + flare);
        }
        nodeMat.emissiveIntensity = Math.max(0, 1 - nearest / 0.04) * 0.9;

        coreMat.emissiveIntensity =
          0.05 + Math.max(0, 1 - Math.abs(0.5 - cyclePos)) * 0.1;
      } else {
        impulseLight.intensity = 0;
        for (const b of beads)
          b.mat.emissiveIntensity = b.justMatured ? 0.12 : 0.04;
        nodeMat.emissiveIntensity = 0.1;
        coreMat.emissiveIntensity = 0.04;
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(tick);
    };
    tick();

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (!active || !renderer) return;
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          width = w;
          height = h;
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
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);

      normalMap.dispose();
      roughnessMap.dispose();
      envTex.dispose();
      for (const b of beads) {
        b.group.traverse((o) => {
          const m = o as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
        });
        b.mat.dispose();
      }
      for (const n of nodes) n.mesh.scale.set(1, 0.82, 0.82);
      nodeGeo.dispose();
      nodeMat.dispose();
      coreMat.dispose();
      if (coreMesh) coreMesh.geometry.dispose();
      renderer.dispose();
      container.querySelectorAll('canvas').forEach((c) => c.remove());
    };
  }, [totalSegments, completedSegments, justAddedSegments, isDark]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[220px] relative rounded-2xl overflow-hidden transition-all duration-700"
      style={{
        background: isDark
          ? 'radial-gradient(120% 140% at 20% 0%, rgba(24,48,31,0.96) 0%, rgba(13,30,21,0.98) 55%, rgba(7,17,11,1) 100%)'
          : 'radial-gradient(120% 140% at 20% 0%, rgba(255,255,255,0.9) 0%, rgba(238,236,231,0.92) 55%, rgba(223,221,215,0.95) 100%)',
        border: '1px solid var(--glass-border)',
        boxShadow: isDark
          ? '0 16px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06)'
          : '0 16px 40px rgba(26,26,26,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {!threeReady && (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 90% at 50% 55%, var(--glass-2), transparent 70%)',
          }}
        />
      )}

      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none p-4 z-20">
        <div className="flex items-center gap-2">
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
            Аксон · Миелинизация 3D
          </span>
        </div>
        <div className="flex items-end justify-between">
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink3)' }}>
            {completedSegments} / {totalSegments} сегментов
          </span>
          <span
            className="font-mono text-[10px] tracking-wider"
            style={{ color: 'var(--ink3)' }}
          >
            ЦИКЛ {cycleNumber}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AxonProgress;
