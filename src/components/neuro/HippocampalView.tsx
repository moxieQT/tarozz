import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NeuronTooltip, NeuronTooltipData } from './NeuronTooltip';

export interface Neuron {
  id: string;
  bornAt: string;
  phaseId: number;
  sessionContent: string;
  maturityLevel: number; // 0-4
  x: number; // 0-400 position
  connections: string[];
}

interface HippocampalViewProps {
  neurons: Neuron[];
  onNeuronTap?: (neuron: Neuron) => void;
  phaseNames?: Record<number, string>;
  insightText?: string;
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

const MATURITY_LABELS = [
  'Прогениторная клетка',
  'Ранний нейробласт',
  'Промежуточный нейрон',
  'Зрелая гранулярная клетка',
  'Интегрированный нейрон',
];

// Defined at file level for perfect global scoping
function computeNeuronMaturity(bornAt: string, floor: number): number {
  const days = (Date.now() - new Date(bornAt).getTime()) / 86_400_000;
  return Math.min(4, Math.max(floor, Math.floor(days / 7)));
}

export function HippocampalView({
  neurons,
  onNeuronTap,
  phaseNames = {},
  insightText
}: HippocampalViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const nlTitleRef = useRef<HTMLDivElement>(null);
  const nlMetaRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<Neuron | null>(null);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [tooltipData, setTooltipData] = useState<NeuronTooltipData | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let active = true;
    let animationFrameId: number;
    let resizeObserver: ResizeObserver | null = null;
    let innerCleanup: (() => void) | null = null;

    loadThree().then((THREE) => {
      if (!active || !containerRef.current) return;
      setThreeLoaded(true);

      const container = containerRef.current;
      const labelEl = labelRef.current;
      const nlTitle = nlTitleRef.current;
      const nlMeta = nlMetaRef.current;

      const rect = container.getBoundingClientRect();
      const width = rect.width || 460;
      const height = rect.height || 340;

      // 1. Scene setup
      const scene = new THREE.Scene();

      // 2. Camera setup - matched exactly to the premium template
      const W = () => container.clientWidth || width;
      const H = () => container.clientHeight || height;
      const camera = new THREE.PerspectiveCamera(58, W() / H(), 0.1, 2000);
      const HOME = new THREE.Vector3(0, 0, 64);
      camera.position.copy(HOME);
      camera.lookAt(0, 0, 0);

      // 3. Renderer with transparent background
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(W(), H());

      // Clean old canvases
      container.querySelectorAll('canvas').forEach(c => c.remove());
      container.appendChild(renderer.domElement);

      const graphGroup = new THREE.Group();
      scene.add(graphGroup);

      // Lights - realistic organic coloring of node structures
      scene.add(new THREE.AmbientLight(0x335577, 0.7));
      const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
      keyLight.position.set(0.5, 0.8, 1);
      scene.add(keyLight);

      const rimLight = new THREE.PointLight(0x4488ff, 0.6, 400);
      rimLight.position.set(-60, -30, 40);
      scene.add(rimLight);

      const rand = (a: number, b: number) => a + Math.random() * (b - a);

      // Glow texture helper
      const glowTex = (() => {
        const c = document.createElement('canvas');
        c.width = 128;
        c.height = 128;
        const g = c.getContext('2d')!;
        const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(255,255,255,1)');
        grad.addColorStop(0.3, 'rgba(255,255,255,0.45)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, 128, 128);
        return new THREE.CanvasTexture(c);
      })();

      // Only show background structure when there are enough neurons
      const showBackgroundStructure = neurons.length >= 3;

      let nodes: any[] = [];
      let edges: any[] = [];

      if (showBackgroundStructure) {
        const TYPES = [
          { key: 'neurite', color: 0x2bff6b, name: 'Хаб нейритов', marker: 'β-III тубулин' },
          { key: 'nucleus', color: 0x4d8bff, name: 'Ядро и сателлит', marker: 'DAPI' },
          { key: 'soma',    color: 0xff3b6b, name: 'Тело клетки (Сома)', marker: 'MAP2' },
        ];

        const RANGE = 44;
        const DEPTH = 14;

        // ---- Generate biological structural culture nodes ----
        const NN = 17;
        const MIND = 15;
        let guard = 0;
        while (nodes.length < NN && guard < 6000) {
          guard++;
          const ang = Math.random() * Math.PI * 2;
          const r = Math.pow(Math.random(), 0.7) * RANGE;
          const p = new THREE.Vector3(Math.cos(ang) * r * 1.12, Math.sin(ang) * r * 0.82, rand(-DEPTH, DEPTH));
          if (nodes.every(n => n.pos.distanceTo(p) > MIND)) {
            const t = TYPES[Math.floor(Math.random() * TYPES.length)];
            nodes.push({
              pos: p,
              type: t,
              degree: 0,
              cells: Math.floor(rand(2, 12))
            });
          }
        }

        // ---- Connect edges (nearest neighbors) ----
        const seen = new Set<string>();
        nodes.forEach((n, i) => {
          const near = nodes
            .map((m, j) => ({ j, d: n.pos.distanceTo(m.pos) }))
            .filter(o => o.j !== i)
            .sort((a, b) => a.d - b.d)
            .slice(0, 2);

          near.forEach(o => {
            const k = i < o.j ? `${i}-${o.j}` : `${o.j}-${i}`;
            if (!seen.has(k)) {
              seen.add(k);
              edges.push({ a: i, b: o.j });
              nodes[i].degree++;
              nodes[o.j].degree++;
            }
          });
        });

        // ---- Build connection pathways (Tubes) ----
        edges.forEach(e => {
          const A = nodes[e.a].pos;
          const B = nodes[e.b].pos;
          const mid = A.clone().lerp(B, 0.5).add(new THREE.Vector3(rand(-4, 4), rand(-4, 4), rand(-4, 4)));
          const curve = new THREE.CatmullRomCurve3([A, A.clone().lerp(mid, 0.5), mid, mid.clone().lerp(B, 0.5), B]);
          const mat = new THREE.MeshStandardMaterial({
            color: 0x2bff6b,
            emissive: 0x1f8f44,
            emissiveIntensity: 0.5,
            roughness: 0.6,
            transparent: true,
            opacity: 0.32
          });
          const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.18, 6, false), mat);
          graphGroup.add(tube);
          e.mat = mat;
          e.baseOp = 0.32;
          e.targetOp = 0.32;
        });

        // ---- Build node graphics (Cores + Soft Halos) ----
        nodes.forEach((n, i) => {
          const size = 1.6 + n.degree * 0.55 + (n.type.key === 'neurite' ? 1.2 : 0);
          n.size = size;

          const coreMat = new THREE.MeshStandardMaterial({
            color: n.type.color,
            emissive: n.type.color,
            emissiveIntensity: 0.55,
            roughness: 0.35,
            metalness: 0.0
          });
          const core = new THREE.Mesh(new THREE.SphereGeometry(size, 28, 28), coreMat);
          core.position.copy(n.pos);
          core.userData = { nodeIndex: i, isUserNeuron: false };
          graphGroup.add(core);

          const haloMat = new THREE.SpriteMaterial({
            map: glowTex,
            color: n.type.color,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            depthTest: true
          });
          const halo = new THREE.Sprite(haloMat);
          halo.position.copy(n.pos);
          halo.scale.set(size * 3.4, size * 3.4, 1);
          graphGroup.add(halo);

          n.core = core;
          n.coreMat = coreMat;
          n.halo = halo;
          n.haloMat = haloMat;
          n.baseEmiss = 0.55;
          n.baseHaloOp = 0.5;
          n.baseHaloScale = size * 3.4;
          n.targetEmiss = 0.55;
          n.targetHaloOp = 0.5;
          n.targetHaloScale = size * 3.4;
          n.phase = Math.random() * 6;
        });

        // ---- Extra scattering of micro debris for atmosphere ----
        for (let i = 0; i < 16; i++) {
          const p = new THREE.Vector3(rand(-RANGE, RANGE), rand(-RANGE * 0.8, RANGE * 0.8), rand(-DEPTH, DEPTH));
          const m = new THREE.SpriteMaterial({
            map: glowTex,
            color: 0x6fc0ff,
            transparent: true,
            opacity: 0.18,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });
          const s = new THREE.Sprite(m);
          s.position.copy(p);
          s.scale.set(rand(0.6, 1.4), rand(0.6, 1.4), 1);
          graphGroup.add(s);
        }
      }

      // ---- Setup interactive User Active Neurons ----
      const userNeuronTargets: any[] = [];
      const userNeuronsGroup = new THREE.Group();
      graphGroup.add(userNeuronsGroup);

      const pulsers: any[] = [];
      const userNeuronPositions: any[] = [];

      neurons.forEach((un, idx) => {
        const maturity = computeNeuronMaturity(un.bornAt, un.maturityLevel);

        // Position neurons in a line/arc when background is hidden
        let pos: any;
        if (showBackgroundStructure && nodes.length > 0) {
          const baseNode = nodes[idx % nodes.length];
          pos = baseNode.pos.clone().add(new THREE.Vector3(
            rand(-3.2, 3.2),
            rand(-3.2, 3.2),
            rand(-2.4, 2.4)
          ));
        } else {
          // Simple line formation when few neurons
          const angle = (idx / Math.max(neurons.length - 1, 1)) * Math.PI * 0.5 - Math.PI * 0.25;
          const radius = 8 + idx * 4;
          pos = new THREE.Vector3(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius * 0.6,
            0
          );
        }

        userNeuronPositions.push(pos.clone());

        const nodeGroup = new THREE.Group();
        nodeGroup.position.copy(pos);

        // Render user neurons as vibrant colors based on maturity
        const size = [2.2, 3.0, 4.2, 5.2, 6.0][maturity];
        const color = [0xd946ef, 0x06b6d4, 0x10b981, 0x22c55e, 0xec4899][maturity];

        // Active highlighted halo
        const haloMat = new THREE.SpriteMaterial({
          map: glowTex,
          color: color,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          depthTest: true
        });
        const halo = new THREE.Sprite(haloMat);
        halo.scale.set(size * 1.5, size * 1.5, 1);
        nodeGroup.add(halo);
        pulsers.push({ obj: halo, base: size * 1.5, amp: size * 0.35, freq: 2.2, phase: idx });

        // Glowing nucleus
        const nuc = new THREE.Sprite(new THREE.SpriteMaterial({
          map: glowTex,
          color: 0xffffff,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        }));
        nuc.position.set(rand(-0.4, 0.4), rand(-0.4, 0.4), 0.3);
        nuc.scale.set(size * 0.7, size * 0.7, 1);
        nodeGroup.add(nuc);

        // Highlight ring torus for mature active integration
        if (maturity >= 3) {
          const torusSize = size * 0.9;
          const torusGeo = new THREE.TorusGeometry(torusSize, 0.16, 8, 32);
          const torusMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
          const torusMesh = new THREE.Mesh(torusGeo, torusMat);
          nodeGroup.add(torusMesh);
          pulsers.push({ obj: torusMesh, base: 1.0, amp: 0.22, freq: 2.8, phase: idx });
        }

        // Invisible raycasting hit sphere (balanced hitbox bounds)
        const hitGeo = new THREE.SphereGeometry(Math.max(5.0, size + 2.5), 12, 12);
        const hitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, visible: false });
        const hitTarget = new THREE.Mesh(hitGeo, hitMat);
        hitTarget.userData = { neuron: un, maturity, isUserNeuron: true, idx };
        nodeGroup.add(hitTarget);
        userNeuronTargets.push(hitTarget);

        userNeuronsGroup.add(nodeGroup);
      });

