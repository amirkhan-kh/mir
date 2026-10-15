import type { Metadata } from "next";
import { OrderTracker } from "@/features/checkout/OrderTracker";
import { getStore } from "@/shared/lib/server";

export const metadata: Metadata = { title: "Buyurtma holati", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ number: string }> }) {
  const [{ number }, store] = await Promise.all([params, getStore()]);
  return <OrderTracker number={decodeURIComponent(number).slice(0, 20)} store={store} />;
}
