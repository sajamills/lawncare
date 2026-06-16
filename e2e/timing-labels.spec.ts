import { test, expect, type Page } from "@playwright/test";

const currentWeek = 25;

const tasks = [
  {
    title: "Apply pre-emergent herbicide",
    category: "pest-weed",
    priority: "urgent",
    description: "Apply 3 lbs nitrogen per 1,000 sq ft before soil hits 55°F.",
  },
  {
    title: "Mow at 3.5 inches",
    category: "mow",
    priority: "routine",
    description: "Keep mowing height steady during heat season.",
  },
  {
    title: "Check irrigation coverage",
    category: "water",
    priority: "optional",
    description: "Inspect dry spots before adding more water.",
  },
];

const mockedPlan = Array.from({ length: 52 }, (_, index) => ({
  week: index + 1,
  tasks: index + 1 === currentWeek ? tasks : [],
}));

async function seedMockPlan(page: Page) {
  await page.route("**/api/parse-pdf", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ plan: mockedPlan }),
    });
  });

  await page.addInitScript(() => {
    sessionStorage.setItem(
      "onboarding_state",
      JSON.stringify({
        state: "AR",
        grass_type: "bermudagrass",
        square_footage: 5000,
        has_pets: false,
      })
    );
  });
}

test("dashboard task cards show plain-language timing labels", async ({ page }) => {
  await seedMockPlan(page);

  await page.goto("/dashboard");

  await expect(page.getByText("Due this week", { exact: true })).toBeVisible();
  await expect(page.getByText("Routine care", { exact: true })).toBeVisible();
  await expect(page.getByText("Optional", { exact: true })).toBeVisible();
  await expect(page.getByText("Apply pre-emergent herbicide")).toBeVisible();
  await expect(page.getByRole("link", { name: "Edit lawn details" })).toHaveAttribute(
    "href",
    "/profile"
  );
  await expect(
    page.getByText("Calculation: 3 lbs per 1,000 sq ft × 5,000 sq ft = 15.0 lbs total")
  ).toBeVisible();
});

test("calendar list task rows show plain-language timing labels", async ({ page }) => {
  await seedMockPlan(page);
  await page.addInitScript(() => {
    localStorage.setItem("calendar_view_mode", "list");
  });

  await page.goto("/dashboard/calendar");

  await expect(page.getByText("Due this week", { exact: true })).toBeVisible();
  await expect(page.getByText("Routine", { exact: true })).toBeVisible();
  await expect(page.getByText("Optional", { exact: true })).toBeVisible();
  await expect(page.getByText("Apply pre-emergent herbicide")).toBeVisible();
});
