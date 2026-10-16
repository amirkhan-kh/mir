import { adminApi, checkoutBody } from "./factories";
import { expect, ru, test } from "./fixtures";

test.describe("order tracking @backend", () => {
  test("[TRK-01][S1] order number + phone shows the status stepper", async ({ page, request, unique }) => {
    const admin = await adminApi(request, unique);
    const p = await admin.createProduct({ stock: 3 });
    const { status, body } = await admin.checkout(checkoutBody(p, unique, { phone: "+996555987654" }));

    expect(status, JSON.stringify(body)).toBe(201);
    await page.goto("/kuzatish");
    await page.getByLabel(ru.track.number).fill(body.number);
    await page.getByLabel(ru.track.phone, { exact: false }).fill("+996555987654");
    await page.getByRole("button", { name: ru.track.submit }).click();
    await page.waitForURL(`/buyurtma/${body.number}`);
    await expect(page.getByText(ru.track.order(body.number))).toBeVisible();
    await expect(page.getByText(p.name).first()).toBeVisible();
  });

  test("[TRK-01][S2] phone matches on the last 9 digits in any format", async ({ page, request, unique }) => {
    const admin = await adminApi(request, unique);
    const p = await admin.createProduct({ stock: 3 });
    const { status, body } = await admin.checkout(checkoutBody(p, unique, { phone: "+996555987654" }));

    expect(status, JSON.stringify(body)).toBe(201);
    await page.goto("/kuzatish");
    await page.getByLabel(ru.track.number).fill(body.number.toLowerCase());
    await page.getByLabel(ru.track.phone, { exact: false }).fill("90 987 65 43");
    await page.getByRole("button", { name: ru.track.submit }).click();
    await page.waitForURL(`/buyurtma/${body.number}`);
    await expect(page.getByText(ru.track.order(body.number))).toBeVisible();
  });

  test("[TRK-01][S3] wrong phone leaks nothing", async ({ page, request, unique }) => {
    const admin = await adminApi(request, unique);
    const p = await admin.createProduct({ stock: 3 });
    const { status, body } = await admin.checkout(checkoutBody(p, unique, { phone: "+996555987654" }));

    expect(status, JSON.stringify(body)).toBe(201);
    await page.goto("/kuzatish");
    await page.getByLabel(ru.track.number).fill(body.number);
    await page.getByLabel(ru.track.phone, { exact: false }).fill("+996555111111");
    await page.getByRole("button", { name: ru.track.submit }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Заказ" })).toContainText("Заказ не найден");
    await expect(page).toHaveURL(/\/kuzatish/);
    await expect(page.getByText(p.name)).toHaveCount(0);
  });
});
