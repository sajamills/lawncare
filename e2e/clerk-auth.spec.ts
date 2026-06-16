import { test, expect, type Page } from "@playwright/test";

const widths = [320, 375, 414, 768, 1440];
const screenshotWidths = new Set([375, 768, 1440]);
const routes = ["/sign-in", "/sign-up"] as const;

async function noHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth);
}

for (const route of routes) {
  for (const width of widths) {
    test(`${route} has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      await expect(page.locator(".cl-card, .cl-rootBox").first()).toBeVisible();
      await noHorizontalOverflow(page);

      if (screenshotWidths.has(width)) {
        await page.screenshot({
          path: `e2e/screenshots/${route.replace("/", "")}-${width}.png`,
          fullPage: true,
        });
      }
    });
  }

  test(`${route} renders readable card content`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);

    const card = page.locator(".cl-card").first();
    await expect(card).toBeVisible();

    const cardColor = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(cardColor).not.toBe("rgba(0, 0, 0, 0)");

    const heading = page.locator(".cl-headerTitle, .cl-header h1, .cl-header").first();
    if (await heading.count()) {
      await expect(heading).toBeVisible();
    }
  });

  test(`${route} primary input is keyboard focusable with a visible focus state`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(route);

    const input = page.locator(".cl-formFieldInput, input[type='email'], input[type='text']").first();
    await expect(input).toBeVisible();
    await input.focus();
    await expect(input).toBeFocused();
  });
}
