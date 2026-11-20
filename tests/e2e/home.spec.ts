import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

// Read directly: Playwright loads tests as plain ES modules, without Next's JSON handling.
const company = JSON.parse(readFileSync(new URL('../../content/company.json', import.meta.url), 'utf8')) as {
  name: string;
  contact: { email: string; phone: string };
};

test('the home page shows the company and its contact details', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(company.name);
  await expect(page.getByRole('link', { name: company.contact.email })).toBeVisible();
});

test('AC-1: the phone number is a tel: link', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: company.contact.phone });
  await expect(link).toHaveAttribute('href', /^tel:/);
});

test('AC-2: the tel: link contains only digits', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: company.contact.phone });
  await expect(link).toHaveAttribute('href', `tel:${company.contact.phone.replace(/\D/g, '')}`);
});

test('AC-3: the phone link text is exactly as in company.json', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: company.contact.phone })).toHaveText(company.contact.phone);
});

test('AC-5: asking "Do you ship?" shows the shipping answer', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Your question').fill('Do you ship?');
  await page.getByRole('button', { name: 'Ask' }).click();
  await expect(page.getByText('Yes, within the United States', { exact: false }).first()).toBeVisible();
});

test('AC-3: no serious accessibility violations after a question is answered', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Your question').fill('Do you ship?');
  await page.getByRole('button', { name: 'Ask' }).click();
  await expect(page.getByText('Yes, within the United States', { exact: false }).first()).toBeVisible();
  await expect(page.getByLabel('Your question')).toBeFocused();

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => v.id)).toEqual([]);
});

async function askShip(page: Page) {
  await page.goto('/');
  await page.getByLabel('Your question').fill('Do you ship?');
  await page.getByRole('button', { name: 'Ask' }).click();
  await expect(page.locator('.chat-bubble.bot').first()).toBeVisible();
}

function tokenColor(page: Page, name: string) {
  return page.evaluate((n) => {
    const d = document.createElement('div');
    d.style.color = `var(${n})`;
    document.body.append(d);
    const c = getComputedStyle(d).color;
    d.remove();
    return c;
  }, name);
}

test('AC-1: the conversation shows no list bullets', async ({ page }) => {
  await askShip(page);
  await expect(page.locator('.chat-log')).toHaveCSS('list-style-type', 'none');
});

test('AC-2: questions sit right and replies left in rounded bubbles', async ({ page }) => {
  await askShip(page);
  const log = (await page.locator('.chat-log').boundingBox())!;
  const q = (await page.locator('.chat-bubble.user').boundingBox())!;
  const r = (await page.locator('.chat-bubble.bot').first().boundingBox())!;
  expect(Math.abs(q.x + q.width - (log.x + log.width))).toBeLessThan(2);
  expect(Math.abs(r.x - log.x)).toBeLessThan(2);
  await expect(page.locator('.chat-bubble.user')).not.toHaveCSS('border-top-left-radius', '0px');
  await expect(page.locator('.chat-bubble.bot').first()).not.toHaveCSS('border-top-left-radius', '0px');
});

for (const scheme of ['light', 'dark'] as const) {
  test(`AC-3: bubble colors use the tokens (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await askShip(page);
    const q = page.locator('.chat-bubble.user');
    await expect(q).toHaveCSS('background-color', await tokenColor(page, '--juniper'));
    await expect(q).toHaveCSS('color', await tokenColor(page, '--on-juniper'));
    await expect(page.locator('.chat-bubble.bot').first()).toHaveCSS(
      'background-color',
      await tokenColor(page, '--surface'),
    );
  });

  test(`AC-6: no serious accessibility violations with a conversation (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await askShip(page);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => v.id)).toEqual([]);
  });
}

test('AC-4: the From line is smaller than the reply and muted', async ({ page }) => {
  await askShip(page);
  const src = page.locator('.chat-bubble.bot .chat-source').first();
  await expect(src).toBeVisible();
  const sizes = await page.evaluate(() => {
    const b = document.querySelector('.chat-bubble.bot') as HTMLElement;
    const s = b.querySelector('.chat-source') as HTMLElement;
    return [
      Number.parseFloat(getComputedStyle(b.querySelector('p') as HTMLElement).fontSize),
      Number.parseFloat(getComputedStyle(s).fontSize),
    ];
  });
  expect(sizes[1] as number).toBeLessThan(sizes[0] as number);
  await expect(src).toHaveCSS('color', await tokenColor(page, '--muted'));
});

test('AC-5: input and button share a row, and no horizontal scroll at 375px', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await askShip(page);
  const input = (await page.getByLabel('Your question').boundingBox())!;
  const btn = (await page.getByRole('button', { name: 'Ask' }).boundingBox())!;
  const form = (await page.locator('.chat-form').boundingBox())!;
  expect(Math.abs(input.y + input.height - (btn.y + btn.height))).toBeLessThan(2);
  expect(input.x + input.width).toBeLessThanOrEqual(btn.x);
  expect(form.x + form.width - (btn.x + btn.width)).toBeLessThan(2);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test('the home page has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => v.id)).toEqual([]);
});
