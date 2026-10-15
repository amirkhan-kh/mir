"use client";

import { AlertTriangle, ArrowRight, Clock, MessageSquare, Package, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { formatMoney, formatRelative } from "@/shared/lib/format";
import { useT } from "@/shared/i18n/client";
import { ORDER_TONE } from "@/shared/lib/status";
import type { OrderStatus } from "@/shared/lib/types";
import { useApi } from "@/shared/lib/useApi";
import { Badge } from "@/shared/ui/Badge";
import { Card, KpiCard, PageHeader } from "@/shared/ui/Page";
import { Empty, ErrorState, Loading } from "@/shared/ui/States";
import { useSession } from "../AdminShell";
import { SalesChart } from "./SalesChart";

interface Summary {
  kpi: {
    orders_today: number;
    orders_new: number;
    orders_in_progress: number;
    revenue_month: number;
    sales_30d: number;
    orders_30d: number;
    products_active: number;
    reviews_pending: number;
  };
  daily: { day: string; sales: number; orders: number }[];
  top: { product_id: number; name: string; qty: number; revenue: number }[];
  low_stock: { id: number; name: string; stock: number; image: string | null }[];
  recent: { id: number; number: string; customer_name: string; total: number; status: OrderStatus; created_at: string }[];
}

export function Dashboard() {
  const user = useSession();
  const t = useT();
  const d = t.admin.dashboard;
  const router = useRouter();
  const isCourier = user.role === "courier";
  useEffect(() => {
    if (isCourier) router.replace("/admin/buyurtmalar");
  }, [isCourier, router]);
  const { data, error, loading, reload } = useApi<Summary>(isCourier ? null : "/dashboard", { pollMs: 60_000 });

  if (isCourier) return <Loading />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (loading && !data) return <Loading />;
  if (!data) return null;
  const k = data.kpi;
  const avg = k.orders_30d ? k.sales_30d / k.orders_30d : 0;

  return (
    <div className="space-y-6">
      <PageHeader title={d.hello(user.full_name.split(" ")[0])} subtitle={d.subtitle} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/buyurtmalar?status=new" className="block">
          <KpiCard accent label={d.newOrders} value={k.orders_new} hint={d.newOrdersHint} icon={<ShoppingCart className="size-4.5" />} />
        </Link>
        <KpiCard label={d.today} value={k.orders_today} hint={d.inProgress(k.orders_in_progress)} icon={<Clock className="size-4.5" />} />
        <KpiCard label={d.deliveredMonth} value={formatMoney(k.revenue_month)} hint={d.deliveredMonthHint} icon={<Wallet className="size-4.5" />} />
        <KpiCard label={d.avgCheck} value={formatMoney(avg)} hint={d.orders(k.orders_30d)} icon={<TrendingUp className="size-4.5" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">{d.sales14}</h2>
            <span className="text-sm text-ink-500">{d.sales30(formatMoney(k.sales_30d))}</span>
          </div>
          <SalesChart data={data.daily} />
        </Card>
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-semibold">{d.recent}</h2>
            <Link href="/admin/buyurtmalar" className="flex items-center gap-1 text-sm font-semibold text-leaf-700 hover:underline">
              {d.all} <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <ul className="divide-y divide-ink-100">
            {data.recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/buyurtmalar/${o.id}`} className="flex items-center gap-3 py-2.5 hover:bg-ink-50">
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">
                      {o.number} · <span className="font-normal text-ink-600">{o.customer_name}</span>
                    </span>
                    <span className="text-xs text-ink-500">{formatRelative(o.created_at, t.time)}</span>
                  </span>
                  <span className="text-right">
                    <span className="block text-sm font-semibold">{formatMoney(o.total)}</span>
                    <Badge tone={ORDER_TONE[o.status]}>{t.status.order[o.status]}</Badge>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <h2 className="mb-3 font-display text-base font-semibold">{d.top}</h2>
          {data.top.length ? (
            <ol className="space-y-3">
              {data.top.map((row, i) => (
                <li key={`${row.product_id}-${i}`} className="flex items-center gap-3 text-sm">
                  <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-lime-200 text-xs font-bold">{i + 1}</span>
                  <span className="line-clamp-1 flex-1">{row.name}</span>
                  <span className="font-semibold">{t.common.pcs(row.qty)}</span>
                </li>
              ))}
            </ol>
          ) : (
            <Empty title={d.noSales} />
          )}
        </Card>
        <Card className="p-5">
          <h2 className="mb-3 flex items-center gap-2 font-display text-base font-semibold">
            <AlertTriangle className="size-4.5 text-amber-600" aria-hidden />
            {d.lowStock}
          </h2>
          {data.low_stock.length ? (
            <ul className="space-y-2.5">
              {data.low_stock.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/tovarlar/${p.id}`} className="flex items-center gap-3 text-sm hover:text-leaf-700">
                    <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-ink-50">
                      {p.image ? <Image src={p.image} alt="" fill sizes="36px" className="object-contain p-0.5" /> : null}
                    </span>
                    <span className="line-clamp-1 flex-1">{p.name}</span>
                    <Badge tone={p.stock === 0 ? "flame" : "amber"}>{p.stock === 0 ? d.out : t.common.pcs(p.stock)}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title={d.enough} />
          )}
        </Card>
        <div className="grid gap-3">
          <Link href="/admin/tovarlar" className="block">
            <KpiCard label={d.active} value={k.products_active} icon={<Package className="size-4.5" />} hint={d.manage} />
          </Link>
          <Link href="/admin/sharhlar" className="block">
            <KpiCard label={d.pending} value={k.reviews_pending} icon={<MessageSquare className="size-4.5" />} hint={d.moderate} />
          </Link>
        </div>
      </div>
    </div>
  );
}
