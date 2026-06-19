import * as THREE from 'three';

/* ──────────────────────────────────────────────────────────────────────────
   Shared frosted-glass material toolkit.
   Both AxonProgress and HippocampalView use the same procedural normal /
   roughness maps and the same environment gradient, so the whole app reads as
   one material world (the reference: green-tinted crystalline glass).
   ────────────────────────────────────────────────────────────────────────── */

export interface FrostedMaps {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

export function makeFrostedMaps(size = 256, repeatX = 2, repeatY = 1): FrostedMaps {
  const height = new Float32Array(size * size);
  const idx = (x: number, y: number) => {
    const xx = ((x % size) + size) % size;
    const yy = ((y % size) + size) % size;
    return yy * size + xx;
  };

  // 1. Multi-octave warble — hand-poured glass unevenness.
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const v =
        Math.sin(x * 0.05 + Math.sin(y * 0.03) * 2) * 0.5 +
        Math.sin(y * 0.045 + Math.cos(x * 0.02) * 2) * 0.5 +
        Math.sin(x * 0.14 + y * 0.11) * 0.22 +
        Math.sin(x * 0.27 - y * 0.19) * 0.12;
      height[idx(x, y)] += v * 0.55;
    }
  }

  // 2. Cracks — meandering grooves with occasional branches.
  const branch = (sx: number, sy: number, ang0: number) => {
    let px = sx;
    let py = sy;
    let ang = ang0;
    const steps = 12 + Math.floor(Math.random() * 18);
    for (let s = 0; s < steps; s++) {
      ang += (Math.random() - 0.5) * 0.7;
      px += Math.cos(ang) * 1.4;
      py += Math.sin(ang) * 1.4;
      height[idx(Math.round(px), Math.round(py))] -= 0.5 * (1 - s / steps);
    }
  };

  for (let c = 0; c < 26; c++) {
    let px = Math.random() * size;
    let py = Math.random() * size;
    let ang = Math.random() * Math.PI * 2;
    const steps = 40 + Math.floor(Math.random() * 60);
    const depth = 0.6 + Math.random() * 0.9;
    for (let s = 0; s < steps; s++) {
      ang += (Math.random() - 0.5) * 0.6;
      px += Math.cos(ang) * 1.6;
      py += Math.sin(ang) * 1.6;
      const fade = 1 - s / steps;
      const r = 1.4 * fade + 0.4;
      const ir = Math.ceil(r);
      for (let oy = -ir; oy <= ir; oy++) {
        for (let ox = -ir; ox <= ir; ox++) {
          const d = Math.sqrt(ox * ox + oy * oy);
          if (d > r) continue;
          height[idx(Math.round(px) + ox, Math.round(py) + oy)] -=
            depth * (1 - d / r) * fade;
        }
      }
      if (Math.random() < 0.04) branch(px, py, ang + (Math.random() - 0.5));
    }
  }

  // 3. Trapped bubbles — small raised / sunken lenses.
  for (let b = 0; b < 70; b++) {
    const bx = Math.random() * size;
    const by = Math.random() * size;
    const br = 1.5 + Math.random() * 4;
    const sign = Math.random() < 0.5 ? 1 : -1;
    const ir = Math.ceil(br);
    for (let oy = -ir; oy <= ir; oy++) {
      for (let ox = -ir; ox <= ir; ox++) {
        const d = Math.sqrt(ox * ox + oy * oy);
        if (d > br) continue;
        const lens = Math.cos((d / br) * Math.PI * 0.5);
        height[idx(Math.round(bx) + ox, Math.round(by) + oy)] += sign * lens * 0.8;
      }
    }
  }

  const normalCanvas = document.createElement('canvas');
  normalCanvas.width = normalCanvas.height = size;
  const nctx = normalCanvas.getContext('2d')!;
  const nImg = nctx.createImageData(size, size);

  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = roughCanvas.height = size;
  const rctx = roughCanvas.getContext('2d')!;
  const rImg = rctx.createImageData(size, size);

  const strength = 3.4;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const hL = height[idx(x - 1, y)];
      const hR = height[idx(x + 1, y)];
      const hD = height[idx(x, y - 1)];
      const hU = height[idx(x, y + 1)];
      const nx = (hL - hR) * strength;
      const ny = (hD - hU) * strength;
      const nz = 1;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
      const o = (y * size + x) * 4;
      nImg.data[o] = ((nx / len) * 0.5 + 0.5) * 255;
      nImg.data[o + 1] = ((ny / len) * 0.5 + 0.5) * 255;
      nImg.data[o + 2] = ((nz / len) * 0.5 + 0.5) * 255;
      nImg.data[o + 3] = 255;

      const h = height[idx(x, y)];
      const slope = Math.min(1, Math.abs(nx) + Math.abs(ny));
      const rough = 0.5 + slope * 0.35 - Math.max(0, -h) * 0.12;
      const rv = Math.max(0.12, Math.min(0.95, rough)) * 255;
      rImg.data[o] = rv;
      rImg.data[o + 1] = rv;
      rImg.data[o + 2] = rv;
      rImg.data[o + 3] = 255;
    }
  }
  nctx.putImageData(nImg, 0, 0);
  rctx.putImageData(rImg, 0, 0);

  const normalMap = new THREE.CanvasTexture(normalCanvas);
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  for (const tex of [normalMap, roughnessMap]) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
  }
  return { normalMap, roughnessMap };
}

export function makeEnvTexture(dark: boolean): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const grad = g.createLinearGradient(0, 0, 0, 128);
  if (dark) {
    grad.addColorStop(0, '#2a4a36');
    grad.addColorStop(0.45, '#16301f');
    grad.addColorStop(1, '#070f0a');
  } else {
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, '#e7efe9');
    grad.addColorStop(1, '#b8c9bd');
  }
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  g.globalAlpha = dark ? 0.4 : 0.7;
  g.fillStyle = '#ffffff';
  g.beginPath();
  g.ellipse(40, 28, 26, 14, 0, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(96, 90, 18, 10, 0, 0, Math.PI * 2);
  g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  return tex;
}

export function readDarkTheme(): boolean {
  if (typeof document === 'undefined') return true;
  return document.documentElement.getAttribute('data-theme') === 'dark';
}
