"use client";

import { useEffect, useRef } from "react";
import { INDUSTRIES, angleToUnitVector } from "@/lib/industries";
import { Noise2D, smoothstep, clamp } from "@/lib/noise";

/** RGB color reported per icon so the icon glass can tint itself. */
export type IconColorMap = Record<string, [number, number, number, number]>;

interface HeatFieldProps {
  /** Timestamp (performance.now) when the expansion (Stage 3) began. Null = not started. */
  startedAt: number | null;
  /** How long the initial expansion takes to reach full radius, in ms. */
  expansionDurationMs?: number;
  /** Icon ring radius, as a fraction of the container half-size (matches IndustryIcons' radiusPercent / 50). */
  ringRadius?: number;
  /** Internal simulation resolution. Lower = faster, blur hides the pixelation. */
  gridSize?: number;
  /**
   * Called (throttled) with the heat color currently under each icon, so the
   * icon glass can adopt the color of the map that touches it. rgba, 0-255.
   */
  onIconColors?: (colors: IconColorMap) => void;
}

// Colormap stops: value 0 (edge, no energy) -> 1 (core, max energy).
// Ordered per the brief: violet edges -> blue -> green -> yellow -> orange -> red core.
const COLOR_STOPS: { t: number; rgb: [number, number, number]; a: number }[] = [
  { t: 0.0, rgb: [0, 0, 0], a: 0.0 },
  { t: 0.14, rgb: [88, 40, 150], a: 0.28 },
  { t: 0.3, rgb: [50, 90, 210], a: 0.5 },
  { t: 0.48, rgb: [46, 175, 120], a: 0.68 },
  { t: 0.64, rgb: [230, 205, 45], a: 0.82 },
  { t: 0.8, rgb: [255, 125, 30], a: 0.92 },
  { t: 1.0, rgb: [255, 45, 25], a: 1.0 },
];

function sampleColor(t: number): [number, number, number, number] {
  const v = clamp(t, 0, 1);
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const a = COLOR_STOPS[i];
    const b = COLOR_STOPS[i + 1];
    if (v >= a.t && v <= b.t) {
      const span = b.t - a.t || 1;
      const f = (v - a.t) / span;
      return [
        a.rgb[0] + (b.rgb[0] - a.rgb[0]) * f,
        a.rgb[1] + (b.rgb[1] - a.rgb[1]) * f,
        a.rgb[2] + (b.rgb[2] - a.rgb[2]) * f,
        a.a + (b.a - a.a) * f,
      ];
    }
  }
  return [255, 45, 25, 1];
}

function easeOutCubic(x: number) {
  return 1 - Math.pow(1 - x, 3);
}

interface Hotspot {
  x: number;
  y: number;
  sigma: number;
  baseIntensity: number;
  priority: boolean;
}

