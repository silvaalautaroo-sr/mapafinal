"use client";

import { motion } from "framer-motion";

interface CenterLogoProps {
  /** Controls the entrance animation (Stage 1: fade + scale 0.8 -> 1, 0.7s). */
  visible: boolean;
  /** Subtle continuous glow once the heat field is active. */
  glowing: boolean;
}

/**
 * Lynx head logo — traced from the reference artwork into a single vector
 * silhouette (facing right, pointed ears, cut-out eye).
 *
 * CENTERING NOTE: the outer wrapper is a plain flex container, NOT a
 * translate-based one. Framer Motion writes an inline `transform` while
 * animating scale, which would override Tailwind's `-translate-x-1/2
 * -translate-y-1/2` and push the logo off-centre. Flex centering is immune
 * to that, so the logo stays exactly on the core.
 */
const OUTER_PATH =
  "M 66 190 L 63.3 185.6 L 57.1 170.3 L 52.9 157 L 50 143.3 L 48.8 132.1 L 48.8 121.4 L 50.4 108.5 L 52.1 101.9 L 56.7 89.8 L 66.2 73.7 L 77.8 59.6 L 108.5 28 L 114.3 19.7 L 118.2 10 L 114.7 58.3 L 114.9 63.1 L 124.5 56 L 134.2 46.7 L 141.7 36.8 L 144.6 30.9 L 142.1 48.4 L 137.5 64.1 L 133 74.5 L 125.1 86.1 L 142.9 106.4 L 142.9 131.3 L 151.2 148.3 L 129 170.5 L 126.1 168.4 L 120.7 166.4 L 114.1 165.5 L 109.1 165.9 L 104.6 167.2 L 99.6 169.7 L 93.4 176.3 L 92.7 174.4 L 93.2 166.6 L 95.6 160.8 L 98.1 157.4 L 90 158.9 L 82.2 163.9 L 75.7 170.7 L 69.9 179.8 L 66 190 Z";

const EYE_PATH =
  "M 136.9 129 L 128.6 128.6 L 124.5 127.4 L 120.3 124.9 L 116 119.7 L 113.5 113.5 L 110.6 108.9 L 122.4 111.2 L 127.4 112.9 L 131.9 115.8 L 134.6 118.9 L 135.9 121.4 L 137.1 126.8 L 136.9 129 Z";

export default function CenterLogo({ visible, glowing }: CenterLogoProps) {
  return (
    <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="flex items-center justify-center"
          animate={
            glowing
              ? {
                  filter: [
                    "drop-shadow(0 0 16px rgba(255,150,80,0.5))",
                    "drop-shadow(0 0 28px rgba(255,150,80,0.85))",
                    "drop-shadow(0 0 16px rgba(255,150,80,0.5))",
                  ],
                }
              : { filter: "drop-shadow(0 0 10px rgba(255,255,255,0.25))" }
          }
          transition={
            glowing
              ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
              : { duration: 0.8 }
          }
        >
          <svg
            className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer silhouette + eye punched out via evenodd = clean edges */}
            <path
              d={`${OUTER_PATH} ${EYE_PATH}`}
              fill="white"
              fillRule="evenodd"
            />
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
