import { test, expect } from "@playwright/test";


test("landing page explains the product and links to the demo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("launch day");
  await page.getByRole("link", { name: "Try the demo" }).click();
  await expect(page).toHaveURL(/\/login/);
});

test("signed-out visitors are sent to sign in", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("a new user can sign up, add a blocker and close it", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(`e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@shipcheck-demo.com`);
  await page.getByLabel("Password").fill("E2eTestPass2026");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Launch blockers" })).toBeVisible();

  const title = `E2E check ${Date.now()}`;
  await page.getByLabel("Blocker").fill(title);
  await page.getByLabel("Severity").selectOption("high");
  await page.getByRole("button", { name: "Add blocker" }).click();
  const row = page.getByRole("listitem").filter({ hasText: title });
  await expect(row).toBeVisible();

  await row.getByLabel(`Status of ${title}`).selectOption("done");
  await row.getByRole("button", { name: "Update" }).click();
  const closed = page.getByRole("listitem").filter({ hasText: title });
  await expect(closed.locator("span", { hasText: /^Done$/ })).toBeVisible();
  await expect(closed.getByText(title)).toHaveClass(/line-through/);
});
