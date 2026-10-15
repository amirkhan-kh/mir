import type { Metadata } from "next";
import { BannersAdmin } from "@/features/admin/banners/BannersAdmin";

export const metadata: Metadata = { title: "Bannerlar" };

export default function BannersPage() {
  return <BannersAdmin />;
}
