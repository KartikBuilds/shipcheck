import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const path of ["/", "/login"]) {
  test(`no WCAG 2.1 AA violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(violations.map((v) => `${v.id}: ${v.nodes.length} element(s)`)).toEqual([]);
  });
}

test("no WCAG 2.1 AA violations on the signed-in dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(`a11y-${Date.now()}@shipcheck-demo.com`);
  await page.getByLabel("Password").fill("A11yTestPass2026");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Launch blockers" })).toBeVisible();
  const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
  expect(violations.map((v) => `${v.id}: ${v.nodes.length} element(s)`)).toEqual([]);
});
