import type { Metadata } from "next";
import { getT } from "@/shared/i18n/server";
import { OrderDetail } from "@/features/admin/orders/OrderDetail";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.admin.orderTitle };
}

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
