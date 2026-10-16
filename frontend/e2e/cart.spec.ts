import { expect, money, ru, test } from "./fixtures";

test.describe("cart and favorites", () => {
  test("[PDP-03][S1] add to cart from the product page", async ({ page, catalog, shopper }) => {
    const p = catalog.rich;
    await page.goto(`/mahsulot/${p.slug}`);
    await page.getByRole("button", { name: ru.card.addToCartLong }).first().click();
    await expect(page.getByRole("link", { name: ru.card.inCart }).first()).toBeVisible();
    const cart = await shopper.cart();
    expect(cart).toHaveLength(1);
    expect(cart[0]).toMatchObject({ id: p.id, qty: 1, price: p.price });
  });

  test("[PDP-03][S2] qty stepper respects bounds", async ({ page, catalog, shopper }) => {
    const p = catalog.inStock.find((x) => x.stock >= 2)!;
    await shopper.setCart([shopper.line(p, 1)]);
    await page.goto(`/mahsulot/${p.slug}`);
    await page.getByRole("button", { name: ru.card.inc(p.name) }).first().click();
    await expect.poll(async () => (await shopper.cart())[0]?.qty).toBe(2);
    await page.getByRole("button", { name: ru.card.dec(p.name) }).first().click();
    await expect.poll(async () => (await shopper.cart())[0]?.qty).toBe(1);
  });

  test("[PDP-04][S1] favorite toggle persists across reload", async ({ page, catalog, shopper }) => {
    const p = catalog.rich;
    await page.goto(`/mahsulot/${p.slug}`);
    await page.getByRole("button", { name: ru.card.favAdd(p.name) }).first().click();
    await expect.poll(() => shopper.favorites()).toContain(p.id);
    await page.goto("/sevimlilar");
    await expect(page.getByRole("link", { name: p.name }).first()).toBeVisible();
    await page.reload();
    await expect(page.getByRole("link", { name: p.name }).first()).toBeVisible();
    await page.getByRole("button", { name: ru.card.favRemove(p.name) }).first().click();
    await expect.poll(() => shopper.favorites()).not.toContain(p.id);
  });

  test("[PDP-04][S3] empty favorites shows hint with a way to the catalog", async ({ page }) => {
    await page.goto("/sevimlilar");
    await expect(page.getByText(ru.favorites.empty)).toBeVisible();
    await page.getByRole("link", { name: ru.favorites.toCatalog }).click();
    await expect(page).toHaveURL(/\/katalog/);
  });

  test("[CART-01][S1] totals update with qty; removing the last line empties the cart", async ({ page, catalog, shopper }) => {
    const p = catalog.inStock.find((x) => x.stock >= 3)!;
    await shopper.setCart([shopper.line(p, 1)]);
    await page.goto("/savat");
    await expect(page.getByText(money(p.price)).first()).toBeVisible();
    await page.getByRole("button", { name: ru.card.inc(p.name) }).click();
    await expect(page.getByText(money(p.price * 2)).first()).toBeVisible();
    await page.getByRole("button", { name: ru.cart.remove(p.name) }).click();
    await expect(page.getByText(ru.cart.empty)).toBeVisible();
  });

  test("[CART-01][S2] plus is disabled once qty reaches stock", async ({ page, catalog, shopper }) => {
    const p = [...catalog.inStock].sort((a, b) => a.stock - b.stock)[0];
    await shopper.setCart([shopper.line(p, Math.min(p.stock, 99))]);
    await page.goto("/savat");
    await expect(page.getByRole("button", { name: ru.card.inc(p.name) })).toBeDisabled();
  });

  test("[CART-01][S3] qty above live stock shows a problem and blocks checkout", async ({ page, catalog, shopper }) => {
    const p = catalog.inStock.find((x) => x.stock < 99)!;
    await shopper.setCart([{ ...shopper.line(p, p.stock + 1), stock: p.stock + 1 }]);
    await page.goto("/savat");
    await expect(page.getByText(ru.cart.problems)).toBeVisible();
    await expect(page.getByRole("link", { name: ru.cart.checkout })).toHaveAttribute("aria-disabled", "true");
  });

  test("[CART-02][S1] free delivery progress below and above the threshold", async ({ page, catalog, shopper }) => {
    const cheap = [...catalog.inStock].sort((a, b) => a.price - b.price)[0];
    const pricey = [...catalog.inStock].sort((a, b) => b.price - a.price)[0];
    await shopper.setCart([shopper.line(cheap, 1)]);
    await page.goto("/savat");
    const free = await page.evaluate(async () => {
      const res = await fetch("/api/v1/public/settings?lang=ru");
      return ((await res.json()) as { free_delivery_from: number }).free_delivery_from;
    });
    if (cheap.price < free) {
      await expect(page.getByText(ru.cart.untilFree)).toBeVisible();
    }
    if (pricey.price >= free) {
      await shopper.setCart([shopper.line(pricey, 1)]);
      await page.reload();
      await expect(page.getByText(ru.cart.freeDelivery)).toBeVisible();
      await expect(page.getByText(ru.common.free).first()).toBeVisible();
    }
  });

  test("[CART-02][S2] empty cart shows start-shopping action @mobile", async ({ page }) => {
    await page.goto("/savat");
    await expect(page.getByText(ru.cart.empty)).toBeVisible();
    await page.getByRole("link", { name: ru.cart.start }).click();
    await expect(page).toHaveURL(/\/katalog/);
  });
});
