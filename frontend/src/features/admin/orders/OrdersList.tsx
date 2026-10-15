"use client";

import { RefreshCw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { formatDate, formatMoney, formatPhone } from "@/shared/lib/format";
import { DELIVERY, ORDER_STATUS, PAYMENT } from "@/shared/lib/status";
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
    { value: "", label: "Barchasi", count: all },
    ...(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => ({ value: s, label: ORDER_STATUS[s].label, count: counts[s] ?? 0 })),
  ];

  return (
    <div>
      <PageHeader
        title="Buyurtmalar"
        subtitle="Saytdan tushgan buyurtmalar. Ro'yxat har 30 soniyada yangilanadi."
        action={
          <IconButton label="Yangilash" onClick={list.reload} className="ring-1 ring-ink-200">
            <RefreshCw className={`size-4 ${list.loading ? "animate-spin" : ""}`} />
          </IconButton>
        }
      />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Chips value={list.status} onChange={list.setStatus} options={options} />
        <SearchInput value={list.q} onChange={list.setQ} label="Raqam, ism yoki telefon" />
      </div>
      <Card>
        {list.error ? (
          <ErrorState message={list.error} onRetry={list.reload} />
        ) : !list.data ? (
          <Loading />
        ) : !list.data.items.length ? (
          <Empty title="Buyurtma topilmadi" hint="Filtr yoki qidiruvni o'zgartiring." />
        ) : (
          <>
            <Table head={["Buyurtma", "Mijoz", "Qabul / to'lov", "Summa", "Holat", "Mas'ul"]}>
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
                    <p>{DELIVERY[o.delivery_method]}{o.delivery_method === "courier" ? ` · ${o.region}` : ""}</p>
                    <p>{PAYMENT[o.payment_method]}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{formatMoney(o.total)}</p>
                    <p className="text-xs text-ink-500">{o.items_count} ta tovar</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge>
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
