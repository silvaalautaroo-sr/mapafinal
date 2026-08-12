"use client";

import { motion } from "framer-motion";
import { INDUSTRIES, angleToUnitVector } from "@/lib/industries";
import type { IconColorMap } from "@/components/HeatField";

interface IndustryIconsProps {
  /** Stage 2 has started: icons begin appearing one by one. */
  active: boolean;
  /** Shuffled industry ids — the order in which icons reveal. */
  revealOrder: string[];
  /** Radius of the icon ring, as a percentage of the square container. */
  radiusPercent?: number;
  /** Live heat color under each icon (rgba 0-255 + 0-1 alpha), from HeatField. */
  iconColors: IconColorMap;
}

const GAP_SECONDS = 0.165; // 120-180ms cadence between successive reveals
const START_DELAY = 0.15; // small pause after the logo settles

/**
 * Real glassmorphism, not a glowing ring:
 *  - a frosted pane that blurs and saturates whatever heat is behind it
 *  - a diagonal sheen so the pane reads as a physical piece of glass
 *  - a 1px specular highlight on the top edge and a dark drop shadow for depth
 *  - NO coloured border and NO outer glow
 * The heat colour arrives through a low-opacity tint layer inside the pane,
 * so the glass takes on the map's colour without lighting up its edge.
 */
const GLASS_SHEEN =
  "linear-gradient(150deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.035) 45%, rgba(255,255,255,0.012) 100%)";

const GLASS_SHADOW = [
  "inset 0 1px 1px rgba(255,255,255,0.22)", // top specular edge
  "inset 0 -1px 1px rgba(255,255,255,0.05)", // bottom bounce light
  "0 6px 22px rgba(0,0,0,0.45)", // depth — dark, never glowing
].join(", ");

export default function IndustryIcons({
  active,
  revealOrder,
  radiusPercent = 40,
  iconColors,
}: IndustryIconsProps) {
  return (
    <div className="absolute inset-0 z-20">
      {INDUSTRIES.map((industry) => {
        const { x, y } = angleToUnitVector(industry.angleDeg);
        const left = 50 + x * radiusPercent;
        const top = 50 + y * radiusPercent;

        const orderIndex = revealOrder.indexOf(industry.id);
        const delay = START_DELAY + orderIndex * GAP_SECONDS;
        const duration = 0.13 + ((orderIndex * 37) % 5) / 100; // 130-170ms jitter

        // Colour of the heat map currently under this icon.
        const c = iconColors[industry.id];
        const hasHeat = c !== undefined && c[3] > 0.02;
        const tintStrength = hasHeat ? Math.min(0.9, c[3]) : 0;
        const tint = hasHeat
          ? `rgba(${c[0].toFixed(0)}, ${c[1].toFixed(0)}, ${c[2].toFixed(0)}, ${(
              tintStrength * 0.3
            ).toFixed(3)})`
          : "rgba(0,0,0,0)";

        const Icon = industry.Icon;

        return (
          <motion.div
            key={industry.id}
            className="absolute flex items-center justify-center"
            style={{ left: `${left}%`, top: `${top}%` }}
            initial={{ opacity: 0, scale: 0.4, x: -x * 22, y: -y * 22 }}
            animate={
              active
                ? { opacity: 1, scale: 1, x: 0, y: 0 }
                : { opacity: 0, scale: 0.4, x: -x * 22, y: -y * 22 }
            }
            transition={{ duration, delay, ease: "easeOut" }}
          >
            <div
              className="relative -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full sm:h-14 sm:w-14"
              style={{
                background: GLASS_SHEEN,
                boxShadow: GLASS_SHADOW,
                backdropFilter: "blur(14px) saturate(1.6)",
                WebkitBackdropFilter: "blur(14px) saturate(1.6)",
              }}
            >
              {/* Heat tint: the glass adopts the colour of the map beneath it. */}
              <div
                className="pointer-events-none absolute inset-0 rounded-full"
                style={{
                  background: tint,
                  transition: "background 220ms linear",
                }}
                aria-hidden="true"
              />
              <Icon
                className="relative h-5 w-5 text-white/95 sm:h-6 sm:w-6"
                aria-hidden="true"
              />
              <span className="sr-only">{industry.label}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
