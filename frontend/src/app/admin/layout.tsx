import type { Metadata } from "next";
import { AdminShell } from "@/features/admin/AdminShell";

export const metadata: Metadata = { title: { default: "Boshqaruv", template: "%s — Mir boshqaruv" }, robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
