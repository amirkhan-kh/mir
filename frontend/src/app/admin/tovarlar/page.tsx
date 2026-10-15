import type { Metadata } from "next";
import { ProductsList } from "@/features/admin/products/ProductsList";

export const metadata: Metadata = { title: "Tovarlar" };

export default function ProductsPage() {
  return <ProductsList />;
}
