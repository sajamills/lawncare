import { test, expect } from "@playwright/test";

const viewports = [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

const screenshotWidths = new Set([375, 768, 1440]);

for (const vp of viewports) {
  test(`calendar has no horizontal overflow at ${vp.width}x${vp.height}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/dashboard/calendar");

    // Below 768px the calendar now defaults to list view (US-005); switch to
    // calendar view explicitly since these tests verify the grid layout itself.
    if (vp.width < 768) {
      await page.getByTestId("view-toggle-calendar").click();
    }

    const grid = page.getByTestId("calendar-grid");
    await expect(grid).toBeVisible();

    const documentOverflow = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(documentOverflow.scrollWidth).toBeLessThanOrEqual(documentOverflow.clientWidth);

    const jan = page.getByTestId("month-card-Jan");
    const dec = page.getByTestId("month-card-Dec");
    await expect(jan).toBeVisible();
    await expect(dec).toBeVisible();

    const decBox = await dec.boundingBox();
    expect(decBox).not.toBeNull();
    if (decBox) {
      expect(decBox.x).toBeGreaterThanOrEqual(0);
      expect(decBox.x + decBox.width).toBeLessThanOrEqual(vp.width + 1);
    }

    const overflowXAutoCount = await page.locator(".overflow-x-auto").count();
    expect(overflowXAutoCount).toBe(0);

    const gridOverflow = await grid.evaluate((el) => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }));
    expect(gridOverflow.scrollWidth).toBeLessThanOrEqual(gridOverflow.clientWidth);

    await page.getByTestId("view-toggle-list").click();
    await expect(grid).toBeHidden();
    await page.getByTestId("view-toggle-calendar").click();
    await expect(grid).toBeVisible();

    if (screenshotWidths.has(vp.width)) {
      await page.screenshot({
        path: `e2e/screenshots/calendar-${vp.width}x${vp.height}.png`,
        fullPage: true,
      });
    }
  });
}

test("defaults to list view on mobile width with no stored preference", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/dashboard/calendar");
  await expect(page.getByTestId("calendar-grid")).toBeHidden();
});

test("defaults to calendar view on desktop width with no stored preference", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard/calendar");
  await expect(page.getByTestId("calendar-grid")).toBeVisible();
});

test("remembers the selected view mode across reloads via localStorage", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/dashboard/calendar");
  await page.getByTestId("view-toggle-list").click();
  await expect(page.getByTestId("calendar-grid")).toBeHidden();

  await page.reload();
  await expect(page.getByTestId("calendar-grid")).toBeHidden();
  expect(await page.evaluate(() => localStorage.getItem("calendar_view_mode"))).toBe("list");
});
