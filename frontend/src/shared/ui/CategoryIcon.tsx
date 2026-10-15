import {
  AirVent, Camera, CookingPot, Fan, Gamepad2, Headphones, Laptop, Lightbulb, Microwave, Monitor, Package, Plug,
  Refrigerator, Smartphone, Speaker, Tablet, Tv, WashingMachine, Watch, type LucideIcon,
} from "lucide-react";

/** Icon keys stored on categories; labels are `t.icons[key]`. */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
  headphones: Headphones,
  speaker: Speaker,
  watch: Watch,
  tv: Tv,
  monitor: Monitor,
  refrigerator: Refrigerator,
  "washing-machine": WashingMachine,
  "air-vent": AirVent,
  fan: Fan,
  microwave: Microwave,
  "cooking-pot": CookingPot,
  camera: Camera,
  gamepad: Gamepad2,
  plug: Plug,
  lightbulb: Lightbulb,
  package: Package,
};

export function CategoryIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name] ?? CATEGORY_ICONS.package;
  return <Icon className={className} aria-hidden strokeWidth={1.75} />;
}
