import type { Metadata } from "next";
import { OrderDetail } from "@/features/admin/orders/OrderDetail";

export const metadata: Metadata = { title: "Buyurtma" };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
