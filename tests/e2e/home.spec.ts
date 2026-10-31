import { expect, test } from "@playwright/test";

test("home page opens the agency overview", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/agency/);
  await expect(page).toHaveTitle("Pulse");
  await expect(page.getByRole("heading", { name: "Good morning, Casey" })).toBeVisible();
  await expect(page.getByText("Demo data").first()).toBeVisible();
});
