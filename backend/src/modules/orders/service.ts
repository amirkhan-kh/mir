import type { SessionUser } from "../../core/auth.js";
import { pool, tx } from "../../core/db.js";
import { conflict, forbidden, invalid, notFound } from "../../core/http.js";
import { msg, type Lang } from "../../core/i18n.js";
import { roundMoney } from "../../core/text.js";
import { getStore, type Store } from "../settings/repository.js";
import * as repo from "./repository.js";

const NOT_FOUND = msg("Заказ не найден", "Буйрутма табылган жок");

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
  if (!plan) throw invalid(msg("Такого плана рассрочки нет", "Мындай бөлүп төлөө планы жок"));
  const total = Math.round(subtotal * (1 + plan.percent / 100) + delivery_fee);
  return { subtotal, delivery_fee, total, installment_monthly: Math.ceil(total / plan.months) };
}

const PROBLEM = {
  gone: msg("Нет в продаже", "Сатыкта жок"),
  out: msg("Закончился", "Түгөндү"),
  few: (n: number) => msg(`Осталось только ${n} шт.`, `${n} даана гана калды`),
};

/** Cart preview with live prices and stock — never trusts client prices. */
export async function quote(lines: Line[], lang: Lang) {
  const merged = mergeLines(lines);
  const [products, store] = await Promise.all([
    repo.readProducts(pool, merged.map((l) => l.product_id), lang),
    getStore(pool),
  ]);
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = merged.map((l) => {
    const p = byId.get(l.product_id);
    if (!p || !p.available) return { product_id: l.product_id, qty: l.qty, available: false, problem: PROBLEM.gone[lang] };
    const problem = p.stock === 0 ? PROBLEM.out[lang] : p.stock < l.qty ? PROBLEM.few(p.stock)[lang] : null;
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
      if (!p || !p.available) throw conflict(msg("Некоторые товары из корзины сняты с продажи. Обновите корзину", "Себеттеги айрым товарлар сатыктан алынды. Себетти жаңылаңыз"));
      if (p.stock < l.qty) {
        throw conflict(
          p.stock === 0
            ? msg(`«${p.name}» закончился. Удалите его из корзины`, `«${p.name}» түгөндү. Аны себеттен алып салыңыз`)
            : msg(`«${p.name}»: осталось только ${p.stock} шт. Уменьшите количество`, `«${p.name}»: ${p.stock} даана гана калды. Санын азайтыңыз`),
        );
      }
      return { product_id: p.id, name: p.name, image: p.image, price: p.price, qty: l.qty, line_total: roundMoney(p.price * l.qty) };
    });
    const store = await getStore(db);
    if (input.delivery_method === "courier" && !store.regions.includes(input.region)) {
      throw invalid(msg("Доставка в этот регион недоступна", "Бул аймакка жеткирүү жок"));
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
    await repo.addEvent(db, order.id, "new", "Заказ принят с сайта", null);
    return order;
  });

export const changeStatus = (id: number, next: Status, note: string, user: SessionUser) =>
  tx(async (db) => {
    const order = await repo.lock(db, id);
    if (!order) throw notFound(NOT_FOUND);
    const from = order.status as Status;
    if (user.role === "courier") {
      if (order.assignee_id !== user.id) throw forbidden(msg("Этот заказ не назначен вам", "Бул буйрутма сизге бекитилген эмес"));
      if (!courierMoves[from]?.includes(next)) throw forbidden(msg("Курьер меняет только статус доставки", "Курьер жеткирүү абалын гана өзгөртөт"));
    }
    if (!transitions[from].includes(next)) {
      throw conflict(msg(`Нельзя перевести заказ из «${from}» в «${next}». Обновите страницу`, `Буйрутманы «${from}» абалынан «${next}» абалына өткөрүүгө болбойт. Баракты жаңылаңыз`));
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
    if (!order) throw notFound(NOT_FOUND);
    if (order.status === "delivered" || order.status === "cancelled") {
      throw conflict(msg("Нельзя назначить ответственного на закрытый заказ", "Жабылган буйрутмага жооптууну бекитүүгө болбойт"));
    }
    let note = "Ответственный снят";
    if (assigneeId !== null) {
      const staff = await repo.activeStaff(db, assigneeId);
      if (!staff) throw invalid(msg("Сотрудник не найден или заблокирован", "Кызматкер табылган жок же бөгөттөлгөн"));
      note = `Ответственный: ${staff.full_name}`;
    }
    await repo.setAssignee(db, id, assigneeId);
    await repo.addEvent(db, id, order.status, note, user.id);
  });

export async function detail(id: number, user: SessionUser) {
  const order = await repo.byId(pool, id);
  if (!order) throw notFound(NOT_FOUND);
  if (user.role === "courier" && order.assignee_id !== user.id) throw notFound(NOT_FOUND);
  const [items, events] = await Promise.all([repo.items(pool, id), repo.events(pool, id)]);
  return { ...order, items, events, next: transitions[order.status as Status] };
}

export async function track(number: string, phone: string) {
  const order = await repo.byNumber(pool, number);
  if (!order || order.phone.slice(-9) !== phone.replace(/\D/g, "").slice(-9)) {
    throw notFound(msg("Заказ не найден. Проверьте номер и телефон", "Буйрутма табылган жок. Номерди жана телефонду текшериңиз"));
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
