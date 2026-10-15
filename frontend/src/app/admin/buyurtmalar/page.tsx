import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { Suspense } from "react";
import { OrdersList } from "@/features/admin/orders/OrdersList";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.nav.orders };
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersList />
    </Suspense>
  );
}
