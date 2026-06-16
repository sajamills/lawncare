import { test, expect } from "@playwright/test";

test.describe("FAQ page", () => {
  test("renders the title and all 8 questions, with answers revealed on expand", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.getByRole("heading", { name: "Frequently Asked Questions" })).toBeVisible();

    const questions = [
      "What if I don't know my grass type?",
      "What if I don't know my lawn size?",
      "What is a USDA growing zone?",
      "What is pre-emergent herbicide?",
      "Is the plan free?",
      "How is my plan saved?",
      "Is this safe around pets and children?",
      "Where does the advice come from?",
    ];
    for (const q of questions) {
      await expect(page.getByText(q, { exact: true })).toBeVisible();
    }

    const savedAnswer = page.getByText(/Your plan is saved on this device using browser storage/);
    await expect(savedAnswer).toBeHidden();
    await page.getByText("How is my plan saved?", { exact: true }).click();
    await expect(savedAnswer).toBeVisible();
  });

  test("landing page footer links to /faq", async ({ page }) => {
    await page.goto("/");
    const faqLink = page.getByRole("link", { name: "FAQ" });
    await expect(faqLink).toHaveAttribute("href", "/faq");
  });
});
