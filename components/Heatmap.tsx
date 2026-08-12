"use client";

import { useCallback, useState } from "react";
import CenterLogo from "@/components/CenterLogo";
import HeatField, { type IconColorMap } from "@/components/HeatField";
import IndustryIcons from "@/components/IndustryIcons";

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

  // Stable callback so HeatField's effect isn't torn down every render.
  const handleIconColors = useCallback((colors: IconColorMap) => {
    setIconColors(colors);
  }, []);

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
      />

      <CenterLogo visible={logoVisible} glowing={heatStartedAt !== null} />
    </div>
  );
}
