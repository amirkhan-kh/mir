import type { SessionUser } from "../../core/auth.js";
import { pool, tx } from "../../core/db.js";
import { conflict, forbidden, invalid, notFound } from "../../core/http.js";
import { roundMoney } from "../../core/text.js";
import { getStore, type Store } from "../settings/repository.js";
import * as repo from "./repository.js";

export type Status = "new" | "confirmed" | "delivering" | "delivered" | "cancelled";

export const transitions: Record<Status, Status[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["delivering", "cancelled"],
  delivering: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

/** Courier may only move orders assigned to them along the delivery path. */
const courierMoves: Partial<Record<Status, Status[]>> = { confirmed: ["delivering"], delivering: ["delivered"] };

export interface Line {
  product_id: number;
  qty: number;
}

export interface CheckoutInput {
  idempotency_key: string | null;
  customer_name: string;
  phone: string;
  region: string;
  address: string;
  comment: string;
  delivery_method: "courier" | "pickup";
  payment_method: "cash" | "card" | "installment";
  installment_months: number | null;
  items: Line[];
}

const mergeLines = (lines: Line[]) => {
  const map = new Map<number, number>();
  for (const l of lines) map.set(l.product_id, (map.get(l.product_id) ?? 0) + l.qty);
  return [...map].map(([product_id, qty]) => ({ product_id, qty }));
};

export function pricing(
  store: Store,
  subtotal: number,
  delivery: "courier" | "pickup",
  payment: CheckoutInput["payment_method"],
  months: number | null,
) {
  const delivery_fee = delivery === "courier" && subtotal < store.free_delivery_from ? store.delivery_fee : 0;
  if (payment !== "installment") {
    return { subtotal, delivery_fee, total: roundMoney(subtotal + delivery_fee), installment_monthly: null };
  }
  const plan = store.installment.find((p) => p.months === months);
  if (!plan) throw invalid("Bunday muddatli to'lov rejasi yo'q");
  const total = Math.round(subtotal * (1 + plan.percent / 100) + delivery_fee);
  return { subtotal, delivery_fee, total, installment_monthly: Math.ceil(total / plan.months) };
}

/** Cart preview with live prices and stock — never trusts client prices. */
export async function quote(lines: Line[]) {
  const merged = mergeLines(lines);
  const [products, store] = await Promise.all([
    repo.readProducts(pool, merged.map((l) => l.product_id)),
    getStore(pool),
  ]);
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = merged.map((l) => {
    const p = byId.get(l.product_id);
    if (!p || !p.available) return { product_id: l.product_id, qty: l.qty, available: false, problem: "Sotuvda yo'q" };
    const problem = p.stock === 0 ? "Tugagan" : p.stock < l.qty ? `Faqat ${p.stock} dona qoldi` : null;
    return { ...p, product_id: p.id, qty: l.qty, line_total: roundMoney(p.price * l.qty), problem };
  });
  const subtotal = roundMoney(items.reduce((s, i) => s + (i.problem ? 0 : (i as { line_total: number }).line_total), 0));
  return {
    items,
    subtotal,
    delivery_fee: subtotal < store.free_delivery_from ? store.delivery_fee : 0,
    free_delivery_from: store.free_delivery_from,
    installment: store.installment.map((p) => {
      const total = Math.round(subtotal * (1 + p.percent / 100));
      return { ...p, total, monthly: Math.ceil(total / p.months) };
    }),
  };
}

export const create = (input: CheckoutInput) =>
  tx(async (db) => {
    if (input.idempotency_key) {
      const existing = await repo.byIdempotencyKey(db, input.idempotency_key);
      if (existing) return existing;
    }
    const lines = mergeLines(input.items);
    const products = await repo.lockProducts(db, lines.map((l) => l.product_id));
    const byId = new Map(products.map((p) => [p.id, p]));
    const items: repo.ItemRow[] = lines.map((l) => {
      const p = byId.get(l.product_id);
      if (!p || !p.available) throw conflict("Savatdagi ba'zi tovarlar sotuvdan olingan. Savatni yangilang");
      if (p.stock < l.qty) {
        throw conflict(
          p.stock === 0
            ? `"${p.name}" tugagan. Uni savatdan olib tashlang`
            : `"${p.name}" dan faqat ${p.stock} dona qoldi. Miqdorni kamaytiring`,
        );
      }
      return { product_id: p.id, name: p.name, image: p.image, price: p.price, qty: l.qty, line_total: roundMoney(p.price * l.qty) };
    });
    const store = await getStore(db);
    if (input.delivery_method === "courier" && !store.regions.includes(input.region)) {
      throw invalid("Bu hududga yetkazib berish mavjud emas");
    }
    const subtotal = roundMoney(items.reduce((s, i) => s + i.line_total, 0));
    const price = pricing(store, subtotal, input.delivery_method, input.payment_method, input.installment_months);
    const order = await repo.insertOrder(db, {
      idempotency_key: input.idempotency_key,
      customer_name: input.customer_name,
      phone: input.phone,
      region: input.region,
      address: input.address,
      comment: input.comment,
      delivery_method: input.delivery_method,
      payment_method: input.payment_method,
      installment_months: input.payment_method === "installment" ? input.installment_months : null,
      ...price,
    });
    if (!order) return repo.byIdempotencyKey(db, input.idempotency_key!);
    await repo.insertItems(db, order.id, items);
    for (const i of items) await repo.changeStock(db, i.product_id, -i.qty);
    await repo.addEvent(db, order.id, "new", "Buyurtma saytdan qabul qilindi", null);
    return order;
  });

export const changeStatus = (id: number, next: Status, note: string, user: SessionUser) =>
  tx(async (db) => {
    const order = await repo.lock(db, id);
    if (!order) throw notFound("Buyurtma topilmadi");
    const from = order.status as Status;
    if (user.role === "courier") {
      if (order.assignee_id !== user.id) throw forbidden("Bu buyurtma sizga biriktirilmagan");
      if (!courierMoves[from]?.includes(next)) throw forbidden("Kuryer faqat yetkazish holatini o'zgartiradi");
    }
    if (!transitions[from].includes(next)) {
      throw conflict(`Buyurtma holatini "${from}" dan "${next}" ga o'tkazib bo'lmaydi. Sahifani yangilang`);
    }
    const items = await repo.items(db, id);
    if (next === "cancelled") {
      for (const i of items) if (i.product_id) await repo.changeStock(db, i.product_id, i.qty);
    }
    if (next === "delivered") {
      for (const i of items) if (i.product_id) await repo.addSold(db, i.product_id, i.qty);
    }
    const row = await repo.setStatus(db, id, next);
    await repo.addEvent(db, id, next, note, user.id);
    return row;
  });

export const assign = (id: number, assigneeId: number | null, user: SessionUser) =>
  tx(async (db) => {
    const order = await repo.lock(db, id);
    if (!order) throw notFound("Buyurtma topilmadi");
    if (order.status === "delivered" || order.status === "cancelled") {
      throw conflict("Yopilgan buyurtmaga mas'ul biriktirib bo'lmaydi");
    }
    let note = "Mas'ul olib tashlandi";
    if (assigneeId !== null) {
      const staff = await repo.activeStaff(db, assigneeId);
      if (!staff) throw invalid("Xodim topilmadi yoki bloklangan");
      note = `Mas'ul: ${staff.full_name}`;
    }
    await repo.setAssignee(db, id, assigneeId);
    await repo.addEvent(db, id, order.status, note, user.id);
  });

export async function detail(id: number, user: SessionUser) {
  const order = await repo.byId(pool, id);
  if (!order) throw notFound("Buyurtma topilmadi");
  if (user.role === "courier" && order.assignee_id !== user.id) throw notFound("Buyurtma topilmadi");
  const [items, events] = await Promise.all([repo.items(pool, id), repo.events(pool, id)]);
  return { ...order, items, events, next: transitions[order.status as Status] };
}

export async function track(number: string, phone: string) {
  const order = await repo.byNumber(pool, number);
  if (!order || order.phone.slice(-9) !== phone.replace(/\D/g, "").slice(-9)) {
    throw notFound("Buyurtma topilmadi. Raqam va telefonni tekshiring");
  }
  const [items, events] = await Promise.all([repo.items(pool, order.id), repo.events(pool, order.id)]);
  const { idempotency_key, staff_note, assignee_id, ...safe } = order;
  void idempotency_key, void staff_note, void assignee_id;
  return {
    ...safe,
    items: items.map((i) => ({ name: i.name, image: i.image, price: i.price, qty: i.qty, line_total: i.line_total, slug: i.slug })),
    events: events.map((e) => ({ status: e.status, created_at: e.created_at })),
  };
}
