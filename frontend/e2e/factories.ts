import { expect, type APIRequestContext } from "@playwright/test";
import type { Category, Order, ProductCard } from "../src/shared/lib/types";

/** Test data only ever exists behind the real API (`E2E_BACKEND=1`). */

export const AUTH_DIR = "e2e/.auth";
export const ROLES = ["admin", "manager", "courier"] as const;
export type Role = (typeof ROLES)[number];

const CREDS: Record<Role, { username: string; password: string }> = {
  admin: { username: process.env.ADMIN_USERNAME ?? "admin", password: process.env.ADMIN_PASSWORD ?? "admin123" },
  manager: { username: "manager", password: "demo123" },
  courier: { username: "courier1", password: "demo123" },
};

export const creds = (role: Role) => CREDS[role];

export async function loginAs(ctx: APIRequestContext, role: Role) {
  const res = await ctx.post("/api/v1/auth/login", { data: CREDS[role] });
  expect(res.status(), `login as ${role}`).toBe(200);
  return (await res.json()) as { id: number; username: string; role: string };
}

export interface AdminProduct extends ProductCard {
  category_id: number;
  active: boolean;
  is_featured: boolean;
  sku: string | null;
}

export interface CheckoutBody {
  idempotency_key?: string | null;
  customer_name: string;
  phone: string;
  region: string;
  address: string;
  comment?: string;
  delivery_method: "courier" | "pickup";
  payment_method: "cash" | "card" | "installment";
  installment_months?: number | null;
  items: { product_id: number; qty: number }[];
}

export interface CreatedOrder {
  number: string;
  total: number;
  status: string;
  phone: string;
}

/** Fresh admin session + typed helpers. Every record gets a unique name so repeats never collide. */
export async function adminApi(ctx: APIRequestContext, unique: (p?: string) => string) {
  await loginAs(ctx, "admin");

  const json = async <T,>(res: Awaited<ReturnType<APIRequestContext["get"]>>, status = 200): Promise<T> => {
    expect(res.status(), `${res.url()} → ${await res.text()}`).toBe(status);
    return (await res.json()) as T;
  };

  const categories = async () => json<Category[]>(await ctx.get("/api/v1/public/categories"));

  const createCategory = async (over: Partial<{ name: string; active: boolean; sort: number; icon: string }> = {}) =>
    json<Category>(await ctx.post("/api/v1/categories", { data: { name: unique("Категория"), icon: "package", sort: 999, active: true, ...over } }), 201);

  const createProduct = async (over: Partial<Record<string, unknown>> = {}) => {
    const category_id = (over.category_id as number | undefined) ?? (await categories())[0].id;
    const name = (over.name as string | undefined) ?? unique("Товар");
    return json<AdminProduct>(
      await ctx.post("/api/v1/products", {
        data: {
          category_id,
          name,
          sku: unique("SKU").toUpperCase(),
          brand: "E2E",
          short_description: "Тестовый товар",
          description: "Создан автотестом",
          price: 1_000_000,
          old_price: null,
          stock: 5,
          images: [],
          specs: [{ label: "Тип", value: "тест" }],
          warranty_months: 12,
          is_featured: false,
          active: true,
          ...over,
        },
      }),
      201,
    );
  };

  const product = async (id: number) => json<AdminProduct>(await ctx.get(`/api/v1/products/${id}`));

  // Checkout is rate-limited per IP; the e2e stack raises the limit via CHECKOUT_RATE_LIMIT (docker-compose.yml).
  const checkout = async (body: CheckoutBody) => {
    const res = await ctx.post("/api/v1/public/orders", { data: { comment: "", installment_months: null, idempotency_key: null, ...body } });
    return { status: res.status(), body: (await res.json()) as CreatedOrder & { error?: string } };
  };

  const orderByNumber = async (number: string) => {
    const list = await json<{ items: (Order & { id: number })[] }>(await ctx.get(`/api/v1/orders?q=${encodeURIComponent(number)}&limit=5`));
    const o = list.items.find((x) => x.number === number);
    expect(o, `order ${number} in admin list`).toBeTruthy();
    return json<Order & { id: number; assignee_id: number | null; events: { status: string }[] }>(await ctx.get(`/api/v1/orders/${o!.id}`));
  };

  const setStatus = async (id: number, status: string, note = "") => {
    const res = await ctx.patch(`/api/v1/orders/${id}/status`, { data: { status, note } });
    return { status: res.status(), body: (await res.json().catch(() => ({}))) as Record<string, unknown> };
  };

  const assign = async (id: number, assignee_id: number | null) => (await ctx.patch(`/api/v1/orders/${id}/assign`, { data: { assignee_id } })).status();

  const staff = async () => json<{ items: { id: number; username: string; role: string }[] }>(await ctx.get("/api/v1/users?limit=50"));

  return { ctx, categories, createCategory, createProduct, product, checkout, orderByNumber, setStatus, assign, staff };
}

export type AdminApi = Awaited<ReturnType<typeof adminApi>>;

/** Valid checkout payload for one product; override what the test is about. */
export const checkoutBody = (p: { id: number }, unique: (p?: string) => string, over: Partial<CheckoutBody> = {}): CheckoutBody => ({
  idempotency_key: unique("idem"),
  customer_name: "Тест Покупатель",
  phone: "+996555123456",
  region: "Өзгөн",
  address: "ул. Тестовая, д. 1",
  delivery_method: "pickup",
  payment_method: "cash",
  items: [{ product_id: p.id, qty: 1 }],
  ...over,
});
