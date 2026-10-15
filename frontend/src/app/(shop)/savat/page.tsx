import type { Metadata } from "next";
import { CartView } from "@/features/cart/CartView";

export const metadata: Metadata = { title: "Savat", robots: { index: false } };

export default function CartPage() {
  return (
    <div>
      <h1 className="mb-5 font-display text-2xl font-semibold tracking-tight sm:text-3xl">Savat</h1>
      <CartView />
    </div>
  );
}
