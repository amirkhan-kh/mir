import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { AdminShell } from "@/features/admin/AdminShell";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: { default: t.meta.admin, template: t.meta.adminTemplate }, robots: { index: false } };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
