"use client";

import { ExternalLink, ImageOff, Pencil, Plus, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { api, ApiError } from "@/shared/lib/api";
import { useT } from "@/shared/i18n/client";
import { formatMoney } from "@/shared/lib/format";
import type { Category } from "@/shared/lib/types";
import { useApi } from "@/shared/lib/useApi";
import { usePaged } from "@/shared/lib/usePaged";
import { Badge } from "@/shared/ui/Badge";
import { ButtonLink, IconButton } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Field";
import { Card, Chips, PageHeader, Pagination, SearchInput, Table } from "@/shared/ui/Page";
import { Alert, Empty, ErrorState, Loading } from "@/shared/ui/States";

interface Row {
  id: number;
  slug: string;
  name: string;
  sku: string | null;
  brand: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  images: string[];
  active: boolean;
  is_featured: boolean;
  badge: string | null;
  sold_count: number;
  category_name: string;
}

export function ProductsList() {
  const t = useT();
  const tr = t.admin.products;
  const [category, setCategory] = useState("");
  const { data: categories } = useApi<Category[]>("/categories");
  const list = usePaged<{ items: Row[]; total: number; counts: Record<string, number> }>("/products", { extra: { category_id: category } });
  const [error, setError] = useState<string | null>(null);
  const c = list.data?.counts ?? {};

  const remove = async (row: Row) => {
    if (!confirm(tr.removeConfirm(row.name))) return;
    setError(null);
    try {
      await api(`/products/${row.id}`, { method: "DELETE" });
      list.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t.common.error);
    }
  };

  return (
    <div>
      <PageHeader
        title={tr.title}
        subtitle={tr.subtitle}
        action={
          <ButtonLink href="/admin/tovarlar/yangi">
            <Plus className="size-4.5" aria-hidden />
            {tr.new}
          </ButtonLink>
        }
      />
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <Chips
          value={list.status}
          onChange={list.setStatus}
          options={[
            { value: "", label: t.common.all, count: c.all },
            { value: "active", label: tr.chips.active, count: c.active },
            { value: "inactive", label: tr.chips.inactive, count: c.inactive },
            { value: "low", label: tr.chips.low, count: c.low },
            { value: "out", label: tr.chips.out, count: c.out },
            { value: "featured", label: tr.chips.featured, count: c.featured },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select aria-label={tr.category} value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 sm:w-52">
            <option value="">{tr.allCategories}</option>
            {(categories ?? []).map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>
          <SearchInput value={list.q} onChange={list.setQ} label={tr.search} />
        </div>
      </div>
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      <Card>
        {list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : !list.data ? (
          <Loading />
        ) : !list.data.items.length ? (
          <Empty title={tr.empty} action={<ButtonLink href="/admin/tovarlar/yangi" size="sm">{tr.add}</ButtonLink>} />
        ) : (
          <>
            <Table head={tr.head}>
              {list.data.items.map((p) => (
                <tr key={p.id} className="hover:bg-ink-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/tovarlar/${p.id}`} className="flex items-center gap-3">
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                        {p.images[0] ? <Image src={p.images[0]} alt="" fill sizes="48px" className="object-contain p-1" /> : <ImageOff className="m-auto mt-3.5 size-5 text-ink-300" aria-hidden />}
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-1 font-semibold hover:text-leaf-700">{p.name}</span>
                        <span className="text-xs text-ink-500">
                          {p.sku ?? tr.noSku}
                          {p.brand ? ` · ${p.brand}` : ""}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{p.category_name}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{formatMoney(p.price)}</p>
                    {p.old_price ? <p className="text-xs text-ink-400 line-through">{formatMoney(p.old_price)}</p> : null}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={p.stock === 0 ? "flame" : p.stock <= 3 ? "amber" : "leaf"}>{t.common.pcs(p.stock)}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      <Badge tone={p.active ? "leaf" : "muted"}>{p.active ? tr.onSale : tr.hidden}</Badge>
                      {p.is_featured ? (
                        <Badge tone="lime">
                          <Star className="size-3" aria-hidden /> {tr.featured}
                        </Badge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <a href={`/mahsulot/${p.slug}`} target="_blank" rel="noreferrer" aria-label={tr.view(p.name)} className="grid size-9 place-items-center rounded-xl text-ink-500 hover:bg-ink-100">
                        <ExternalLink className="size-4" />
                      </a>
                      <Link href={`/admin/tovarlar/${p.id}`} aria-label={tr.edit(p.name)} className="grid size-9 place-items-center rounded-xl text-ink-500 hover:bg-ink-100">
                        <Pencil className="size-4" />
                      </Link>
                      <IconButton label={tr.remove(p.name)} onClick={() => remove(p)} className="hover:!bg-flame-50 hover:!text-flame-600">
                        <Trash2 className="size-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
            <Pagination page={list.page} total={list.data.total} limit={list.limit} onPage={list.setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
