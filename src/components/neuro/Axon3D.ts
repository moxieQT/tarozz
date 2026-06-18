import * as THREE from 'three';

export interface Axon3DConfig {
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  color?: number;
  thickness?: number;
  fullBanner?: boolean;
}

export function createAxon(THREE: any, config: Axon3DConfig): THREE.Mesh {
  const {
    startPos,
    endPos,
    color = 0x06b6d4,
    thickness = 0.5,
    fullBanner = true,
  } = config;

  // Create smooth curve for axon
  const curvePoints: THREE.Vector3[] = [startPos];

  if (fullBanner) {
    // Add control points for full banner width
    const midX = (startPos.x + endPos.x) / 2;
    const maxY = Math.max(startPos.y, endPos.y);

    curvePoints.push(
      new THREE.Vector3(startPos.x + (endPos.x - startPos.x) * 0.25, startPos.y + 6, 0),
      new THREE.Vector3(midX, maxY + 8, 0),
      new THREE.Vector3(startPos.x + (endPos.x - startPos.x) * 0.75, endPos.y + 6, 0)
    );
  } else {
    // Simple curve
    const mid = startPos.clone().lerp(endPos, 0.5).add(new THREE.Vector3(0, 2, 0));
    curvePoints.push(mid);
  }

  curvePoints.push(endPos);

  const curve = new THREE.CatmullRomCurve3(curvePoints);

  // Material with glow
  const material = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.5,
    transparent: true,
    opacity: 0.7,
  });

  // Create tube geometry
  const geometry = new THREE.TubeGeometry(
    curve,
    fullBanner ? 40 : 20,
    thickness,
    fullBanner ? 8 : 6,
    false
  );

  return new THREE.Mesh(geometry, material);
}

export function createAxonBundle(
  THREE: any,
  neuronPositions: THREE.Vector3[],
  fullBanner: boolean = true
): THREE.Mesh[] {
  const axons: THREE.Mesh[] = [];

  for (let i = 0; i < neuronPositions.length - 1; i++) {
    const axon = createAxon(THREE, {
      startPos: neuronPositions[i],
      endPos: neuronPositions[i + 1],
      color: 0x06b6d4,
      thickness: fullBanner ? 0.5 : 0.35,
      fullBanner,
    });

    axons.push(axon);
  }

  return axons;
}
