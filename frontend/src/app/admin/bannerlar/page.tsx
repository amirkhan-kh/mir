import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { BannersAdmin } from "@/features/admin/banners/BannersAdmin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.banners };
}

export default function BannersPage() {
  return <BannersAdmin />;
}
