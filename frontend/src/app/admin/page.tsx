import type { Metadata } from "next";
import { Dashboard } from "@/features/admin/dashboard/Dashboard";

export const metadata: Metadata = { title: "Bosh panel" };

export default function AdminHome() {
  return <Dashboard />;
}
