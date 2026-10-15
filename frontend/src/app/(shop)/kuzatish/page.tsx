import { PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import { TrackForm } from "@/features/checkout/OrderTracker";

export const metadata: Metadata = {
  title: "Buyurtmani kuzatish",
  description: "Buyurtma raqami va telefon orqali Mir buyurtmangiz holatini bilib oling.",
  alternates: { canonical: "/kuzatish" },
};

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-md py-6">
      <div className="rounded-3xl bg-white p-6 sm:p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-ink-950 text-lime-400">
          <PackageSearch className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold">Buyurtmani kuzatish</h1>
        <p className="mb-6 mt-1 text-sm text-ink-500">Buyurtma raqami SMS yoki buyurtma sahifasida ko'rsatilgan (masalan, MIR-1001).</p>
        <TrackForm />
      </div>
    </div>
  );
}
