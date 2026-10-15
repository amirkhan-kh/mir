"use client";

import { RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { formatDate, formatMoney, formatPhone } from "@/shared/lib/format";
import { useT } from "@/shared/i18n/client";
import { ORDER_STATUSES, ORDER_TONE } from "@/shared/lib/status";
import type { DeliveryMethod, OrderStatus, PaymentMethod } from "@/shared/lib/types";
import { usePaged } from "@/shared/lib/usePaged";
import { Badge } from "@/shared/ui/Badge";
import { IconButton } from "@/shared/ui/Button";
import { Card, Chips, PageHeader, Pagination, SearchInput, Table } from "@/shared/ui/Page";
import { Empty, ErrorState, Loading } from "@/shared/ui/States";

interface Row {
  id: number;
  number: string;
  customer_name: string;
  phone: string;
  region: string;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  status: OrderStatus;
  total: number;
  created_at: string;
  assignee_name: string | null;
  items_count: number;
}

export function OrdersList() {
  const t = useT();
  const tr = t.admin.orders;
  const router = useRouter();
  const params = useSearchParams();
  const list = usePaged<{ items: Row[]; total: number; counts: Record<string, number> }>("/orders", { pollMs: 30_000 });
  const { setStatus } = list;
  const initial = params.get("status") ?? "";
  useEffect(() => {
    if (initial) setStatus(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  const counts = list.data?.counts ?? {};
  const all = Object.values(counts).reduce((s, n) => s + n, 0);
  const options = [
    { value: "", label: t.common.all, count: all },
    ...ORDER_STATUSES.map((s) => ({ value: s, label: t.status.order[s], count: counts[s] ?? 0 })),
  ];

  return (
    <div>
      <PageHeader
        title={tr.title}
        subtitle={tr.subtitle}
        action={
          <IconButton label={tr.refresh} onClick={list.reload} className="ring-1 ring-ink-200">
            <RefreshCw className={`size-4 ${list.loading ? "animate-spin" : ""}`} />
          </IconButton>
        }
      />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Chips value={list.status} onChange={list.setStatus} options={options} />
        <SearchInput value={list.q} onChange={list.setQ} label={tr.search} />
      </div>
      <Card>
        {list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : !list.data ? (
          <Loading />
        ) : !list.data.items.length ? (
          <Empty title={tr.empty} hint={tr.emptyHint} />
        ) : (
          <>
            <Table head={tr.head}>
              {list.data.items.map((o) => (
                <tr
                  key={o.id}
                  tabIndex={0}
                  onClick={() => router.push(`/admin/buyurtmalar/${o.id}`)}
                  onKeyDown={(e) => e.key === "Enter" && router.push(`/admin/buyurtmalar/${o.id}`)}
                  className={`cursor-pointer hover:bg-ink-50 ${o.status === "new" ? "bg-amber-50/40" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold">{o.number}</p>
                    <p className="text-xs text-ink-500">{formatDate(o.created_at, true)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.customer_name}</p>
                    <p className="text-xs text-ink-500">{formatPhone(o.phone)}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-600">
                    <p>{t.status.delivery[o.delivery_method]}{o.delivery_method === "courier" ? ` · ${o.region}` : ""}</p>
                    <p>{t.status.payment[o.payment_method]}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{formatMoney(o.total)}</p>
                    <p className="text-xs text-ink-500">{tr.items(o.items_count)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ORDER_TONE[o.status]}>{t.status.order[o.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{o.assignee_name ?? <span className="text-ink-400">—</span>}</td>
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
