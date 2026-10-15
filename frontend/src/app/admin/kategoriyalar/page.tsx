import type { Metadata } from "next";
import { CategoriesAdmin } from "@/features/admin/categories/CategoriesAdmin";

export const metadata: Metadata = { title: "Kategoriyalar" };

export default function CategoriesPage() {
  return <CategoriesAdmin />;
}
