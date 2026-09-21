'use client';

import { useEffect, useRef } from 'react';

type Star = {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  phase: number;
  speed: number;
};

const STAR_COLOR = '252, 252, 3';

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;
    const canvasElement = canvas;
    const drawingContext = context;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    let frame = 0;
    let lastFrame = performance.now();

    function makeStar(): Star {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.6 + Math.random() * 1.9,
        opacity: 0.32 + Math.random() * 0.62,
        phase: Math.random() * Math.PI * 2,
        speed: 5 + Math.random() * 18,
      };
    }

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvasElement.width = Math.round(width * pixelRatio);
      canvasElement.height = Math.round(height * pixelRatio);
      canvasElement.style.width = `${width}px`;
      canvasElement.style.height = `${height}px`;
      drawingContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      const starCount = Math.max(100, Math.min(220, Math.round((width * height) / 5400)));
      stars = Array.from({ length: starCount }, makeStar);
    }

    function draw(time: number) {
      const elapsed = Math.min((time - lastFrame) / 1000, 0.05);
      lastFrame = time;
      drawingContext.clearRect(0, 0, width, height);

      for (const star of stars) {
        if (!reduceMotion) {
          star.y -= star.speed * elapsed;
          if (star.y < -4) {
            star.y = height + 4;
            star.x = Math.random() * width;
          }
        }

        const twinkle = reduceMotion ? 1 : 0.72 + Math.sin(time / 850 + star.phase) * 0.28;
        drawingContext.beginPath();
        drawingContext.fillStyle = `rgba(${STAR_COLOR}, ${Math.max(0.06, star.opacity * twinkle)})`;
        drawingContext.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        drawingContext.fill();
      }

      if (!reduceMotion) frame = requestAnimationFrame(draw);
    }

    resize();
    draw(lastFrame);
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}
