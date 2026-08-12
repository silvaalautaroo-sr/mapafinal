"use client";

import CenterLogo from "@/components/CenterLogo";
import HeatField from "@/components/HeatField";
import IndustryIcons from "@/components/IndustryIcons";

interface HeatmapProps {
  logoVisible: boolean;
  iconsActive: boolean;
  revealOrder: string[];
  litIds: Set<string>;
  heatStartedAt: number | null;
}

export default function Heatmap({
  logoVisible,
  iconsActive,
  revealOrder,
  litIds,
  heatStartedAt,
}: HeatmapProps) {
  return (
    <div className="relative aspect-square w-[min(88vw,620px)] sm:w-[min(70vw,620px)]">
      {/* Ambient backdrop glow — reacts once the field is alive, kept subtle */}
      <div
        className="pointer-events-none absolute inset-[-15%] rounded-full transition-opacity duration-[1500ms]"
        style={{
          opacity: heatStartedAt !== null ? 1 : 0,
          background:
            "radial-gradient(circle, rgba(255,80,40,0.10) 0%, rgba(45,212,207,0.05) 45%, transparent 72%)",
          filter: "blur(40px)",
        }}
        aria-hidden="true"
      />

      <HeatField startedAt={heatStartedAt} ringRadius={0.8} />

      <IndustryIcons active={iconsActive} revealOrder={revealOrder} litIds={litIds} />

      <CenterLogo visible={logoVisible} glowing={heatStartedAt !== null} />
    </div>
  );
}