      // Draw axon connections between sequential user neurons across the full width
      if (userNeuronPositions.length > 1 && !showBackgroundStructure) {
        for (let i = 0; i < userNeuronPositions.length - 1; i++) {
          const startPos = userNeuronPositions[i];
          const endPos = userNeuronPositions[i + 1];

          // Create a smooth curve that spans across the banner
          const midX = (startPos.x + endPos.x) / 2;
          const curvePoints = [
            startPos,
            new THREE.Vector3(startPos.x + (endPos.x - startPos.x) * 0.25, startPos.y + 6, 0),
            new THREE.Vector3(midX, Math.max(startPos.y, endPos.y) + 8, 0),
            new THREE.Vector3(startPos.x + (endPos.x - startPos.x) * 0.75, endPos.y + 6, 0),
            endPos
          ];

          const curve = new THREE.CatmullRomCurve3(curvePoints);
          const axonMat = new THREE.MeshStandardMaterial({
            color: 0x06b6d4,
            emissive: 0x06b6d4,
            emissiveIntensity: 0.5,
            transparent: true,
            opacity: 0.7
          });
          const axon = new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.5, 8, false), axonMat);
          graphGroup.add(axon);
        }
      }

      // 9. Hover raycast, mouse dragging, scrolling and coordinate projection
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();
      const tmpV = new THREE.Vector3();
      const coreMeshes = nodes.map(n => n.core);

      let hoveredNodeIndex = -1;
      let hoveredUserNeuron: any = null;

      let isDragging = false;
      const rot = { x: 0.05, y: 0 };
      const target = { x: 0.05, y: 0 };
      let last = { x: 0, y: 0 };
      let targetCameraZ = 64;

      const setHoverState = (nodeIdx: number, userNeuronHit: any, mouseX?: number, mouseY?: number) => {
        hoveredNodeIndex = nodeIdx;
        hoveredUserNeuron = userNeuronHit;

        // Reset and highlight paths organically based on hover
        if (nodeIdx >= 0) {
          if (labelEl && nlTitle && nlMeta) {
            const n = nodes[nodeIdx];
            nlTitle.textContent = `${n.type.name} · #${nodeIdx + 1}`;
            nlMeta.textContent = `${n.type.marker} · ${n.cells} клеток · ${n.degree} связей`;
            labelEl.style.display = 'block';
          }
          container.style.cursor = 'pointer';
          setTooltipData(null);

          const neighbours = new Set<number>([nodeIdx]);
          edges.forEach(e => {
            const on = e.a === nodeIdx || e.b === nodeIdx;
            e.targetOp = on ? 0.85 : 0.06;
            if (on) {
              neighbours.add(e.a);
              neighbours.add(e.b);
            }
          });

          nodes.forEach((n, i) => {
            const focus = neighbours.has(i);
            n.targetEmiss = focus ? (i === nodeIdx ? 1.4 : 0.8) : 0.12;
            n.targetHaloOp = focus ? (i === nodeIdx ? 0.95 : 0.55) : 0.06;
            n.targetHaloScale = n.baseHaloScale * (i === nodeIdx ? 1.45 : (focus ? 1.1 : 0.9));
          });
        } else if (userNeuronHit) {
          const { neuron, maturity } = userNeuronHit.userData;
          if (labelEl && nlTitle && nlMeta) {
            nlTitle.textContent = `Активный нейрон · Этап ${neuron.phaseId + 1}`;
            nlMeta.textContent = `${MATURITY_LABELS[maturity]} · Нажмите для просмотра`;
            labelEl.style.display = 'block';
          }
          container.style.cursor = 'pointer';

          // Show tooltip for user neuron
          if (mouseX !== undefined && mouseY !== undefined) {
            const days = Math.floor((Date.now() - new Date(neuron.bornAt).getTime()) / (1000 * 60 * 60 * 24));
            const tooltipInfo: NeuronTooltipData = {
              bornAt: neuron.bornAt,
              phaseName: phaseNames[neuron.phaseId] || `Фаза ${neuron.phaseId + 1}`,
              days,
              maturityStage: MATURITY_LABELS[maturity],
            };
            setTooltipData(tooltipInfo);
            setTooltipPos({ x: mouseX, y: mouseY });
          }

          // Dim structural network slightly to make active user neuron pop
          nodes.forEach(n => {
            n.targetEmiss = 0.15;
            n.targetHaloOp = 0.15;
            n.targetHaloScale = n.baseHaloScale * 0.85;
          });
          edges.forEach(e => {
            e.targetOp = 0.08;
          });
        } else {
          if (labelEl) labelEl.style.display = 'none';
          container.style.cursor = isDragging ? 'grabbing' : 'grab';
          setTooltipData(null);

          // Reset all path and node highlights to default levels
          nodes.forEach(n => {
            n.targetEmiss = n.baseEmiss;
            n.targetHaloOp = n.baseHaloOp;
            n.targetHaloScale = n.baseHaloScale;
          });
          edges.forEach(e => {
            e.targetOp = e.baseOp;
          });
        }
      };

      const handlePointerDown = (e: PointerEvent) => {
        isDragging = true;
        last = { x: e.clientX, y: e.clientY };
        container.style.cursor = 'grabbing';
      };

      const handlePointerMove = (e: PointerEvent) => {
        const bounding = container.getBoundingClientRect();
        pointer.x = ((e.clientX - bounding.left) / bounding.width) * 2 - 1;
        pointer.y = -((e.clientY - bounding.top) / bounding.height) * 2 + 1;

        if (isDragging) {
          target.y += (e.clientX - last.x) * 0.006;
          target.x += (e.clientY - last.y) * 0.006;
          target.x = Math.max(-1.2, Math.min(1.2, target.x));
          last = { x: e.clientX, y: e.clientY };
          return;
        }

        // Raycasting check for both base nodes and active user neurons
        raycaster.setFromCamera(pointer, camera);

        // 1. Check user neurons first
        const userHits = raycaster.intersectObjects(userNeuronTargets, true);
        if (userHits.length > 0) {
          const matchedTarget = userHits[0].object;
          if (matchedTarget !== hoveredUserNeuron) {
            setHoverState(-1, matchedTarget, e.clientX, e.clientY);
          }
          return;
        }

        // 2. Check base structure core meshes
        const structureHits = raycaster.intersectObjects(coreMeshes, false);
        if (structureHits.length > 0) {
          const idx = structureHits[0].object.userData.nodeIndex;
          if (idx !== hoveredNodeIndex) {
            setHoverState(idx, null);
          }
          return;
        }

        // No hits
        if (hoveredNodeIndex !== -1 || hoveredUserNeuron !== null) {
          setHoverState(-1, null);
        }
      };

      const handlePointerUp = (e: PointerEvent) => {
        isDragging = false;
        container.style.cursor = hoveredNodeIndex >= 0 || hoveredUserNeuron ? 'pointer' : 'grab';

        const bounding = container.getBoundingClientRect();
        const clickX = ((e.clientX - bounding.left) / bounding.width) * 2 - 1;
        const clickY = -((e.clientY - bounding.top) / bounding.height) * 2 + 1;

        raycaster.setFromCamera({ x: clickX, y: clickY }, camera);
        const userHits = raycaster.intersectObjects(userNeuronTargets, true);

        if (active && userHits.length > 0) {
          const matchedTarget = userHits[0].object;
          const { neuron, maturity } = matchedTarget.userData;
          const enriched = { ...neuron, maturityLevel: maturity };
          setSelected(prev => (prev?.id === enriched.id ? null : enriched));
          onNeuronTap?.(enriched);
        }
      };

      const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        targetCameraZ += e.deltaY * 0.05;
        targetCameraZ = Math.min(130, Math.max(26, targetCameraZ));
      };

      const handleResetKey = (e: KeyboardEvent) => {
        if (e.code === 'KeyR' || e.code === 'KeyH') {
          targetCameraZ = 64;
          target.x = 0.05;
          target.y = 0;
          setHoverState(-1, null);
        }
      };

      container.addEventListener('pointerdown', handlePointerDown);
      container.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      container.addEventListener('wheel', handleWheel, { passive: false });
      window.addEventListener('keydown', handleResetKey);

      innerCleanup = () => {
        container.removeEventListener('pointerdown', handlePointerDown);
        container.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
        container.removeEventListener('wheel', handleWheel);
        window.removeEventListener('keydown', handleResetKey);
        
        graphGroup.traverse((obj: any) => {
          if (obj.geometry) {
            obj.geometry.dispose();
          }
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((mat) => mat.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
        
        renderer.dispose();
      };

      // 10. Animation Tick loop
      let time = 0;
      const tick = () => {
        if (!active) return;
        time += 0.016;

        // Auto spin if not active dragging and nothing is hovered
        if (!isDragging && hoveredNodeIndex < 0 && !hoveredUserNeuron) {
          target.y += 0.0011;
        }

        // Apply smooth positions zoom & rotate
        rot.x += (target.x - rot.x) * 0.08;
        rot.y += (target.y - rot.y) * 0.08;
        graphGroup.rotation.x = rot.x;
        graphGroup.rotation.y = rot.y;
        camera.position.z += (targetCameraZ - camera.position.z) * 0.08;

        // Animate material transition factors
        nodes.forEach(n => {
          n.coreMat.emissiveIntensity += (n.targetEmiss - n.coreMat.emissiveIntensity) * 0.12;
          n.haloMat.opacity += (n.targetHaloOp - n.haloMat.opacity) * 0.12;
          const pulsing = 1 + Math.sin(time * 1.1 + n.phase) * 0.04;
          const ts = n.targetHaloScale * pulsing;
          const currentScale = n.halo.scale.x + (ts - n.halo.scale.x) * 0.12;
          n.halo.scale.set(currentScale, currentScale, 1);
        });

        edges.forEach(e => {
          e.mat.opacity += (e.targetOp - e.mat.opacity) * 0.12;
        });

        // Pulsers state scaling updates
        pulsers.forEach(p => {
          const s = p.base + Math.sin(time * p.freq + p.phase) * p.amp;
          if (p.obj.scale) {
            p.obj.scale.set(s, s, 1);
          }
        });

        // Slow hover coordinates animation
        userNeuronsGroup.children.forEach((unG, i) => {
          unG.position.y += Math.sin(time * 2 + i) * 0.005;
        });

        // Floating dynamic projected label position
        if (labelEl) {
          if (hoveredNodeIndex >= 0 && nodes[hoveredNodeIndex]) {
            nodes[hoveredNodeIndex].core.getWorldPosition(tmpV);
            tmpV.project(camera);
            labelEl.style.left = `${((tmpV.x * 0.5 + 0.5) * W())}px`;
            labelEl.style.top = `${((-tmpV.y * 0.5 + 0.5) * H())}px`;
          } else if (hoveredUserNeuron) {
            hoveredUserNeuron.getWorldPosition(tmpV);
            tmpV.project(camera);
            labelEl.style.left = `${((tmpV.x * 0.5 + 0.5) * W())}px`;
            labelEl.style.top = `${((-tmpV.y * 0.5 + 0.5) * H())}px`;
          }
        }

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(tick);
      };

      tick();

      // 11. Observation of resizing container
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
      console.warn('Could not launch Three.js loader:', err);
    });

    return () => {
      active = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      if (innerCleanup) innerCleanup();
    };
  }, [neurons]);

  const isEmpty = neurons.length === 0;

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="w-full h-[360px] rounded-2xl overflow-hidden relative select-none cursor-grab active:cursor-grabbing"
        style={{
          background: 'radial-gradient(circle at 50% 40%, #0a0e14 0%, #05070b 60%, #000 100%)',
          boxShadow: '0 16px 40px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.06), inset 0 0 70px rgba(0,0,0,0.5)'
        }}
      >
        {/* Living tissue backdrop dots shown before THREE.js elements */}
        {!threeLoaded && (
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 opacity-[0.025]"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(99,193,138,0.5) 1px, transparent 1px)',
                backgroundSize: '28px 28px'
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(50% 60% at 50% 70%, rgba(99,193,138,0.08), transparent 75%)',
              }}
            />
          </div>
        )}

        {/* Labels Map overlay */}
        <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none select-none p-4 z-10">
          <div className="flex items-center gap-2">
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                background: '#36ff6b',
                boxShadow: '0 0 8px #36ff6b',
              }}
            />
            <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#5aff8c]" style={{ color: '#5aff8c' }}>
              TAROZZ · NEURO 3D · Культура нейронов
            </span>
          </div>

          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[8.5px] uppercase tracking-[0.12em] bg-black/30 backdrop-blur-md p-2 rounded-xl border border-white/5 w-fit pointer-events-auto"
            style={{ color: 'rgba(150,220,185,0.7)' }}
          >
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#2bff6b', boxShadow: '0 0 6px #2bff6b' }} />
              Нейриты · β-III тубулин
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#4d8bff', boxShadow: '0 0 6px #4d8bff' }} />
              Ядра · DAPI
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#ff3b6b', boxShadow: '0 0 6px #ff3b6b' }} />
              Сома · MAP2
            </span>
            <span className="flex items-center gap-1.5 animate-pulse">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{
                  background: '#ff00ee',
                  boxShadow: '0 0 8px #ff00ee'
                }}
              />
              Ваши активные нейроны
            </span>
          </div>
        </div>

        {/* Floating Node Label */}
        <div 
          ref={labelRef}
          style={{
            position: 'absolute',
            zIndex: 50,
            display: 'none',
            pointerEvents: 'none',
            transform: 'translate(-50%, calc(-100% - 16px))',
            padding: '10px 14px',
            background: 'rgba(8,10,14,0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '10px',
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 28px rgba(0,0,0,0.6)',
          }}
        >
          <div ref={nlTitleRef} className="font-sans font-semibold text-xs text-white mb-0.5" />
          <div ref={nlMetaRef} className="font-mono text-[9px] text-[#9aa0aa] tracking-wider" />
        </div>

        {/* Empty state bottom line */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <p
              className="font-mono text-[11px] text-center max-w-[240px] leading-relaxed px-4 py-2 rounded-xl backdrop-blur-md"
              style={{
                color: 'rgba(150,220,185,0.55)',
                background: 'rgba(5, 14, 10,0.6)',
                border: '1px solid rgba(150,220,185,0.1)'
              }}
            >
              Первый нейрон родится после вашей первой сессии
            </p>
          </div>
        )}

        {/* Control hint overlay */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10 select-none">
          <span className="font-mono text-[8px] text-gray-400 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 uppercase tracking-widest leading-none">
            R — сброс камеры
          </span>
          <span className="font-mono text-[8px] text-gray-400 bg-black/60 px-2.5 py-1 rounded-lg border border-white/10 uppercase tracking-widest leading-none">
            Drag — вращение
          </span>
        </div>
      </div>

      {/* Neuron Tooltip */}
      <NeuronTooltip
        data={tooltipData || {
          bornAt: '',
          phaseName: '',
          days: 0,
          maturityStage: '',
        }}
        isVisible={tooltipData !== null}
        x={tooltipPos.x}
        y={tooltipPos.y}
      />

      {/* Detail Bottom Sheet for selected logged memories */}
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
              <div className="w-8 h-1 rounded-full mx-auto mb-4" style={{ background: 'var(--placeholder)' }} />

              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--ink3)' }}>
                  {new Date(selected.bornAt).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
                {phaseNames[selected.phaseId] && (
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--ink3)' }}>
                    {phaseNames[selected.phaseId]}
                  </span>
                )}
              </div>

              <p className="text-[14px] font-serif italic leading-relaxed mb-4" style={{ color: 'var(--ink)' }}>
                {selected.sessionContent}
              </p>

              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'var(--sunken)', border: '1px solid var(--border)' }}
              >
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--accent-ink)' }} />
                <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--ink3)' }}>
                  {MATURITY_LABELS[computeNeuronMaturity(selected.bornAt, selected.maturityLevel)]}
                </span>
              </div>

              {insightText && (
                <>
                  <div className="h-px w-full my-4" style={{ background: 'var(--border)' }} />
                  <p className="text-[13px] leading-relaxed font-mono" style={{ color: 'var(--ink2)' }}>
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

