"use client";

import { ArrowLeft, ImageOff, MapPin, MessageSquare, Phone, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { api, ApiError } from "@/shared/lib/api";
import { formatDate, formatMoney, formatPhone } from "@/shared/lib/format";
import { useT } from "@/shared/i18n/client";
import { ORDER_TONE } from "@/shared/lib/status";
import type { AdminOrder, OrderStatus, Staff } from "@/shared/lib/types";
import { useApi } from "@/shared/lib/useApi";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Select, Textarea } from "@/shared/ui/Field";
import { Card } from "@/shared/ui/Page";
import { Alert, ErrorState, Loading } from "@/shared/ui/States";
import { can, useSession } from "../AdminShell";

const VARIANT: Partial<Record<OrderStatus, "primary" | "dark" | "danger">> = {
  confirmed: "primary",
  delivering: "dark",
  delivered: "primary",
  cancelled: "danger",
};

function Assign({ order, onDone }: { order: AdminOrder; onDone: () => void }) {
  const t = useT();
  const { data: staff } = useApi<Staff[]>("/users");
  const [error, setError] = useState<string | null>(null);
  const closed = order.status === "delivered" || order.status === "cancelled";
  return (
    <div className="space-y-2">
      <label htmlFor="assignee" className="text-sm font-semibold text-ink-800">
        {t.admin.orders.assignee}
      </label>
      <Select
        id="assignee"
        disabled={closed || !staff}
        value={order.assignee_id ?? ""}
        onChange={async (e) => {
          setError(null);
          try {
            await api(`/orders/${order.id}/assign`, { method: "PATCH", json: { assignee_id: e.target.value ? Number(e.target.value) : null } });
            onDone();
          } catch (err) {
            setError(err instanceof ApiError ? err.message : t.common.error);
          }
        }}
      >
        <option value="">{t.admin.orders.unassigned}</option>
        {(staff ?? [])
          .filter((s) => s.active)
          .map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name} ({t.admin.orders.roles[s.role]}) · {t.admin.orders.open(s.open_orders)}
            </option>
          ))}
      </Select>
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}

function StaffNote({ order }: { order: AdminOrder }) {
  const t = useT();
  const [value, setValue] = useState(order.staff_note);
  const [state, setState] = useState<"idle" | "saving" | "saved" | string>("idle");
  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("saving");
        try {
          await api(`/orders/${order.id}/note`, { method: "PATCH", json: { staff_note: value } });
          setState("saved");
        } catch (err) {
          setState(err instanceof ApiError ? err.message : t.common.error);
        }
      }}
    >
      <label htmlFor="staff-note" className="text-sm font-semibold text-ink-800">
        {t.admin.orders.note}
      </label>
      <Textarea id="staff-note" value={value} maxLength={1000} onChange={(e) => { setValue(e.target.value); setState("idle"); }} placeholder={t.admin.orders.notePlaceholder} />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" variant="soft" disabled={state === "saving"}>
          {t.common.save}
        </Button>
        {state === "saved" ? <span role="status" className="text-sm text-leaf-700">{t.common.saved}</span> : null}
        {state !== "idle" && state !== "saving" && state !== "saved" ? <span role="alert" className="text-sm text-flame-600">{state}</span> : null}
      </div>
    </form>
  );
}

