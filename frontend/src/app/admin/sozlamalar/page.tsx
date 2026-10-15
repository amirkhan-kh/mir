import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { SettingsAdmin } from "@/features/admin/settings/SettingsAdmin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.settings };
}

export default function SettingsPage() {
  return <SettingsAdmin />;
}
