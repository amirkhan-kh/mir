import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { Dashboard } from "@/features/admin/dashboard/Dashboard";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.dashboard };
}

export default function AdminHome() {
  return <Dashboard />;
}
