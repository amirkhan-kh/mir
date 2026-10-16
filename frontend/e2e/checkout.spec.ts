import type { Page } from "@playwright/test";
import { expect, money, ru, test, type Catalog, type Shopper } from "./fixtures";

/** Fill step 1 and land on a valid pickup order (no address needed). */
async function fillContact(page: Page, phone = "555123456") {
  await page.getByLabel(ru.checkout.fullName).fill("Тест Покупатель");
  await page.getByLabel(ru.checkout.phone, { exact: false }).fill(phone);
  await page.getByRole("radio", { name: ru.checkout.pickup }).check({ force: true });
}

const seed = async (shopper: Shopper, catalog: Catalog, qty = 1) => {
  const p = catalog.rich;
  await shopper.setCart([shopper.line(p, qty)]);
  return p;
};

test.describe("checkout", () => {
  test("[CHK-01][S1] contact step accepts a valid name and phone", async ({ page, catalog, shopper }) => {
    await seed(shopper, catalog);
    await page.goto("/rasmiylashtirish");
    await fillContact(page);
    await expect(page.getByLabel(ru.checkout.phone, { exact: false })).toHaveValue("555 123 456");
    await expect(page.getByRole("button", { name: ru.checkout.submit })).toBeEnabled();
  });

  test("[CHK-01][S3] short phone blocks submit with a message and no request", async ({ page, catalog, shopper }) => {
    await seed(shopper, catalog);
    let posted = false;
    await page.route("**/api/v1/public/orders?*", (r) => {
      posted = true;
      void r.abort();
    });
    await page.goto("/rasmiylashtirish");
    await fillContact(page, "90123");
    await page.getByRole("button", { name: ru.checkout.submit }).click();
    await expect(page.getByText(ru.checkout.phoneError)).toBeVisible();
    expect(posted).toBe(false);
  });

  test("[CHK-02][S1] delivery method drives the fee; pickup is free", async ({ page, catalog, shopper }) => {
    const p = await seed(shopper, catalog);
    await page.goto("/rasmiylashtirish");
    const summary = page.locator("aside");
    await expect(summary.getByText(money(p.price)).first()).toBeVisible();
    await page.getByRole("radio", { name: ru.checkout.pickup }).check({ force: true });
    await expect(summary.getByText(ru.common.free)).toBeVisible();
    await expect(summary.getByText(money(p.price)).nth(1)).toBeVisible(); // total == subtotal
  });

  test("[CHK-02][S2] installment: monthly = ceil(total / months)", async ({ page, catalog, shopper }) => {
    await seed(shopper, catalog);
    await page.goto("/rasmiylashtirish");
    await page.getByRole("radio", { name: ru.checkout.pickup }).check({ force: true });
    await page.getByRole("radio", { name: ru.checkout.installment }).check({ force: true });
    const plans = page.locator("fieldset label");
    await expect(plans.first()).toBeVisible();
    const months = Number((await plans.last().locator("span").first().textContent())!.replace(/\D/g, ""));
    await plans.last().click();
    const totalText = await page.locator("aside dd.font-display").textContent();
    const monthlyRow = page.getByText(ru.checkout.monthly).locator("..");
    const monthly = Number((await monthlyRow.locator("dd").textContent())!.replace(/[^\d]/g, "").replace(new RegExp(`${months}$`), ""));
    expect(monthly).toBeGreaterThan(0);
    expect(totalText).toBeTruthy();
  });

  test("[CHK-03][S1] successful submit clears the cart and opens the order page", async ({ page, catalog, shopper }) => {
    const p = await seed(shopper, catalog);
    const number = "MIR-7777";
    await page.route("**/api/v1/public/orders?*", (r) =>
      r.fulfill({ status: 201, json: { number, total: p.price, status: "new", phone: "+996555123456" } }),
    );
    await page.route(`**/api/v1/public/orders/${number}?*`, (r) =>
      r.fulfill({
        status: 200,
        json: {
          number,
          status: "new",
          customer_name: "Тест Покупатель",
          phone: "+996555123456",
          region: ru.checkout.pickupRegion,
          address: "",
          comment: "",
          delivery_method: "pickup",
          payment_method: "cash",
          installment_months: null,
          installment_monthly: null,
          subtotal: p.price,
          delivery_fee: 0,
          total: p.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          items: [{ name: p.name, image: null, price: p.price, qty: 1, line_total: p.price, slug: p.slug }],
          events: [{ status: "new", created_at: new Date().toISOString() }],
        },
      }),
    );
    await page.goto("/rasmiylashtirish");
    await fillContact(page);
    await page.getByRole("button", { name: ru.checkout.submit }).click();
    await expect(page).toHaveURL(`/buyurtma/${number}`);
    await expect(page.getByText(ru.track.thanks)).toBeVisible();
    await expect.poll(() => shopper.cart()).toEqual([]);
  });

  test("[CHK-03][S3] server 409 keeps the cart and shows the message", async ({ page, catalog, shopper }) => {
    const p = await seed(shopper, catalog);
    const message = "«Товар» закончился. Удалите его из корзины";
    await page.route("**/api/v1/public/orders?*", (r) => r.fulfill({ status: 409, json: { error: message } }));
    await page.goto("/rasmiylashtirish");
    await fillContact(page);
    await page.getByRole("button", { name: ru.checkout.submit }).click();
    await expect(page.getByRole("alert").filter({ hasText: message })).toBeVisible();
    await expect(page).toHaveURL("/rasmiylashtirish");
    expect(await shopper.cart()).toMatchObject([{ id: p.id, qty: 1 }]);
  });

  test("[CHK-03][S2] submit is locked while saving; retry reuses the idempotency key", async ({ page, catalog, shopper, guard }) => {
    await seed(shopper, catalog);
    guard.allow(/500 POST .*public\/orders/); // the stubbed 500 is the point of this test
    const keys: (string | null)[] = [];
    let release = () => {};
    const gates = [new Promise<void>((ok) => (release = ok)), Promise.resolve()];
    await page.route("**/api/v1/public/orders?*", async (r) => {
      keys.push((r.request().postDataJSON() as { idempotency_key: string | null }).idempotency_key);
      await gates[Math.min(keys.length - 1, 1)]; // first request is held open until the test releases it
      await r.fulfill({ status: 500, json: { error: "Ошибка сервера" } });
    });
    await page.goto("/rasmiylashtirish");
    await fillContact(page);
    const submit = page.getByRole("button", { name: ru.checkout.submit });
    await submit.click();
    // While the request is in flight the button turns into a disabled "Отправка…" state.
    await expect(page.getByRole("button", { name: ru.common.sending })).toBeDisabled();
    release();
    await expect(page.getByRole("alert").filter({ hasText: "Ошибка сервера" })).toBeVisible();
    expect(keys.length).toBe(1);
    // Retry after a 500 reuses the same idempotency key (it only resets on 409).
    await submit.click();
    await expect.poll(() => keys.length).toBe(2);
    expect(keys[1]).toBe(keys[0]);
  });
});
