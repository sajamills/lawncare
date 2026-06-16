import { test, expect } from "@playwright/test";

test.describe("onboarding step 5 - treatment history", () => {
  test("'None' option appears first with subtitle, and selecting it clears other selections", async ({ page }) => {
    await page.goto("/onboarding/5");

    const noneButton = page.getByRole("button", { name: /None — I'm just getting started/ });
    await expect(noneButton).toBeVisible();
    await expect(page.getByText("Skip ahead to get your plan")).toBeVisible();

    const allButtons = page.locator("div.flex.flex-col.gap-2 > button");
    await expect(allButtons.first()).toContainText("None — I'm just getting started");

    const fertilizeButton = page.getByRole("button", { name: "Applied fertilizer or lawn food" });
    await fertilizeButton.click();
    await noneButton.click();

    await expect(noneButton).toHaveCSS("border-width", "2px");
    await expect(fertilizeButton).toHaveCSS("border-width", "1px");
  });

  test("shows a filled checkmark on selected items and an empty circle otherwise", async ({ page }) => {
    await page.goto("/onboarding/5");

    const fertilizeButton = page.getByRole("button", { name: "Applied fertilizer or lawn food" });
    const checkCircle = fertilizeButton.locator("span.rounded-full");

    await expect(checkCircle).not.toContainText("✓");
    await fertilizeButton.click();
    await expect(checkCircle).toContainText("✓");
    await fertilizeButton.click();
    await expect(checkCircle).not.toContainText("✓");
  });
});
