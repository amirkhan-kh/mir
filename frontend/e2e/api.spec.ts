import { adminApi, checkoutBody, loginAs } from "./factories";
import { expect, test, type ApiErr } from "./fixtures";

/**
 * Invariant tests from docs/ARCHITECTURE.md against the real backend:
 * stock never negative, idempotent checkout, price snapshot, order state machine, authz.
 */
test.describe("API invariants @backend", () => {
  test("[API-ORD][S1] checkout decrements stock once and snapshots the price", async ({ request, unique }) => {
    const admin = await adminApi(request, unique);
    const p = await admin.createProduct({ stock: 5, price: 2_000_000 });

    const { status, body } = await admin.checkout(checkoutBody(p, unique, { items: [{ product_id: p.id, qty: 2 }] }));
    expect(status).toBe(201);
    expect(body.total).toBe(4_000_000);
    expect((await admin.product(p.id)).stock).toBe(3);

    // Later price edits never touch the created order (price snapshot).
    const current = await admin.product(p.id);
    const res = await request.patch(`/api/v1/products/${p.id}`, { data: { ...current, price: 9_000_000 } });
    expect(res.status()).toBe(200);
    const order = await admin.orderByNumber(body.number);
    expect(order.items[0].price).toBe(2_000_000);
    expect(order.total).toBe(4_000_000);
  });

  test("[API-ORD][S2] same idempotency key returns the same order, stock drops once", async ({ request, unique }) => {
    const admin = await adminApi(request, unique);
    const p = await admin.createProduct({ stock: 5 });
    const payload = checkoutBody(p, unique);

    const first = await admin.checkout(payload);
    const second = await admin.checkout(payload);
    expect(first.status).toBe(201);
    expect(second.status).toBe(201);
    expect(second.body.number).toBe(first.body.number);
    expect((await admin.product(p.id)).stock).toBe(4);
  });

  test("[API-ORD][S3] not enough stock → 409 and nothing is written", async ({ request, unique }) => {
    const admin = await adminApi(request, unique);
    const p = await admin.createProduct({ stock: 1 });

    const { status, body } = await admin.checkout(checkoutBody(p, unique, { items: [{ product_id: p.id, qty: 3 }] }));
    expect(status).toBe(409);
    expect(body.error).toContain(p.name);
    expect((await admin.product(p.id)).stock).toBe(1);
  });

  test("[API-ORD][S3] state machine rejects skips; cancel restores stock", async ({ request, unique }) => {
    const admin = await adminApi(request, unique);
    const p = await admin.createProduct({ stock: 5 });
    const { body } = await admin.checkout(checkoutBody(p, unique, { items: [{ product_id: p.id, qty: 2 }] }));
    const order = await admin.orderByNumber(body.number);

    // new → delivered is not a legal transition.
    expect((await admin.setStatus(order.id, "delivered")).status).toBe(409);

    // new → confirmed → cancelled restores the stock.
    expect((await admin.setStatus(order.id, "confirmed")).status).toBe(200);
    expect((await admin.setStatus(order.id, "cancelled", "тест")).status).toBe(200);
    expect((await admin.product(p.id)).stock).toBe(5);

    // Terminal state: no further moves.
    expect((await admin.setStatus(order.id, "confirmed")).status).toBe(409);
  });

  test("[API-AUTH][S1] login sets a session cookie that reaches staff routes", async ({ playwright, baseURL }) => {
    const ctx = await playwright.request.newContext({ baseURL });
    await loginAs(ctx, "manager");
    const res = await ctx.get("/api/v1/orders?limit=1");
    expect(res.status()).toBe(200);
    await ctx.dispose();
  });

  test("[API-AUTH][S3] 401 without cookie, 403 for the wrong role, 422 for a bad body", async ({ playwright, baseURL, request, unique }) => {
    // 401: no session at all.
    expect((await request.get("/api/v1/orders")).status()).toBe(401);

    // 403: courier may not manage products.
    const courier = await playwright.request.newContext({ baseURL });
    await loginAs(courier, "courier");
    expect((await courier.post("/api/v1/products", { data: { name: "x" } })).status()).toBe(403);
    await courier.dispose();

    // 422: checkout with an empty cart fails validation.
    const res = await request.post("/api/v1/public/orders", {
      data: { customer_name: "Тест", phone: "+996555323456", region: "Өзгөн", address: "", delivery_method: "pickup", payment_method: "cash", items: [] },
    });
    expect(res.status()).toBe(422);
    expect(((await res.json()) as ApiErr).error).toBeTruthy();
    void unique;
  });

  test("[API-ORD][S3] courier cannot move an order that is not assigned to them", async ({ request, playwright, baseURL, unique }) => {
    const admin = await adminApi(request, unique);
    const p = await admin.createProduct({ stock: 3 });
    const { body } = await admin.checkout(checkoutBody(p, unique));
    const order = await admin.orderByNumber(body.number);
    expect((await admin.setStatus(order.id, "confirmed")).status).toBe(200);

    const courier = await playwright.request.newContext({ baseURL });
    await loginAs(courier, "courier");
    const res = await courier.patch(`/api/v1/orders/${order.id}/status`, { data: { status: "delivering" } });
    expect([403, 404]).toContain(res.status());
    await courier.dispose();
    expect(((await admin.orderByNumber(body.number)) as { status: string }).status).toBe("confirmed");
  });
});
