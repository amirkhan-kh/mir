import type { Metadata } from "next";
import { ProductForm } from "@/features/admin/products/ProductForm";

export const metadata: Metadata = { title: "Yangi tovar" };

export default function NewProductPage() {
  return <ProductForm />;
}
