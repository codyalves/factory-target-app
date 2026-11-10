import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Read directly: Playwright loads tests as plain ES modules, without Next's JSON handling.
const company = JSON.parse(readFileSync(new URL('../../content/company.json', import.meta.url), 'utf8')) as {
  name: string;
  contact: { email: string };
};

test('the home page shows the company and its contact details', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(company.name);
  await expect(page.getByRole('link', { name: company.contact.email })).toBeVisible();
});

test('the home page has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => v.id)).toEqual([]);
});
