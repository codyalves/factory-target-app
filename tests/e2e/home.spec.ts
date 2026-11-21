import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, type Locator, type Page, test } from '@playwright/test';

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

async function boxOf(locator: Locator) {
  const b = await locator.boundingBox();
  if (!b) throw new Error('element has no bounding box');
  return b;
}

async function openChat(page: Page) {
  await page.getByRole('button', { name: 'Ask us a question' }).click();
}

test('AC-4: asking "Do you ship?" shows the shipping answer', async ({ page }) => {
  await page.goto('/');
  await openChat(page);
  await page.getByLabel('Your question').fill('Do you ship?');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
  await expect(page.getByText('Yes, within the United States', { exact: false }).first()).toBeVisible();
});

test('AC-3: no serious accessibility violations after a question is answered', async ({ page }) => {
  await page.goto('/');
  await openChat(page);
  await page.getByLabel('Your question').fill('Do you ship?');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
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
  await openChat(page);
  await page.getByLabel('Your question').fill('Do you ship?');
  await page.getByRole('button', { name: 'Ask', exact: true }).click();
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
  const input = await boxOf(page.getByLabel('Your question'));
  const btn = await boxOf(page.getByRole('button', { name: 'Ask', exact: true }));
  const form = await boxOf(page.locator('.chat-form'));
  expect(Math.abs(input.y + input.height - (btn.y + btn.height))).toBeLessThan(2);
  expect(input.x + input.width).toBeLessThanOrEqual(btn.x);
  expect(form.x + form.width - (btn.x + btn.width)).toBeLessThan(2);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(overflow).toBe(false);
});

test('AC-1: a round button fixed bottom-right opens the chat in a panel', async ({ page }) => {
  await page.goto('/');
  const launcher = page.getByRole('button', { name: 'Ask us a question' });
  await expect(launcher).toHaveCSS('position', 'fixed');
  await expect(launcher).toHaveCSS('border-top-left-radius', '50%');
  const vp = page.viewportSize() ?? { width: 0, height: 0 };
  const box = await boxOf(launcher);
  expect(vp.width - (box.x + box.width)).toBeLessThan(40);
  expect(vp.height - (box.y + box.height)).toBeLessThan(40);
  await expect(page.getByRole('dialog', { name: 'Chat' })).toBeHidden();
  await launcher.click();
  await expect(page.getByRole('dialog', { name: 'Chat' })).toBeVisible();
});

test('AC-2: the chat does not appear inline on the page', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByLabel('Your question')).toBeHidden();
  await expect(page.locator('main').getByRole('heading', { name: 'Ask us a question' })).toHaveCount(0);
});

test('AC-3: opening the panel focuses the question text box', async ({ page }) => {
  await page.goto('/');
  await openChat(page);
  await expect(page.getByLabel('Your question')).toBeFocused();
});

test('AC-4: the × button and Escape close the panel and return focus to the round button', async ({
  page,
}) => {
  await page.goto('/');
  const launcher = page.getByRole('button', { name: 'Ask us a question' });
  const panel = page.getByRole('dialog', { name: 'Chat' });
  await openChat(page);
  await page.getByRole('button', { name: 'Close chat' }).click();
  await expect(panel).toBeHidden();
  await expect(launcher).toBeFocused();
  await openChat(page);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(launcher).toBeFocused();
});

test('AC-5: the panel fills a 375px screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  await openChat(page);
  const box = await boxOf(page.getByRole('dialog', { name: 'Chat' }));
  expect(box.x).toBeLessThan(1);
  expect(Math.abs(box.width - 375)).toBeLessThan(1);
});

test('AC-5: from 52rem the panel is at most 24rem wide, bottom-right', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 800 });
  await page.goto('/');
  await openChat(page);
  const box = await boxOf(page.getByRole('dialog', { name: 'Chat' }));
  expect(box.width).toBeLessThanOrEqual(385);
  expect(1024 - (box.x + box.width)).toBeLessThan(40);
  expect(800 - (box.y + box.height)).toBeLessThan(40);
});

for (const scheme of ['light', 'dark'] as const) {
  test(`AC-6: no serious accessibility violations with the panel open (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');
    await openChat(page);
    await expect(page.getByLabel('Your question')).toBeFocused();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => v.id)).toEqual([]);
  });
}

test('AC-2: the Menu section lists sections, items, descriptions and prices', async ({ page }) => {
  await page.goto('/');
  const menu = page.locator('section#menu');
  await expect(menu.getByRole('heading', { level: 2, name: 'Menu' })).toBeVisible();
  await expect(menu.getByRole('heading', { level: 3 })).toHaveText([
    'Espresso bar',
    'Brewed',
    'Bakery',
    'Beans to take home',
  ]);
  await expect(menu.locator('li')).toHaveCount(15);
  await expect(menu.locator('li', { hasText: 'Cortado' })).toContainText(
    'Equal parts espresso and steamed milk.',
  );
});

test('AC-3: menu prices show two decimals', async ({ page }) => {
  await page.goto('/');
  const menu = page.locator('section#menu');
  await expect(menu.locator('li', { hasText: 'Cortado' })).toContainText('$4.00');
  await expect(menu.locator('li', { hasText: 'House blend, 5 lb' })).toContainText('$72.00');
});

test('AC-4: seasonal items show a Seasonal label', async ({ page }) => {
  await page.goto('/');
  const menu = page.locator('section#menu');
  await expect(menu.getByText('Seasonal', { exact: true })).toHaveCount(1);
  await expect(menu.locator('li', { hasText: 'Juniper honey latte' })).toContainText('Seasonal');
});

for (const scheme of ['light', 'dark'] as const) {
  test(`AC-7: no serious accessibility violations on the home page with the menu (${scheme})`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => v.id)).toEqual([]);
  });
}

test('the home page has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  expect(serious.map((v) => v.id)).toEqual([]);
});
