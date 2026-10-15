import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { StaffAdmin } from "@/features/admin/staff/StaffAdmin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.staff };
}

export default function StaffPage() {
  return <StaffAdmin />;
}