export default function HeatField({
  startedAt,
  expansionDurationMs = 2600,
  ringRadius = 0.8, // 40% (icon radiusPercent) / 50
  gridSize = 72,
  onIconColors,
}: HeatFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const noiseA = useRef(new Noise2D(11));
  const noiseB = useRef(new Noise2D(97));
  const noiseEdge = useRef(new Noise2D(453));
  const lastColorPush = useRef(0);

  const hotspots = useRef<Hotspot[]>(
    (() => {
      const list: Hotspot[] = [
        { x: 0, y: 0, sigma: 0.34, baseIntensity: 1.5, priority: false },
      ];
      for (const industry of INDUSTRIES) {
        const { x, y } = angleToUnitVector(industry.angleDeg);
        list.push({
          x: x * ringRadius,
          y: y * ringRadius,
          sigma: industry.priority ? 0.3 : 0.24,
          baseIntensity: industry.priority ? 0.9 : 0.5,
          priority: industry.priority,
        });
      }
      return list;
    })()
  );

  // Fixed sample positions (one per icon) in the same [-1,1] space as the grid.
  const iconSamples = useRef(
    INDUSTRIES.map((industry) => {
      const { x, y } = angleToUnitVector(industry.angleDeg);
      return { id: industry.id, x: x * ringRadius, y: y * ringRadius };
    })
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    canvas.width = gridSize;
    canvas.height = gridSize;
    const imageData = ctx.createImageData(gridSize, gridSize);
    const data = imageData.data;

    // Shared math: returns the heat "value" (pre-colormap) at a warped point.
    const fieldValue = (
      wx: number,
      wy: number,
      spots: Hotspot[],
      priorityRamp: number
    ) => {
      let value = 0;
      for (const h of spots) {
        const intensity = h.priority
          ? h.baseIntensity + priorityRamp * 0.9
          : h.baseIntensity;
        const dx = wx - h.x;
        const dy = wy - h.y;
        const d2 = dx * dx + dy * dy;
        value += intensity * Math.exp(-d2 / (2 * h.sigma * h.sigma));
      }
      return value;
    };

    const render = (now: number) => {
      rafRef.current = requestAnimationFrame(render);
      if (startedAt === null) return;

      const elapsedMs = now - startedAt;
      const t = elapsedMs / 1000; // seconds, keeps running forever (idle motion)
      const expansionT = clamp(elapsedMs / expansionDurationMs, 0, 1);
      const expansionEase = easeOutCubic(expansionT);

      // Ring radius scaled slightly beyond the icons so the field fully
      // envelops them at full expansion.
      const maxRadius = ringRadius * 1.25;
      const currentRadius = maxRadius * expansionEase;

      // Priority sectors ramp their contribution up as the field matures.
      const priorityRamp = clamp((t - (expansionDurationMs / 1000) * 0.5) / 1.6, 0, 1);

      // --- Persistent idle motion --------------------------------------
      // Global breathing + a very slow radius wobble so the FINAL state is
      // never static — the field keeps expanding/contracting a hair forever.
      const breathe = 0.93 + 0.07 * Math.sin(t * 0.7);
      const idleRadiusWobble = expansionEase * 0.03 * Math.sin(t * 0.45 + 1.3);

      const spots = hotspots.current;
      const nA = noiseA.current;
      const nB = noiseB.current;
      const nEdge = noiseEdge.current;

      // Noise scroll speeds are kept alive at full strength regardless of
      // expansion progress, which is what makes the settled field "breathe".
      let idx = 0;
      for (let j = 0; j < gridSize; j++) {
        const ny = (j / (gridSize - 1)) * 2 - 1;
        for (let i = 0; i < gridSize; i++) {
          const nx = (i / (gridSize - 1)) * 2 - 1;

          // Domain warp: displaces the sampling point with slow-moving noise
          // so the field deforms like a fluid instead of scaling uniformly.
          const warpAmt = 0.17;
          const wx =
            nx + nA.fbm(nx * 1.6 + t * 0.06, ny * 1.6 - t * 0.05, 3) * warpAmt;
          const wy =
            ny + nB.fbm(nx * 1.6 - t * 0.05, ny * 1.6 + t * 0.07, 3) * warpAmt;

          // Organic expanding edge: the boundary itself is noise-perturbed
          // and keeps drifting, so it reads as living ink even when settled.
          const distFromCenter = Math.sqrt(nx * nx + ny * ny);
          const edgeNoise =
            nEdge.fbm(nx * 2.2 + t * 0.14, ny * 2.2 + t * 0.11, 3) * 0.17;
          const localRadius = Math.max(
            0.05,
            currentRadius + edgeNoise + idleRadiusWobble
          );
          const mask =
            1 - smoothstep(localRadius * 0.72, localRadius, distFromCenter);

          if (mask <= 0.001) {
            const p = idx * 4;
            data[p] = 0;
            data[p + 1] = 0;
            data[p + 2] = 0;
            data[p + 3] = 0;
            idx++;
            continue;
          }

          const value = fieldValue(wx, wy, spots, priorityRamp) * mask * breathe;
          const t01 = clamp(value / 1.7, 0, 1);
          const [r, g, b, a] = sampleColor(t01);

          const p = idx * 4;
          data[p] = r;
          data[p + 1] = g;
          data[p + 2] = b;
          data[p + 3] = a * 255 * mask;
          idx++;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // --- Report per-icon colors (throttled to ~12fps) ----------------
      if (onIconColors && now - lastColorPush.current > 80) {
        lastColorPush.current = now;
        const colors: IconColorMap = {};
        for (const s of iconSamples.current) {
          // Warp the icon's own point the same way the grid is warped.
          const wx =
            s.x + nA.fbm(s.x * 1.6 + t * 0.06, s.y * 1.6 - t * 0.05, 3) * 0.17;
          const wy =
            s.y + nB.fbm(s.x * 1.6 - t * 0.05, s.y * 1.6 + t * 0.07, 3) * 0.17;
          const dist = Math.sqrt(s.x * s.x + s.y * s.y);
          const edgeNoise =
            nEdge.fbm(s.x * 2.2 + t * 0.14, s.y * 2.2 + t * 0.11, 3) * 0.17;
          const localRadius = Math.max(
            0.05,
            currentRadius + edgeNoise + idleRadiusWobble
          );
          const mask = 1 - smoothstep(localRadius * 0.72, localRadius, dist);
          const value = fieldValue(wx, wy, spots, priorityRamp) * mask * breathe;
          const t01 = clamp(value / 1.7, 0, 1);
          const [r, g, b] = sampleColor(t01);
          // Alpha here = how strongly the map is touching this icon.
          colors[s.id] = [r, g, b, clamp(mask * (0.35 + t01 * 0.65), 0, 1)];
        }
        onIconColors(colors);
      }
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, expansionDurationMs, gridSize, ringRadius, onIconColors]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-700"
      style={{
        opacity: startedAt !== null ? 1 : 0,
        filter: "blur(22px) saturate(1.15)",
        mixBlendMode: "screen",
      }}
      aria-hidden="true"
    />
  );
}
