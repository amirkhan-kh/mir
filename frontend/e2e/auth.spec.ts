import { creds } from "./factories";
import { expect, ru, test } from "./fixtures";

test.describe("auth", () => {
  test("[G-01][S3] /admin without a session redirects to login with next", async ({ page }) => {
    await page.goto("/admin/buyurtmalar");
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Fbuyurtmalar/);
    await expect(page.getByRole("heading", { name: ru.login.title })).toBeVisible();
  });

  test("[AUTH-02][S1] show/hide password toggles the input type without submitting", async ({ page }) => {
    await page.goto("/login");
    const pwd = page.getByRole("textbox", { name: ru.login.password });
    await pwd.fill("secret");
    await expect(pwd).toHaveAttribute("type", "password");
    await page.getByRole("button", { name: ru.login.show }).click();
    await expect(pwd).toHaveAttribute("type", "text");
    await page.getByRole("button", { name: ru.login.hide }).click();
    await expect(pwd).toHaveAttribute("type", "password");
    await expect(page).toHaveURL(/\/login/); // toggle never submits
  });

  test("[AUTH-01][S1] admin logs in and lands on the dashboard @backend", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(ru.login.login).fill(creds("admin").username);
    await page.getByRole("textbox", { name: ru.login.password }).fill(creds("admin").password);
    await page.getByRole("button", { name: ru.login.submit }).click();
    await page.waitForURL("/admin");
    await expect(page.getByRole("link", { name: ru.admin.nav.orders }).first()).toBeVisible();
  });

  test("[AUTH-01][S3] wrong password shows an error and stays on login @backend", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(ru.login.login).fill(`e2e-yoq-${Date.now()}`);
    await page.getByRole("textbox", { name: ru.login.password }).fill("notapassword");
    await page.getByRole("button", { name: ru.login.submit }).click();
    await expect(page.getByRole("alert").filter({ hasText: "Неверный" })).toContainText("Неверный логин или пароль");
    await expect(page).toHaveURL(/\/login/);
  });

  test("[AUTH-03][S3] external next target never leaves the site @backend", async ({ page }) => {
    await page.goto("/login?next=https://evil.example");
    await page.getByLabel(ru.login.login).fill(creds("admin").username);
    await page.getByRole("textbox", { name: ru.login.password }).fill(creds("admin").password);
    await page.getByRole("button", { name: ru.login.submit }).click();
    await page.waitForURL(/\/admin/);
    expect(new URL(page.url()).hostname).toBe("localhost");
  });
});
