import React, { useEffect, useRef, useState } from 'react';

export interface AxonProgressProps {
  totalSegments: number;
  completedSegments: number;
  justAddedSegments: number;
  cycleNumber: number;
  intensity: number; // 0-100
  onCycleComplete?: () => void;
}

// Simple loader query for Three.js CDN
const loadThree = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).THREE) {
      resolve((window as any).THREE);
      return;
    }
    const existingScript = document.getElementById('three-js-cdn');
    if (existingScript) {
      const handleLoad = () => resolve((window as any).THREE);
      existingScript.addEventListener('load', handleLoad);
      return;
    }
    const script = document.createElement('script');
    script.id = 'three-js-cdn';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.async = true;
    script.onload = () => resolve((window as any).THREE);
    script.onerror = (e) => reject(e);
    document.head.appendChild(script);
  });
};

export function AxonProgress({
  totalSegments,
  completedSegments,
  justAddedSegments,
  cycleNumber,
  intensity,
}: AxonProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [threeLoaded, setThreeLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    let animationFrameId: number;
    let renderer: any = null;
    let resizeObserver: ResizeObserver | null = null;

    loadThree().then((THREE) => {
      if (!active || !containerRef.current) return;
      setThreeLoaded(true);

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const width = rect.width || 360;
      const height = rect.height || 150;

      // 1. Scene setup
      const scene = new THREE.Scene();

      // 2. Camera setup
      const camera = new THREE.PerspectiveCamera(52, width / height, 0.1, 100);
      camera.position.set(0, 0, 9);

      // 3. Renderer with transparent background to overlay on Tailwind
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(width, height);
      
      // Clean previous canvases
      container.querySelectorAll('canvas').forEach(c => c.remove());
      container.appendChild(renderer.domElement);

      // 4. Lights
      const ambientLight = new THREE.AmbientLight(0x2a2826, 0.8);
      scene.add(ambientLight);

      const dirLight1 = new THREE.DirectionalLight(0xfff0dd, 0.85);
      dirLight1.position.set(2, 5, 10);
      scene.add(dirLight1);

      const pulseLight = new THREE.PointLight(0xffb84d, 1.8, 12);
      pulseLight.position.set(0, 0, 1);
      scene.add(pulseLight);

      // 5. Axon Core Group with Fiber Bundles & Growth Cone
      const axonGroup = new THREE.Group();
      scene.add(axonGroup);

      // ---- glow sprite texture ----
      const glowTex = (() => {
        const c = document.createElement('canvas'); c.width = c.height = 128;
        const g = c.getContext('2d')!;
        const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.25, 'rgba(255,255,255,0.55)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
      })();

      const addHalo = (pos: any, size: number, color: number, opacity: number) => {
        const m = new THREE.SpriteMaterial({
          map: glowTex,
          color,
          transparent: true,
          opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: false
        });
        const s = new THREE.Sprite(m);
        s.position.copy(pos);
        s.scale.set(size, size, 1);
        axonGroup.add(s);
        return s;
      };

      const pulsers: any[] = []; // {obj, base, amp, freq, phase}

      const tubeMat = (color: number, opacity: number) => new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
      });

      function buildBundle(ctrlPts: number[][], opts: { count: number; radius: number; coreR: number; turns: number; fan: number; color: number }) {
        const base = new THREE.CatmullRomCurve3(ctrlPts.map(p => new THREE.Vector3(p[0], p[1], p[2])));
        const N = 120;
        const pts: any[] = [];
        const tans: any[] = [];
        for (let i = 0; i <= N; i++) {
          const t = i / N;
          pts.push(base.getPoint(t));
          tans.push(base.getTangent(t));
        }
        const group = new THREE.Group();

        for (let f = 0; f < opts.count; f++) {
          const phase = (f / opts.count) * Math.PI * 2;
          const turns = opts.turns;
          const fr = opts.radius * (0.55 + Math.random() * 0.9);
          const fiberPts: any[] = [];
          for (let i = 0; i <= N; i++) {
            const t = i / N;
            const P = pts[i];
            const T = tans[i];
            const perpA = new THREE.Vector3(-T.y, T.x, 0).normalize();
            const perpB = new THREE.Vector3().crossVectors(T, perpA).normalize();
            const ang = t * turns * Math.PI * 2 + phase;
            const spread = fr * (1 + Math.pow(t, 3) * opts.fan);
            const wobble = Math.sin(t * 9 + f) * 0.05;
            fiberPts.push(P.clone()
              .addScaledVector(perpA, Math.cos(ang) * spread + wobble)
              .addScaledVector(perpB, Math.sin(ang) * spread));
          }
          const curve = new THREE.CatmullRomCurve3(fiberPts);
          const coreR = opts.coreR * (0.6 + Math.random() * 0.7);
          const core = new THREE.Mesh(new THREE.TubeGeometry(curve, 100, coreR, 6, false), tubeMat(opts.color, 0.9));
          const halo = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, coreR * 3.4, 6, false), tubeMat(opts.color, 0.12));
          group.add(core);
          group.add(halo);
        }
        axonGroup.add(group);
        return { base, endPt: pts[N], endTan: tans[N] };
      }

      function buildGrowthCone(center: any, dir: any, scale: number) {
        const D = dir.clone().normalize();
        const up = new THREE.Vector3(0, 0, 1);
        const side = new THREE.Vector3().crossVectors(D, up).normalize();
        const side2 = new THREE.Vector3().crossVectors(D, side).normalize();

        const lam = addHalo(center, 9 * scale, 0xd4af37, 0.45);
        pulsers.push({ obj: lam, base: 9 * scale, amp: 1.0 * scale, freq: 1.3, phase: Math.random() * 6 });
        addHalo(center.clone().addScaledVector(D, 1.2 * scale), 6 * scale, 0xffd700, 0.3);

        addHalo(center.clone().addScaledVector(D, -1.5 * scale), 5 * scale, 0x8b6508, 0.4);

        const fmat = (color: number, opacity: number) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false });

        const nFil = 25;
        for (let i = 0; i < nFil; i++) {
          const a = (Math.random() - 0.5) * 2.2;
          const b = (Math.random() - 0.5) * 1.5;
          const len = (2.0 + Math.random() * 4.5) * scale;
          const dirF = D.clone()
            .addScaledVector(side, Math.sin(a) * 1.1)
            .addScaledVector(side2, Math.sin(b) * 0.9)
            .normalize();
          const baseOff = center.clone()
            .addScaledVector(side, (Math.random() - 0.5) * 3 * scale)
            .addScaledVector(side2, (Math.random() - 0.5) * 2.5 * scale)
            .addScaledVector(D, (Math.random() * 1.0) * scale);
          const segs = 4;
          const fp: any[] = [];
          for (let s = 0; s <= segs; s++) {
            const tt = s / segs;
            fp.push(baseOff.clone()
              .addScaledVector(dirF, len * tt)
              .addScaledVector(side, Math.sin(tt * 4 + i) * 0.2 * scale)
              .addScaledVector(side2, Math.cos(tt * 3 + i) * 0.15 * scale));
          }
          const fc = new THREE.CatmullRomCurve3(fp);
          const r = (0.04 + Math.random() * 0.04) * scale;
          const col = i % 5 === 0 ? 0xddaa44 : 0x886622;
          const core = new THREE.Mesh(new THREE.TubeGeometry(fc, 16, r, 5, false), fmat(col, 0.9));
          const halo = new THREE.Mesh(new THREE.TubeGeometry(fc, 12, r * 3.2, 5, false), fmat(col, 0.12));
          axonGroup.add(core);
          axonGroup.add(halo);

          const tip = addHalo(fp[segs], (0.6 + Math.random() * 0.8) * scale, col, 0.45);
          pulsers.push({ obj: tip, base: tip.scale.x, amp: 0.4 * scale, freq: 1.5 + Math.random(), phase: Math.random() * 6 });
        }
      }

      const axonLength = 16;
      const ctrlPts = [
        [-8, 0, 0],
        [-4.8, 0.18, 0.1],
        [-1.6, -0.08, -0.1],
        [1.6, 0.1, 0.1],
        [4.8, -0.06, -0.06],
        [8, 0, 0]
      ];

      const bundleInfo = buildBundle(ctrlPts, {
        count: 14,
        radius: 0.14,
        coreR: 0.033,
        turns: 1.6,
        fan: 1.2,
        color: 0x111111
      });

      // Build growth cone on the right tip of the bundle
      buildGrowthCone(bundleInfo.endPt, bundleInfo.endTan, 0.30);

      // 6. Myelin segments distribution
      const segmentCount = Math.max(1, totalSegments);
      const startX = -axonLength / 2 + 1.5;
      const endX = axonLength / 2 - 1.5;
      const stepX = segmentCount > 1 ? (endX - startX) / (segmentCount - 1) : 0;

      const segmentsGroup = new THREE.Group();
      axonGroup.add(segmentsGroup);

      const segmentMeshes: any[] = [];
      const nodeXCoords: number[] = [];

      for (let i = 0; i < segmentCount; i++) {
        const x = startX + i * stepX;
        const isCompleted = i < completedSegments;
        const isJustAdded = isCompleted && i >= completedSegments - justAddedSegments;

        if (isCompleted) {
          const r = 0.44;
          const capsuleLen = stepX * 0.74 || 1.1;
          const halfLen = capsuleLen / 2;

          const matColor = isJustAdded ? 0x86efac : 0x1c4d30;
          const sheathMat = new THREE.MeshPhysicalMaterial({
            color: matColor,
            metalness: 0.18,
            roughness: 0.04,
            transmission: 0.86,
            ior: 1.52,
            clearcoat: 1.0,
            clearcoatRoughness: 0.03,
            emissive: isJustAdded ? 0x22c55e : 0x0e2e1c,
            emissiveIntensity: isJustAdded ? 0.55 : 0.22,
          });

          // Cylinder body
          const sheathGeo = new THREE.CylinderGeometry(r, r, capsuleLen, 28);
          const sheath = new THREE.Mesh(sheathGeo, sheathMat);
          sheath.position.x = x;
          sheath.rotation.z = Math.PI / 2;
          segmentsGroup.add(sheath);
          segmentMeshes.push({ mesh: sheath, index: i, type: 'sheath' });

          // Rounded end caps (hemispheres) — capsule shape like DNA ref
          const capL = new THREE.Mesh(
            new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
            sheathMat
          );
          capL.position.set(x - halfLen, 0, 0);
          capL.rotation.z = Math.PI / 2;
          segmentsGroup.add(capL);

          const capR = new THREE.Mesh(
            new THREE.SphereGeometry(r, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2),
            sheathMat
          );
          capR.position.set(x + halfLen, 0, 0);
          capR.rotation.z = -Math.PI / 2;
          segmentsGroup.add(capR);

          // Specular ring at center
          const wrapGeo = new THREE.TorusGeometry(r + 0.01, 0.022, 8, 36);
          const wrapMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.22,
          });
          const wrap = new THREE.Mesh(wrapGeo, wrapMat);
          wrap.position.x = x;
          wrap.rotation.y = Math.PI / 2;
          segmentsGroup.add(wrap);

        } else {
          // Ghost unmyelinated outline
          const ghostLength = stepX * 0.74 || 1.1;
          const ghostGeo = new THREE.CylinderGeometry(0.40, 0.40, ghostLength, 14, 1, true);
          const ghostMat = new THREE.MeshBasicMaterial({
            color: 0x86efac,
            wireframe: true,
            transparent: true,
            opacity: 0.16,
          });
          const ghost = new THREE.Mesh(ghostGeo, ghostMat);
          ghost.position.x = x;
          ghost.rotation.z = Math.PI / 2;
          segmentsGroup.add(ghost);
          segmentMeshes.push({ mesh: ghost, index: i, type: 'ghost' });
        }

        // Midpoints between segments are Ranvier Nodes
        if (i < segmentCount - 1) {
          const nextX = startX + (i + 1) * stepX;
          const nodeX = (x + nextX) / 2;
          nodeXCoords.push(nodeX);

          // Render a tiny electrical node sphere
          const nodeGeo = new THREE.SphereGeometry(0.20, 14, 14);
          const nodeMat = new THREE.MeshPhysicalMaterial({
            color: 0x3aaa62,
            emissive: 0x1a5e30,
            emissiveIntensity: 0.5,
            roughness: 0.08,
          });
          const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
          nodeMesh.position.set(nodeX, 0, 0);
          segmentsGroup.add(nodeMesh);
        }
      }

      // Add start and end margin points to saltatory sequence
      const allJumpPoints = [startX - 0.5, ...nodeXCoords, endX + 0.5];

      // 7. Jumping electrical impulse (Action Potential)
      const impulseGeo = new THREE.SphereGeometry(0.32, 16, 16);
      const impulseMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
      });
      const impulse = new THREE.Mesh(impulseGeo, impulseMat);
      scene.add(impulse);

      // Halo spark for jump
      const haloGeo = new THREE.SphereGeometry(0.65, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xffb84d,
        transparent: true,
        opacity: 0.45,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      scene.add(halo);

      // 8. Drifting Ions around the active Ranvier nodes
      const ionsGroup = new THREE.Group();
      scene.add(ionsGroup);
      const ions: any[] = [];
      const ionColors = [0xd4af37, 0xdaa520, 0xb8860b];

      for (let k = 0; k < 12; k++) {
        const ionColor = ionColors[k % ionColors.length];
        const ionGeo = new THREE.SphereGeometry(0.06 + Math.random() * 0.05, 8, 8);
        const ionMat = new THREE.MeshBasicMaterial({ color: ionColor, transparent: true, opacity: 0.8 });
        const ion = new THREE.Mesh(ionGeo, ionMat);
        
        // Random placement near axon Nodes
        const spotX = startX + Math.random() * (endX - startX);
        const radius = 0.6 + Math.random() * 1.2;
        const angle = Math.random() * Math.PI * 2;
        ion.position.set(spotX, Math.cos(angle) * radius, Math.sin(angle) * radius);
        
        ionsGroup.add(ion);
        ions.push({
          mesh: ion,
          speed: 1.0 + Math.random() * 2,
          radius,
          angle,
          ox: spotX,
        });
      }

      // 9. Interactive mouse movement following
      let targetRotY = 0;
      let targetRotX = 0;
      let currentMouseX = 0;
      let currentMouseY = 0;

      const handlePointerMove = (e: PointerEvent) => {
        const bounding = container.getBoundingClientRect();
        currentMouseX = ((e.clientX - bounding.left) / bounding.width) * 2 - 1;
        currentMouseY = -((e.clientY - bounding.top) / bounding.height) * 2 + 1;
        targetRotY = currentMouseX * 0.4;
        targetRotX = -currentMouseY * 0.25;
      };

      container.addEventListener('pointermove', handlePointerMove);

      // 10. Animation loop
      let time = 0;
      const tick = () => {
        if (!active) return;
        time += 0.012;

        // Smoothly lerp towards mouse pointer rotations
        axonGroup.rotation.y += (targetRotY - axonGroup.rotation.y) * 0.08;
        axonGroup.rotation.x += (targetRotX - axonGroup.rotation.x) * 0.08;

        // Add ambient breathe oscillation
        axonGroup.rotation.z = Math.sin(time * 0.8) * 0.02;

        // Pulse growth cone parts (pulsers)
        pulsers.forEach((p) => {
          const s = p.base + Math.sin(time * p.freq + p.phase) * p.amp;
          if (p.obj.scale) p.obj.scale.set(s, s, 1);
        });

        // Pulse Myelin sheath gloss
        segmentMeshes.forEach((item) => {
          if (item.type === 'sheath') {
            item.mesh.material.emissiveIntensity = 0.25 + Math.sin(time * 3 + item.index) * 0.18;
            item.mesh.scale.setScalar(1 + Math.sin(time * 2 + item.index) * 0.015);
          }
        });

        // Saltatory Conduction jump animation (jumping node to node)
        // We calculate which jump point we are on based on time cycle
        const loopDuration = 3.6; // seconds
        const tVal = (time % loopDuration) / loopDuration;

        // Map progress along index of jump points
        const jumpSegmentsCount = allJumpPoints.length - 1;
        const progressSegment = tVal * jumpSegmentsCount;
        const currentSegmentIndex = Math.floor(progressSegment);
        const segmentProgress = progressSegment - currentSegmentIndex;

        if (currentSegmentIndex < allJumpPoints.length && currentSegmentIndex >= 0) {
          const ptA = allJumpPoints[currentSegmentIndex];
          const ptB = allJumpPoints[Math.min(currentSegmentIndex + 1, allJumpPoints.length - 1)];

          // Saltatory jump is a parabolic arc:
          // X: linear lerp between node A and B
          // Y: curved bump in the middle matching node junction skipping
          const currentX = ptA + (ptB - ptA) * segmentProgress;
          
          // Only arc high in the skies between jumps
          const distance = Math.abs(ptB - ptA);
          const currentY = distance > 0.4 ? Math.sin(segmentProgress * Math.PI) * 0.62 : 0;
          const currentZ = 0;

          impulse.position.set(currentX, currentY, currentZ);
          halo.position.set(currentX, currentY, currentZ);
          pulseLight.position.set(currentX, currentY, currentZ + 0.5);

          // Intensity spark flash at nodes
          if (segmentProgress < 0.15 || segmentProgress > 0.85) {
            impulse.scale.setScalar(1.3);
            halo.scale.setScalar(1.2);
            pulseLight.intensity = 2.4;
          } else {
            impulse.scale.setScalar(0.9);
            halo.scale.setScalar(0.85);
            pulseLight.intensity = 1.4;
          }
        }

        // Rotate drifting ions
        ions.forEach((ion) => {
          ion.angle += 0.006 * ion.speed;
          ion.mesh.position.y = Math.cos(ion.angle) * ion.radius;
          ion.mesh.position.z = Math.sin(ion.angle) * ion.radius;
          ion.mesh.position.x = ion.ox + Math.sin(time * 0.5 + ion.speed) * 0.2;
        });

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(tick);
      };

      tick();

      // 11. Resize Observer to keep container perfect
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (!active) return;
          const { width: w, height: h } = entry.contentRect;
          if (w > 0 && h > 0) {
            renderer.setSize(w, h);
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
          }
        }
      });
      resizeObserver.observe(container);

    }).catch((err) => {
      console.warn('Could not load three.js dynamically:', err);
    });

    return () => {
      active = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      if (containerRef.current && renderer) {
        containerRef.current.removeEventListener('pointermove', () => {});
        containerRef.current.querySelectorAll('canvas').forEach(c => c.remove());
      }
    };
  }, [totalSegments, completedSegments, justAddedSegments]);

  // Falling back to custom-rendered aesthetic SVG if THREE.js didn't mount yet
  const n = Math.max(totalSegments, 1);
  const centers = Array.from({ length: n }, (_, i) => {
    const startX = 45;
    const endX = 315;
    const step = (endX - startX) / (n - 1 || 1);
    return startX + i * step;
  });
  const rx = n === 6 ? 20 : Math.min(20, (360 - 80) / n * 0.42);
  const ry = n === 6 ? 12 : Math.min(12, rx * 0.6);

  return (
    <div
      ref={containerRef}
      className="w-full h-[220px] relative rounded-2xl overflow-hidden transition-all duration-700"
      style={{
        background: 'radial-gradient(120% 140% at 20% 0%, rgba(30,28,26,0.98) 0%, rgba(18,17,16,0.99) 55%, rgba(10,10,10,1) 100%)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(212,175,55,0.15), inset 0 0 60px rgba(0,0,0,0.5)'
      }}
    >
      {/* 2D Fallback shown ONLY during loading of THREE.js */}
      {!threeLoaded && (
        <div className="absolute inset-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(60% 90% at 50% 55%, rgba(99,193,138,0.10), transparent 70%)',
            }}
          />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 360 150" name="axon-svg" preserveAspectRatio="xMidYMid meet">
            <line x1="20" y1="74" x2="340" y2="74" stroke="rgba(120,160,140,0.25)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="20" y1="74" x2="340" y2="74" stroke="rgba(190,235,210,0.35)" strokeWidth="1.2" strokeLinecap="round" />
            <g style={{ transformOrigin: 'center' }}>
              {centers.map((cx, i) => {
                const isCompleted = i < completedSegments;
                if (!isCompleted) {
                  return (
                    <ellipse
                      key={i}
                      cx={cx}
                      cy="74"
                      rx={rx}
                      ry={ry - 1}
                      fill="none"
                      stroke="rgba(99,193,138,0.18)"
                      strokeWidth="1"
                      strokeDasharray="2 5"
                    />
                  );
                }
                return (
                  <g key={i}>
                    <ellipse cx={cx} cy="75.5" rx={rx} ry={ry} fill="rgba(0,0,0,0.28)" />
                    <ellipse cx={cx} cy="74" rx={rx} ry={ry} fill="rgba(212,175,55,0.3)" />
                    <ellipse cx={cx} cy="74" rx={rx} ry={ry} fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="0.6" />
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      )}

      {/* Info Overlay */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none select-none p-4 z-20">
        <div className="flex items-center gap-2">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#d4af37',
              boxShadow: '0 0 8px rgba(212,175,55,0.8)',
            }}
          />
          <span className="font-mono text-[9px] uppercase tracking-[0.22em]" style={{ color: 'rgba(212,175,55,0.7)' }}>
            Аксон · Миелинизация 3D
          </span>
        </div>
        <div className="flex items-end justify-between">
          <span className="font-mono text-[10px]" style={{ color: 'rgba(212,175,55,0.7)' }}>
            {completedSegments} / {totalSegments} сегментов
          </span>
          <span className="font-mono text-[10px] tracking-wider" style={{ color: 'rgba(212,175,55,0.55)' }}>
            ЦИКЛ {cycleNumber}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AxonProgress;
