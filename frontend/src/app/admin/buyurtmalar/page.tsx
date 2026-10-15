import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersList } from "@/features/admin/orders/OrdersList";

export const metadata: Metadata = { title: "Buyurtmalar" };

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersList />
    </Suspense>
  );
}
