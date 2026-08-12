"use client";

import { useEffect, useRef, useState } from "react";
import { INDUSTRIES } from "@/lib/industries";
import Heatmap from "@/components/Heatmap";

// --- Timing constants, all derived from the brief -------------------------
const LOGO_DURATION_MS = 700; // Stage 1: fade + scale 0.8 -> 1
const ICONS_START_DELAY_MS = 150; // small pause after the logo settles
const ICON_GAP_MS = 165; // ~120-180ms cadence between icon reveals
const ICON_COUNT = INDUSTRIES.length;
const ICONS_TOTAL_MS = ICONS_START_DELAY_MS + (ICON_COUNT - 1) * ICON_GAP_MS + 200;
const HEAT_START_DELAY_MS = ICONS_TOTAL_MS + 300; // brief pause once all icons are up
const EXPANSION_DURATION_MS = 2600;
const LIT_THRESHOLD_MS = EXPANSION_DURATION_MS * 0.6; // when the field visibly reaches the ring

function shuffledIds(): string[] {
  const ids = INDUSTRIES.map((i) => i.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}

export default function AnimationController() {
  const [logoVisible, setLogoVisible] = useState(false);
  const [iconsActive, setIconsActive] = useState(false);
  const [heatStartedAt, setHeatStartedAt] = useState<number | null>(null);
  const [litIds, setLitIds] = useState<Set<string>>(new Set());

  // Stable default order for the server-rendered markup; shuffled on the
  // client after mount so there is no hydration mismatch from randomness.
  const [revealOrder, setRevealOrder] = useState<string[]>(() =>
    INDUSTRIES.map((i) => i.id)
  );

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    setRevealOrder(shuffledIds());

    const schedule = (fn: () => void, ms: number) => {
      timers.current.push(setTimeout(fn, ms));
    };

    // Stage 1 — logo fades in immediately on mount.
    schedule(() => setLogoVisible(true), 0);

    // Stage 2 — icons begin appearing one by one, random order.
    schedule(() => setIconsActive(true), ICONS_START_DELAY_MS);

    // Stage 3 — the heat field starts expanding from the core.
    schedule(() => setHeatStartedAt(performance.now()), HEAT_START_DELAY_MS);

    // Icons brighten once the expanding field visibly reaches the ring.
    schedule(
      () => setLitIds(new Set(INDUSTRIES.map((i) => i.id))),
      HEAT_START_DELAY_MS + LIT_THRESHOLD_MS
    );

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, []);

  return (
    <Heatmap
      logoVisible={logoVisible}
      iconsActive={iconsActive}
      revealOrder={revealOrder}
      litIds={litIds}
      heatStartedAt={heatStartedAt}
    />
  );
}