export function OrderDetail({ id }: { id: string }) {
  const user = useSession();
  const t = useT();
  const { data: o, error, reload } = useApi<AdminOrder>(`/orders/${id}`);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!o) return <Loading />;

  const actions = o.next.filter((s) => (user.role === "courier" ? (o.status === "confirmed" && s === "delivering") || (o.status === "delivering" && s === "delivered") : true));

  const move = async (status: OrderStatus) => {
    let note = "";
    if (status === "cancelled") {
      const reason = prompt(t.admin.orders.cancelPrompt, t.admin.orders.cancelDefault);
      if (reason === null) return;
      note = reason;
    } else if (!confirm(t.admin.orders.confirmMove(t.status.order[status]))) {
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      await api(`/orders/${o.id}/status`, { method: "PATCH", json: { status, note } });
      reload();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : t.common.error);
    } finally {
      setBusy(false);
    }
  };

  const tel = o.phone.replace(/[^\d+]/g, "");

  return (
    <div className="space-y-5">
      <Link href="/admin/buyurtmalar" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-950">
        <ArrowLeft className="size-4" aria-hidden />
        {t.admin.orders.back}
      </Link>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 font-display text-2xl font-semibold">
            {o.number}
            <Badge tone={ORDER_TONE[o.status]}>{t.status.order[o.status]}</Badge>
          </h1>
          <p className="mt-1 text-sm text-ink-500">{formatDate(o.created_at, true)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((s) => (
            <Button key={s} variant={VARIANT[s] ?? "outline"} disabled={busy} onClick={() => move(s)}>
              {t.status.action[s]}
            </Button>
          ))}
        </div>
      </div>
      {actionError ? <Alert>{actionError}</Alert> : null}

      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold">{t.admin.orders.customer}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <p className="flex items-start gap-3">
                <UserRound className="mt-0.5 size-4.5 text-ink-400" aria-hidden />
                <span className="font-semibold">{o.customer_name}</span>
              </p>
              <a href={`tel:${tel}`} className="flex items-start gap-3 font-semibold text-leaf-700 hover:underline">
                <Phone className="mt-0.5 size-4.5" aria-hidden />
                {formatPhone(o.phone)}
              </a>
              <p className="flex items-start gap-3 sm:col-span-2">
                <MapPin className="mt-0.5 size-4.5 shrink-0 text-ink-400" aria-hidden />
                <span>
                  <b>{t.status.delivery[o.delivery_method]}</b>
                  {o.delivery_method === "courier" ? ` — ${o.region}, ${o.address}` : ""}
                </span>
              </p>
              {o.comment ? (
                <p className="flex items-start gap-3 rounded-xl bg-amber-50 p-3 text-sm sm:col-span-2">
                  <MessageSquare className="mt-0.5 size-4.5 shrink-0 text-amber-600" aria-hidden />
                  {o.comment}
                </p>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-2 font-display text-base font-semibold">{t.common.goods}</h2>
            <ul className="divide-y divide-ink-100">
              {o.items.map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3">
                  <span className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-ink-50">
                    {i.image ? <Image src={i.image} alt="" fill sizes="56px" className="object-contain p-1" /> : <ImageOff className="m-auto mt-4 size-5 text-ink-300" aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1 text-sm">
                    {i.slug ? (
                      <Link href={`/mahsulot/${i.slug}`} target="_blank" className="line-clamp-2 font-medium hover:text-leaf-700">
                        {i.name}
                      </Link>
                    ) : (
                      <span className="line-clamp-2 font-medium">{i.name}</span>
                    )}
                    <span className="text-ink-500">
                      {i.qty} × {formatMoney(i.price)}
                      {i.stock !== null && i.stock !== undefined ? t.admin.orders.stock(i.stock) : ""}
                    </span>
                  </span>
                  <span className="font-semibold">{formatMoney(i.line_total)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1.5 border-t border-ink-100 pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-ink-500">{t.common.goods}</dt><dd>{formatMoney(o.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">{t.common.delivery}</dt><dd>{o.delivery_fee ? formatMoney(o.delivery_fee) : t.common.free}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-500">{t.admin.orders.paymentMethod}</dt><dd>{t.status.payment[o.payment_method]}{o.installment_months ? t.admin.orders.installment(o.installment_months, formatMoney(o.installment_monthly ?? 0)) : ""}</dd></div>
              <div className="flex items-baseline justify-between pt-1"><dt className="font-semibold">{t.common.total}</dt><dd className="font-display text-xl font-bold">{formatMoney(o.total)}</dd></div>
            </dl>
          </Card>
        </div>

        <div className="space-y-5">
          {can(user, "manager") ? (
            <Card className="space-y-5 p-5">
              <Assign order={o} onDone={reload} />
              <StaffNote order={o} />
            </Card>
          ) : o.staff_note ? (
            <Card className="p-5 text-sm">
              <p className="mb-1 font-semibold">{t.admin.orders.internalNote}</p>
              {o.staff_note}
            </Card>
          ) : null}
          <Card className="p-5">
            <h2 className="mb-4 font-display text-base font-semibold">{t.admin.orders.history}</h2>
            <ol className="relative space-y-4 border-l-2 border-ink-100 pl-5">
              {o.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[27px] top-1 size-3 rounded-full bg-lime-400 ring-4 ring-white" aria-hidden />
                  <p className="text-sm font-semibold">{t.status.order[e.status] ?? e.status}</p>
                  {e.note ? <p className="text-sm text-ink-600">{e.note}</p> : null}
                  <p className="text-xs text-ink-400">
                    {formatDate(e.created_at, true)}
                    {e.user_name ? ` · ${e.user_name}` : ""}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
