import { expect, test } from "@playwright/test";

test.describe("Home page", () => {
  test("loads key sections and CTA link", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Product Proof Feed" })).toBeVisible();
    await expect(page.locator("section#proof")).toBeVisible();

    const registerLink = page.locator('a[href="/auth/register"]').first();
    await expect(registerLink).toBeVisible();
  });

  test("switches role tabs in the roles section", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Pitch Deck v2.1")).toBeVisible();

    const roleButtons = page.locator("#roles button");
    await roleButtons.nth(1).click();
    await expect(page.getByText("$2.5M Target")).toBeVisible();

    await roleButtons.nth(2).click();
    await expect(page.getByText("02:00 PM")).toBeVisible();
  });
});
