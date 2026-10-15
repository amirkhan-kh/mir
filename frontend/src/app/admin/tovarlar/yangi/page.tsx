import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { ProductForm } from "@/features/admin/products/ProductForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.newProductTitle };
}

export default function NewProductPage() {
  return <ProductForm />;
}
