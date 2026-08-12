"use client";

import { motion } from "framer-motion";
import { INDUSTRIES, angleToUnitVector } from "@/lib/industries";

interface IndustryIconsProps {
  /** Stage 2 has started: icons begin appearing one by one. */
  active: boolean;
  /** Shuffled industry ids — the order in which icons reveal. */
  revealOrder: string[];
  /** Radius of the icon ring, as a percentage of the square container. */
  radiusPercent?: number;
  /** Once the heat field reaches an icon, its circle brightens slightly. */
  litIds: Set<string>;
}

const GAP_SECONDS = 0.165; // 120-180ms cadence between successive reveals
const START_DELAY = 0.15; // small pause after the logo settles

export default function IndustryIcons({
  active,
  revealOrder,
  radiusPercent = 40,
  litIds,
}: IndustryIconsProps) {
  return (
    <div className="absolute inset-0 z-20">
      {INDUSTRIES.map((industry) => {
        const { x, y } = angleToUnitVector(industry.angleDeg);
        const left = 50 + x * radiusPercent;
        const top = 50 + y * radiusPercent;

        const orderIndex = revealOrder.indexOf(industry.id);
        const delay = START_DELAY + orderIndex * GAP_SECONDS;
        const duration = 0.13 + ((orderIndex * 37) % 5) / 100; // 130-170ms, deterministic jitter

        const lit = litIds.has(industry.id);
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
            <motion.div
              className="relative -translate-x-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full border backdrop-blur-md sm:h-14 sm:w-14"
              animate={{
                borderColor: lit
                  ? "rgba(94, 234, 212, 0.65)"
                  : "rgba(94, 234, 212, 0.35)",
                backgroundColor: lit
                  ? "rgba(45, 212, 207, 0.14)"
                  : "rgba(255, 255, 255, 0.04)",
                boxShadow: lit
                  ? "0 0 22px rgba(45,212,207,0.45)"
                  : "0 0 10px rgba(45,212,207,0.18)",
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <Icon
                className="h-5 w-5 text-white sm:h-6 sm:w-6"
                aria-hidden="true"
              />
              <span className="sr-only">{industry.label}</span>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}
