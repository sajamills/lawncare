import { test, expect } from "@playwright/test";

test.describe("onboarding final step - plan summary", () => {
  test("shows the ready heading, a summary card, and storage notes", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "onboarding_state",
        JSON.stringify({
          zip: "30301",
          state: "GA",
          grass_type: "bermudagrass",
          square_footage: 5400,
        })
      );
    });

    await page.goto("/onboarding/6");
    await expect(page.getByRole("heading", { name: "Your lawn plan is ready" })).toBeVisible();
    await expect(page.getByText("30301, GA")).toBeVisible();
    await expect(page.getByText("Bermudagrass")).toBeVisible();
    await expect(page.getByText("5,400 sq ft")).toBeVisible();
    await expect(page.getByText(/updated each week based on where you are in the year/)).toBeVisible();
    await expect(page.getByText(/Bookmark this page or use the Print option/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Go to my dashboard →" })).toBeVisible();
  });

  test("omits the lawn size row when not provided", async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem(
        "onboarding_state",
        JSON.stringify({ zip: "30301", state: "GA", grass_type: "bermudagrass" })
      );
    });

    await page.goto("/onboarding/6");
    await expect(page.getByText("Lawn size")).toBeHidden();
  });
});
