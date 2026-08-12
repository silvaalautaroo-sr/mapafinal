"use client";

import { motion } from "framer-motion";

interface CenterLogoProps {
  /** Controls the entrance animation (Stage 1: fade + scale 0.8 -> 1, 0.7s). */
  visible: boolean;
  /** Subtle continuous glow once the heat field is active. */
  glowing: boolean;
}

/**
 * Stylized lynx head, redrawn as a single vector path so it renders crisply
 * at any size with no raster asset. White, simple, matches the reference
 * silhouette (pointed ears, angular jaw, cut-out eye).
 */
export default function CenterLogo({ visible, glowing }: CenterLogoProps) {
  return (
    <motion.div
      className="pointer-events-none absolute left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="relative flex items-center justify-center"
        animate={
          glowing
            ? { filter: ["drop-shadow(0 0 18px rgba(255,90,40,0.55))", "drop-shadow(0 0 28px rgba(255,90,40,0.85))", "drop-shadow(0 0 18px rgba(255,90,40,0.55))"] }
            : { filter: "drop-shadow(0 0 10px rgba(45,212,207,0.35))" }
        }
        transition={
          glowing
            ? { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.8 }
        }
      >
        <svg
          className="h-14 w-14 sm:h-20 sm:w-20 lg:h-24 lg:w-24"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 18
               C 92 18 86 32 84 46
               C 78 40 66 26 54 22
               C 56 40 62 56 68 66
               C 50 62 32 66 20 78
               C 36 82 52 84 64 82
               C 48 92 36 108 34 128
               C 52 122 68 112 78 100
               C 74 116 76 136 86 152
               C 96 138 100 122 100 106
               C 100 122 104 138 114 152
               C 124 136 126 116 122 100
               C 132 112 148 122 166 128
               C 164 108 152 92 136 82
               C 148 84 164 82 180 78
               C 168 66 150 62 132 66
               C 138 56 144 40 146 22
               C 134 26 122 40 116 46
               C 114 32 108 18 100 18 Z"
            fill="white"
          />
          <path
            d="M84 96 C 90 92 110 92 116 96 C 112 104 106 108 100 108 C 94 108 88 104 84 96 Z"
            fill="black"
          />
        </svg>
      </motion.div>
    </motion.div>
  );
}
