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

/** Neutral glass look before the heat map reaches the icon. */
const NEUTRAL_BG = "rgba(255, 255, 255, 0.05)";
const NEUTRAL_BORDER = "rgba(255, 255, 255, 0.10)";

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
        const duration = 0.13 + ((orderIndex * 37) % 5) / 100; // 130-170ms deterministic jitter

        // Color of the heat map currently touching this icon.
        const c = iconColors[industry.id];
        const hasHeat = c && c[3] > 0.02;

        // Glass tint: the icon adopts the map color at low opacity, like
        // frosted glass over a colored light. No bright ring — just a faint
        // edge that also takes the map color.
        const tintA = hasHeat ? Math.min(0.9, c[3]) : 0;
        const bg = hasHeat
          ? `rgba(${c[0].toFixed(0)}, ${c[1].toFixed(0)}, ${c[2].toFixed(0)}, ${(
              0.1 +
              tintA * 0.22
            ).toFixed(3)})`
          : NEUTRAL_BG;
        const border = hasHeat
          ? `rgba(${c[0].toFixed(0)}, ${c[1].toFixed(0)}, ${c[2].toFixed(0)}, ${(
              0.15 +
              tintA * 0.3
            ).toFixed(3)})`
          : NEUTRAL_BORDER;
        // Soft internal glow that matches the map, kept subtle (not a hard ring).
        const glow = hasHeat
          ? `inset 0 0 18px rgba(${c[0].toFixed(0)}, ${c[1].toFixed(
              0
            )}, ${c[2].toFixed(0)}, ${(tintA * 0.35).toFixed(3)})`
          : "inset 0 0 12px rgba(255,255,255,0.03)";

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
              className="relative -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md sm:h-14 sm:w-14"
              style={{
                backgroundColor: bg,
                borderColor: border,
                boxShadow: glow,
                // Ease the tint changes so the color slides in as the map arrives.
                transition:
                  "background-color 220ms linear, border-color 220ms linear, box-shadow 220ms linear",
              }}
            >
              <Icon
                className="h-5 w-5 text-white/90 sm:h-6 sm:w-6"
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
