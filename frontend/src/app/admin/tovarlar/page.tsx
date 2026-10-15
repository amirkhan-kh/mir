import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { ProductsList } from "@/features/admin/products/ProductsList";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.products };
}

export default function ProductsPage() {
  return <ProductsList />;
}
