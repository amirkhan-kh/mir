import type { Metadata } from "next";
import { StaffAdmin } from "@/features/admin/staff/StaffAdmin";

export const metadata: Metadata = { title: "Xodimlar" };

export default function StaffPage() {
  return <StaffAdmin />;
}
