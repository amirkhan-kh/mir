import {
  AirVent, Camera, CookingPot, Fan, Gamepad2, Headphones, Laptop, Lightbulb, Microwave, Monitor, Package, Plug,
  Refrigerator, Smartphone, Speaker, Tablet, Tv, WashingMachine, Watch, type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  smartphone: { icon: Smartphone, label: "Smartfon" },
  laptop: { icon: Laptop, label: "Noutbuk" },
  tablet: { icon: Tablet, label: "Planshet" },
  headphones: { icon: Headphones, label: "Quloqchin" },
  speaker: { icon: Speaker, label: "Kolonka" },
  watch: { icon: Watch, label: "Soat" },
  tv: { icon: Tv, label: "Televizor" },
  monitor: { icon: Monitor, label: "Monitor" },
  refrigerator: { icon: Refrigerator, label: "Muzlatgich" },
  "washing-machine": { icon: WashingMachine, label: "Kir yuvish" },
  "air-vent": { icon: AirVent, label: "Konditsioner" },
  fan: { icon: Fan, label: "Ventilyator" },
  microwave: { icon: Microwave, label: "Mikroto'lqinli pech" },
  "cooking-pot": { icon: CookingPot, label: "Oshxona" },
  camera: { icon: Camera, label: "Kamera" },
  gamepad: { icon: Gamepad2, label: "O'yin" },
  plug: { icon: Plug, label: "Aksessuar" },
  lightbulb: { icon: Lightbulb, label: "Yoritish" },
  package: { icon: Package, label: "Boshqa" },
};

export function CategoryIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  const Icon = (CATEGORY_ICONS[name] ?? CATEGORY_ICONS.package).icon;
  return <Icon className={className} aria-hidden strokeWidth={1.75} />;
}
