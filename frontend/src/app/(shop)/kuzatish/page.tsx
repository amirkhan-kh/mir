import { PackageSearch } from "lucide-react";
import type { Metadata } from "next";
import { TrackForm } from "@/features/checkout/OrderTracker";
import { getT } from "@/shared/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.meta.track, description: t.meta.trackDescription, alternates: { canonical: "/kuzatish" } };
}

export default async function TrackPage() {
  const t = await getT();
  return (
    <div className="mx-auto max-w-md py-6">
      <div className="rounded-3xl bg-white p-6 sm:p-8">
        <span className="grid size-12 place-items-center rounded-2xl bg-ink-950 text-lime-400">
          <PackageSearch className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold">{t.meta.track}</h1>
        <p className="mb-6 mt-1 text-sm text-ink-500">{t.track.hint}</p>
        <TrackForm />
      </div>
    </div>
  );
}
