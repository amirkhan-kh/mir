"use client";

import { Heart } from "lucide-react";
import { ProductCard } from "@/features/storefront/ProductCard";
import { useT } from "@/shared/i18n/client";
import type { InstallmentPlan, ProductList } from "@/shared/lib/types";
import { useApi } from "@/shared/lib/useApi";
import { ButtonLink } from "@/shared/ui/Button";
import { Empty, ErrorState, Loading } from "@/shared/ui/States";
import { useFavorites } from "./store";

export function FavoritesView({ plan }: { plan: InstallmentPlan | null }) {
  const t = useT();
  const ids = useFavorites();
  const { data, error, loading, reload } = useApi<ProductList>(ids.length ? `/public/products?ids=${ids.join(",")}&limit=60` : null);

  if (!ids.length) {
    return (
      <div className="rounded-3xl bg-white">
        <Empty icon={<Heart className="size-6" aria-hidden />} title={t.favorites.empty} hint={t.favorites.emptyHint} action={<ButtonLink href="/katalog">{t.favorites.toCatalog}</ButtonLink>} />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading && !data) return <Loading />;
  const items = (data?.items ?? []).filter((p) => ids.includes(p.id)).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
  return (
    <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((p) => (
        <li key={p.id}>
          <ProductCard product={p} plan={plan} />
        </li>
      ))}
    </ul>
  );
}
