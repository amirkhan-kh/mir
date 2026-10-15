import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { ProductForm } from "@/features/admin/products/ProductForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.editProductTitle };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductForm id={id} />;
}
