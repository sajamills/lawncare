import { test, expect } from "@playwright/test";

test.describe("profile lawn size input", () => {
  test("strips non-digit characters as the user types", async ({ page }) => {
    await page.goto("/profile");
    const input = page.getByPlaceholder("e.g. 5,000");
    await input.fill("5,000abc");
    await expect(input).toHaveValue("5000");
  });

  test("shows validation error below 100 sq ft and clears above it", async ({ page }) => {
    await page.goto("/profile");
    const input = page.getByPlaceholder("e.g. 5,000");
    const error = page.getByText("Enter a lawn size of at least 100 sq ft");

    await input.fill("50");
    await expect(error).toBeVisible();

    await input.fill("500");
    await expect(error).toBeHidden();

    await input.fill("");
    await expect(error).toBeHidden();
  });

  test("label and helper note are present", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.getByText("Lawn Size (sq ft)", { exact: true })).toBeVisible();
    await expect(page.getByText("Used to calculate product quantities. Optional.")).toBeVisible();
  });
});
