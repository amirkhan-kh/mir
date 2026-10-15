"use client";

import { Check, ExternalLink, Trash2, X } from "lucide-react";
import { useState } from "react";
import { api, ApiError } from "@/shared/lib/api";
import { formatDate } from "@/shared/lib/format";
import { REVIEW_STATUS } from "@/shared/lib/status";
import { usePaged } from "@/shared/lib/usePaged";
import { Badge } from "@/shared/ui/Badge";
import { Button, IconButton } from "@/shared/ui/Button";
import { Card, Chips, PageHeader, Pagination, SearchInput } from "@/shared/ui/Page";
import { Alert, Empty, ErrorState, Loading } from "@/shared/ui/States";
import { Stars } from "@/shared/ui/Stars";

interface Row {
  id: number;
  author: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  product_name: string;
  product_slug: string;
}

export function ReviewsAdmin() {
  const list = usePaged<{ items: Row[]; total: number; counts: Record<string, number> }>("/reviews", { limit: 10 });
  const [error, setError] = useState<string | null>(null);
  const c = list.data?.counts ?? {};

  const act = async (r: Row, status: Row["status"] | "delete") => {
    if (status === "delete" && !confirm("Sharhni butunlay o'chirasizmi?")) return;
    setError(null);
    try {
      if (status === "delete") await api(`/reviews/${r.id}`, { method: "DELETE" });
      else await api(`/reviews/${r.id}`, { method: "PATCH", json: { status } });
      list.reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xatolik");
    }
  };

  return (
    <div>
      <PageHeader title="Sharhlar" subtitle="Mijoz sharhlari faqat tasdiqlangandan so'ng saytda chiqadi va reytingga qo'shiladi" />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Chips
          value={list.status}
          onChange={list.setStatus}
          options={[
            { value: "", label: "Barchasi", count: (c.pending ?? 0) + (c.approved ?? 0) + (c.rejected ?? 0) },
            { value: "pending", label: "Kutilmoqda", count: c.pending ?? 0 },
            { value: "approved", label: "Chop etilgan", count: c.approved ?? 0 },
            { value: "rejected", label: "Rad etilgan", count: c.rejected ?? 0 },
          ]}
        />
        <SearchInput value={list.q} onChange={list.setQ} label="Muallif yoki tovar" />
      </div>
      {error ? <div className="mb-3"><Alert>{error}</Alert></div> : null}
      <Card>
        {list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : !list.data ? (
          <Loading />
        ) : !list.data.items.length ? (
          <Empty title="Sharh yo'q" />
        ) : (
          <>
            <ul className="divide-y divide-ink-100">
              {list.data.items.map((r) => (
                <li key={r.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{r.author}</span>
                      <Stars value={r.rating} />
                      <Badge tone={REVIEW_STATUS[r.status].tone}>{REVIEW_STATUS[r.status].label}</Badge>
                      <span className="text-xs text-ink-400">{formatDate(r.created_at, true)}</span>
                    </div>
                    <a href={`/mahsulot/${r.product_slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-leaf-700 hover:underline">
                      {r.product_name}
                      <ExternalLink className="size-3.5" aria-hidden />
                    </a>
                    {r.text ? <p className="text-sm text-ink-700">{r.text}</p> : <p className="text-sm italic text-ink-400">Matnsiz baho</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {r.status !== "approved" ? (
                      <Button size="sm" onClick={() => act(r, "approved")}>
                        <Check className="size-4" aria-hidden /> Tasdiqlash
                      </Button>
                    ) : null}
                    {r.status !== "rejected" ? (
                      <Button size="sm" variant="outline" onClick={() => act(r, "rejected")}>
                        <X className="size-4" aria-hidden /> Rad etish
                      </Button>
                    ) : null}
                    <IconButton label={`${r.author} sharhini o'chirish`} onClick={() => act(r, "delete")} className="hover:!bg-flame-50 hover:!text-flame-600">
                      <Trash2 className="size-4" />
                    </IconButton>
                  </div>
                </li>
              ))}
            </ul>
            <Pagination page={list.page} total={list.data.total} limit={list.limit} onPage={list.setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
