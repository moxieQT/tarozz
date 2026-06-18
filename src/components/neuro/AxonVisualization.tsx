import React, { useEffect, useRef } from 'react';

interface AxonVisualizationProps {
  neuronCount: number;
  onAxonCreated?: () => void;
}

export function AxonVisualization({ neuronCount, onAxonCreated }: AxonVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || neuronCount < 2) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw axons connecting neurons
    for (let i = 0; i < neuronCount - 1; i++) {
      const startX = (width / neuronCount) * (i + 0.5);
      const startY = height * 0.3;

      const endX = (width / neuronCount) * (i + 1.5);
      const endY = height * 0.7;

      // Control points for smooth curve
      const cpX = width / 2;
      const cpY = height * 0.5;

      // Draw axon with gradient
      const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
      gradient.addColorStop(0, 'rgba(6, 182, 212, 0.8)');
      gradient.addColorStop(0.5, 'rgba(6, 182, 212, 1)');
      gradient.addColorStop(1, 'rgba(6, 182, 212, 0.8)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();

      // Add glow effect
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.stroke();
    }

    onAxonCreated?.();
  }, [neuronCount, onAxonCreated]);

  if (neuronCount < 2) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1, pointerEvents: 'none' }}
    />
  );
}

export default AxonVisualization;
