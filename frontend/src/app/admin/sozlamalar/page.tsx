import type { Metadata } from "next";
import { SettingsAdmin } from "@/features/admin/settings/SettingsAdmin";

export const metadata: Metadata = { title: "Sozlamalar" };

export default function SettingsPage() {
  return <SettingsAdmin />;
}
