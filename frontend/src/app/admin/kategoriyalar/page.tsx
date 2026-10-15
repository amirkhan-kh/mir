import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { CategoriesAdmin } from "@/features/admin/categories/CategoriesAdmin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.categories };
}

export default function CategoriesPage() {
  return <CategoriesAdmin />;
}
