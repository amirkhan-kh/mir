import { expect, parseMoney, ru, test } from "./fixtures";

test.describe("storefront", () => {
  test("[G-03][S1] header: logo home, search, cart and favorites links", async ({ page }) => {
    await page.goto("/katalog");
    await page.getByRole("banner").getByRole("link", { name: ru.logo.home }).click();
    await expect(page).toHaveURL("/");
    const userNav = page.getByRole("navigation", { name: ru.nav.user });
    await expect(userNav.getByRole("link", { name: ru.nav.favorites })).toBeVisible();
    await expect(userNav.getByRole("link", { name: ru.nav.cart })).toBeVisible();
  });

  test("[G-03][S2] mobile tab bar navigates and shows cart badge @mobile", async ({ page, catalog, shopper }) => {
    await shopper.setCart([shopper.line(catalog.rich, 2)]);
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: ru.nav.mainMenu });
    await expect(nav.getByRole("link", { name: ru.nav.cart })).toContainText("2");
    await nav.getByRole("link", { name: ru.nav.catalog }).click();
    await expect(page).toHaveURL(/\/katalog$/);
    await expect(page.getByRole("heading", { name: ru.catalog.all })).toBeVisible();
  });

  test("[G-03][S3] unknown product slug shows 404 page with a way back", async ({ page }) => {
    const res = await page.goto("/mahsulot/bu-mahsulot-yoq-404");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: ru.notFound.title })).toBeVisible();
    await page.getByRole("link", { name: ru.notFound.home, exact: true }).click();
    await expect(page).toHaveURL("/");
  });

  test("[SHOP-01][S1] hero carousel: dots switch the slide", async ({ page }) => {
    await page.goto("/");
    const dot2 = page.getByRole("button", { name: ru.hero.goTo(2) });
    await dot2.click();
    await expect(dot2).toHaveAttribute("aria-current", "true");
    await expect(page.getByRole("button", { name: ru.hero.goTo(1) })).not.toHaveAttribute("aria-current", "true");
  });

  test("[SHOP-02][S1] category tile opens the category catalog", async ({ page, request }) => {
    const cats = (await (await request.get("/api/v1/public/categories")).json()) as { name: string; slug: string; product_count: number }[];
    const cat = cats.find((c) => c.product_count > 0)!;
    await page.goto("/");
    await page.getByRole("link", { name: cat.name }).first().click();
    await expect(page).toHaveURL(`/katalog/${cat.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(cat.name);
  });

  test("[SHOP-03][S1] search finds matching products", async ({ page, catalog }) => {
    const word = catalog.rich.name.split(" ")[0];
    await page.goto("/");
    await page.getByPlaceholder(ru.header.searchPlaceholder).fill(word);
    await page.getByPlaceholder(ru.header.searchPlaceholder).press("Enter");
    await expect(page).toHaveURL(/\/katalog\?q=/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(ru.catalog.results(word));
    await expect(page.getByRole("link", { name: catalog.rich.name }).first()).toBeVisible();
  });

  test("[SHOP-03][S3] search with no match shows empty state and reset", async ({ page }) => {
    await page.goto("/katalog?q=zzz-hech-narsa-topilmaydi-991");
    await expect(page.getByText(ru.catalog.notFound)).toBeVisible();
    await page.getByRole("link", { name: ru.catalog.clear }).click();
    await expect(page.getByRole("heading", { name: ru.catalog.all })).toBeVisible();
  });

  test("[SHOP-04][S1] sort by price ascending orders the grid", async ({ page }) => {
    await page.goto("/katalog");
    await page.getByRole("combobox", { name: ru.catalog.sortLabel }).filter({ visible: true }).selectOption("cheap");
    await expect(page).toHaveURL(/sort=cheap/);
    await expect
      .poll(async () => {
        const texts = await page.locator("article p.font-display").allTextContents();
        const prices = texts.map(parseMoney);
        return prices.every((p, i) => i === 0 || p >= prices[i - 1]);
      })
      .toBe(true);
  });

  test("[SHOP-04][S2] filter state survives reload", async ({ page }) => {
    await page.goto("/katalog");
    // The real checkbox is sr-only; users click the styled label.
    await page.locator("label").filter({ hasText: ru.catalog.withDiscount }).filter({ visible: true }).click();
    await expect(page).toHaveURL(/discount=1/);
    await page.reload();
    await expect(page.getByRole("switch", { name: ru.catalog.withDiscount }).filter({ visible: true })).toBeChecked();
  });

  test("[SHOP-05][S1] product card: discount math and link to product page", async ({ page, catalog }) => {
    const p = catalog.inStock.find((x) => x.old_price)!;
    const off = Math.round(((p.old_price! - p.price) / p.old_price!) * 100);
    await page.goto(`/katalog?q=${encodeURIComponent(p.name)}`);
    const card = page.locator("article").filter({ hasText: p.name }).first();
    await expect(card.getByText(`−${off}%`)).toBeVisible();
    expect(parseMoney((await card.locator("p.font-display").textContent())!)).toBe(p.price);
    await card.getByRole("link", { name: p.name }).first().click();
    await expect(page).toHaveURL(`/mahsulot/${p.slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(p.name);
  });

  test("[SHOP-06][S1] product page SEO: title, canonical, JSON-LD, single h1", async ({ page, catalog }) => {
    const p = catalog.rich;
    await page.goto(`/mahsulot/${p.slug}`);
    await expect(page).toHaveTitle(new RegExp(p.name.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/mahsulot/${p.slug}$`));
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!) as { "@type": string; name: string };
    expect(ld["@type"]).toBe("Product");
    expect(ld.name).toBe(p.name);
    expect(await page.locator("h1").count()).toBe(1);
  });
});
