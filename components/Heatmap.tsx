"use client";

import { useCallback, useEffect, useState } from "react";
import CenterLogo from "@/components/CenterLogo";
import HeatField, { type IconColorMap } from "@/components/HeatField";
import IndustryIcons from "@/components/IndustryIcons";

/**
 * How long after the heat field starts before it counts as fully expanded.
 * Keep in sync with HeatField's `expansionDurationMs` default (2600ms); the
 * extra margin lets the map visibly settle before the labels light up.
 */
const HEAT_SETTLE_MS = 3000;

interface HeatmapProps {
  logoVisible: boolean;
  iconsActive: boolean;
  revealOrder: string[];
  heatStartedAt: number | null;
}

export default function Heatmap({
  logoVisible,
  iconsActive,
  revealOrder,
  heatStartedAt,
}: HeatmapProps) {
  // Live heat color under each icon, streamed from the HeatField render loop.
  const [iconColors, setIconColors] = useState<IconColorMap>({});

  // True once the map has finished expanding — this is what triggers the
  // priority industry names to switch to their diffused gradient.
  const [heatSettled, setHeatSettled] = useState(false);

  // Stable callback so HeatField's effect isn't torn down every render.
  const handleIconColors = useCallback((colors: IconColorMap) => {
    setIconColors(colors);
  }, []);

  useEffect(() => {
    if (heatStartedAt === null) {
      setHeatSettled(false);
      return;
    }
    const id = setTimeout(() => setHeatSettled(true), HEAT_SETTLE_MS);
    return () => clearTimeout(id);
  }, [heatStartedAt]);

  return (
    <div className="relative aspect-square w-[min(88vw,620px)] sm:w-[min(70vw,620px)]">
      {/* Ambient backdrop glow — reacts once the field is alive, kept subtle */}
      <div
        className="pointer-events-none absolute inset-[-15%] rounded-full transition-opacity duration-[1500ms]"
        style={{
          opacity: heatStartedAt !== null ? 1 : 0,
          background:
            "radial-gradient(circle, rgba(245,150,78,0.10) 0%, rgba(110,25,190,0.07) 45%, transparent 72%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      <HeatField
        startedAt={heatStartedAt}
        ringRadius={0.8}
        onIconColors={handleIconColors}
      />

      <IndustryIcons
        active={iconsActive}
        revealOrder={revealOrder}
        iconColors={iconColors}
        heatSettled={heatSettled}
      />

      <CenterLogo visible={logoVisible} glowing={heatStartedAt !== null} />
    </div>
  );
}
