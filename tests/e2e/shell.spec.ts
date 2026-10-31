import { expect, test } from "@playwright/test";

test("date range stays in the URL across client navigation", async ({ page }) => {
  await page.goto("/agency");
  await page.getByRole("button", { name: "Date range 22 Sep - 19 Oct" }).click();
  await page.getByRole("button", { name: "Last 7 days" }).click();
  await expect(page).toHaveURL(/range=7d/);

  await page.getByRole("button", { name: "Switch scope, Agency" }).click();
  await page.getByRole("button", { name: /Kestrel Outdoor/ }).click();

  await expect(page).toHaveURL(/\/clients\/kestrel/);
  await expect(page).toHaveURL(/range=7d/);
  await expect(page.getByRole("heading", { name: "Kestrel Outdoor" })).toBeVisible();
});
