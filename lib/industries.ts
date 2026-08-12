import type { ComponentType, SVGProps } from "react";
import {
  AgricultureIcon,
  ArtificialIntelligenceIcon,
  AutomotiveIcon,
  ConnectivityIcon,
  ConstructionIcon,
  DigitalTwinsIcon,
  EnergyIcon,
  GovernmentIcon,
  MapsIcon,
  MobilityIcon,
  SecurityIcon,
  SustainabilityIcon,
} from "@/lib/icons";

export interface Industry {
  id: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Position around the circle: 0deg = top (12 o'clock), increasing clockwise. */
  angleDeg: number;
  /** Priority sectors that "feed" the core with more intensity. */
  priority: boolean;
}

// 12 industries, evenly spaced at 30° increments starting at the top (0°),
// ordered clockwise to mirror the reference composition.
export const INDUSTRIES: Industry[] = [
  { id: "automotive", label: "Automotive", Icon: AutomotiveIcon, angleDeg: 0, priority: false },
  { id: "digital-twins", label: "Digital Twins", Icon: DigitalTwinsIcon, angleDeg: 30, priority: true },
  { id: "ai", label: "Artificial Intelligence", Icon: ArtificialIntelligenceIcon, angleDeg: 60, priority: true },
  { id: "sustainability", label: "Sustainability", Icon: SustainabilityIcon, angleDeg: 90, priority: true },
  { id: "energy", label: "Energy", Icon: EnergyIcon, angleDeg: 120, priority: false },
  { id: "security", label: "Security", Icon: SecurityIcon, angleDeg: 150, priority: false },
  { id: "maps", label: "Maps / GIS", Icon: MapsIcon, angleDeg: 180, priority: false },
  { id: "connectivity", label: "Connectivity / IoT", Icon: ConnectivityIcon, angleDeg: 210, priority: false },
  { id: "government", label: "Government", Icon: GovernmentIcon, angleDeg: 240, priority: false },
  { id: "construction", label: "Construction", Icon: ConstructionIcon, angleDeg: 270, priority: false },
  { id: "mobility", label: "Mobility", Icon: MobilityIcon, angleDeg: 300, priority: false },
  { id: "agriculture", label: "Agriculture", Icon: AgricultureIcon, angleDeg: 330, priority: false },
];

/** angleDeg -> unit vector, 0deg = top, clockwise (screen space, y-down). */
export function angleToUnitVector(angleDeg: number): { x: number; y: number } {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: Math.cos(rad), y: Math.sin(rad) };
}
