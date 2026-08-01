"use client";

import { useEffect, useRef } from "react";

import styles from "./WireframeSphere.module.css";

const N_CIRCLES = 80;
const N_POINTS = 120;
const R = 2.0;
const R_MINOR = 1.2;
const BOLD_INTERVAL = 13;
const ELEVATION_BASE = (26 * Math.PI) / 180;
const ELEVATION_SWING = (9 * Math.PI) / 180;

type RGB = [number, number, number];

function hexToRgb(hex: string): RGB {
  const clean = hex.trim().replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function lerp(a: RGB, b: RGB, t: number): RGB {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

interface Circle {
  points: Array<[number, number, number]>;
  bold: boolean;
  color: RGB;
}

function buildCircles(accent: RGB, pale: RGB, navy: RGB): Circle[] {
  const circles: Circle[] = [];
  for (let i = 0; i < N_CIRCLES; i++) {
    const theta = (i / N_CIRCLES) * Math.PI * 2;
    const points: Array<[number, number, number]> = [];
    for (let j = 0; j < N_POINTS; j++) {
      const phi = (j / (N_POINTS - 1)) * Math.PI * 2;
      const rad = R + R_MINOR * Math.cos(phi);
      points.push([
        rad * Math.cos(phi + theta),
        rad * Math.sin(phi + theta),
        R_MINOR * Math.sin(phi),
      ]);
    }
    const ratio = i / N_CIRCLES;
    const bold = i % BOLD_INTERVAL === 0;
    const color = bold ? pale : ratio < 0.5 ? lerp(accent, pale, ratio / 0.5) : lerp(pale, navy, (ratio - 0.5) / 0.5);
    circles.push({ points, bold, color });
  }
  return circles;
}

export function WireframeSphere({ size = 760 }: { size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    function readThemeCircles() {
      const styleDeclaration = getComputedStyle(document.documentElement);
      const readVar = (name: string, fallback: string) => {
        const value = styleDeclaration.getPropertyValue(name).trim();
        return value || fallback;
      };
      const accent = hexToRgb(readVar("--wireframe-accent", "#e2542b"));
      const pale = hexToRgb(readVar("--wireframe-pale", "#f3f0e6"));
      const navy = hexToRgb(readVar("--wireframe-navy", "#4668a0"));
      return buildCircles(accent, pale, navy);
    }

    let circles = readThemeCircles();
    const themeObserver = new MutationObserver(() => {
      circles = readThemeCircles();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const scale = size * 0.15;
    const reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function project(p: [number, number, number], azimuth: number, roll: number, elevation: number) {
      const cosR = Math.cos(roll);
      const sinR = Math.sin(roll);
      const x1 = p[0] * cosR + p[2] * sinR;
      const y1 = p[1];
      const z1 = -p[0] * sinR + p[2] * cosR;

      const cosA = Math.cos(azimuth);
      const sinA = Math.sin(azimuth);
      const x2 = x1 * cosA - y1 * sinA;
      const y2 = x1 * sinA + y1 * cosA;
      const z2 = z1;

      const cosE = Math.cos(elevation);
      const sinE = Math.sin(elevation);
      const y3 = y2 * cosE - z2 * sinE;
      const z3 = y2 * sinE + z2 * cosE;

      return { sx: x2, sy: -z3, depth: y3 };
    }

    function render(azimuth: number, roll: number, elevation: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, size, size);
      ctx.save();
      ctx.translate(size / 2, size / 2);

      for (const circle of circles) {
        const baseAlpha = circle.bold ? 0.85 : 0.4;
        const lineWidth = circle.bold ? 1.4 : 0.7;
        let depthSum = 0;

        ctx.beginPath();
        circle.points.forEach((point, index) => {
          const projected = project(point, azimuth, roll, elevation);
          depthSum += projected.depth;
          const px = projected.sx * scale;
          const py = projected.sy * scale;
          if (index === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });

        const depthT = (depthSum / circle.points.length + (R + R_MINOR)) / (2 * (R + R_MINOR));
        const alpha = baseAlpha * (0.3 + 0.7 * depthT);
        const [r, g, b] = circle.color;

        ctx.strokeStyle = `rgba(${r.toFixed(0)},${g.toFixed(0)},${b.toFixed(0)},${alpha.toFixed(3)})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
      ctx.restore();
    }

    let azimuth = 0.5;
    render(azimuth, 0, ELEVATION_BASE);

    if (reduceMotion) {
      return () => themeObserver.disconnect();
    }

    let rafId: number;
    let lastT: number | null = null;
    let lastFrameT = 0;

    function tick(t: number) {
      if (lastT === null) lastT = t;
      const dt = t - lastT;
      lastT = t;
      azimuth += dt * 0.00013;
      const roll = t * 0.000035;
      const elevation = ELEVATION_BASE + Math.sin(t * 0.00018) * ELEVATION_SWING;

      if (t - lastFrameT > 33) {
        lastFrameT = t;
        render(azimuth, roll, elevation);
      }
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      themeObserver.disconnect();
    };
  }, [size]);

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />;
}
