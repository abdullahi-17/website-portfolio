const { test: base, expect } = require('@playwright/test');

const projects = [
  ['cloud-portfolio', 'Portfolio website'],
  ['azure-retail-pipeline', 'Azure retail data pipeline'],
  ['spendwise', 'Spendwise'],
  ['paper-trading', 'Paper trading pipeline']
];

const test = base.extend({
  page: async ({ page }, use) => {
    const failures = [];
    page.on('pageerror', error => failures.push(error.message));
    page.on('response', response => {
      const url = new URL(response.url());
      if (url.origin === 'http://127.0.0.1:4173' && response.status() >= 400 && url.pathname !== '/favicon.ico') {
        failures.push(`${response.status()} ${url.pathname}`);
      }
    });
    await use(page);
    expect(failures, 'No JavaScript errors or failed local resources').toEqual([]);
  }
});

async function expectPageFits(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('navigation reaches each section', async ({ page }) => {
  await page.goto('/');
  for (const [name, id] of [['Work', 'work'], ['Phase 1', 'phase1'], ['About', 'about'], ['Contact', 'contact']]) {
    await page.getByRole('navigation').getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  await expectPageFits(page);
});

test('gallery preserves order and opens the school project', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.work-card h3')).toHaveText(projects.map(([, title]) => `${title} ↗`));
  await page.getByRole('button', { name: 'Cloud & Development', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cloud & Development', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.work-card:visible')).toHaveCount(4);
  await page.getByRole('button', { name: 'All work', exact: true }).click();
  await page.locator('.work-card a[href="project.html?id=azure-retail-pipeline"]').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Azure retail data pipeline');
  await page.getByRole('link', { name: '← Selected work', exact: true }).click();
  await expect(page).toHaveURL(/index\.html#work$/);
});

test('gallery buttons and arrow keys scroll the work', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const gallery = page.locator('#work-gallery');
  await page.getByRole('button', { name: 'Next work', exact: true }).click();
  await expect.poll(() => gallery.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  await gallery.focus();
  await gallery.press('ArrowLeft');
  await expect.poll(() => gallery.evaluate(element => element.scrollLeft)).toBeLessThan(2);
  await expect(page.getByRole('button', { name: 'Previous work', exact: true })).toBeDisabled();
});

test('image fan expands and retracts by hover or touch', async ({ page, isMobile }) => {
  await page.goto('/');
  const toggle = page.locator('.stack-toggle');
  if (isMobile) await toggle.tap();
  else await toggle.hover();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect.poll(() => page.locator('.stack-image').evaluateAll(images => {
    const rectangles = images.map(image => image.getBoundingClientRect());
    return rectangles.length === 5 &&
      rectangles.every(rectangle => rectangle.left >= 0 && rectangle.right <= innerWidth) &&
      rectangles[2].top < rectangles[1].top && rectangles[1].top < rectangles[0].top &&
      rectangles[2].top < rectangles[3].top && rectangles[3].top < rectangles[4].top;
  })).toBe(true);
  await expectPageFits(page);
  if (isMobile) await page.touchscreen.tap(5, 120);
  else await page.mouse.move(0, 0);
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('skip link and image fan work with a keyboard', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content', exact: true })).toBeFocused();
  const toggle = page.locator('.stack-toggle');
  await toggle.focus();
  await toggle.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await toggle.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.press('Space');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Tab');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('reduced motion disables image transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('.stack-toggle').focus();
  await page.locator('.stack-toggle').press('Enter');
  expect(await page.locator('.stack-image').first().evaluate(image => getComputedStyle(image).transitionDuration)).toBe('0s');
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

for (const [id, title] of projects) {
  test(`project page: ${title}`, async ({ page }) => {
    await page.goto(`/project.html?id=${id}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.locator('#case-image')).toBeVisible();
    await expect.poll(() => page.locator('#case-image').evaluate(image => image.complete && image.naturalWidth > 0)).toBe(true);
    await expect(page.locator('.case-section').first()).toBeVisible();
    if (id === 'spendwise') await expect(page.locator('#case-content')).toContainText('Development has not started');
    if (id === 'paper-trading') await expect(page.locator('#case-content')).toContainText('Most of the implementation was produced by AI');
    await expectPageFits(page);
  });
}

test('unknown project has a recovery link', async ({ page }) => {
  await page.goto('/project.html?id=not-a-project');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Project not found');
  await page.getByRole('link', { name: '← Selected work', exact: true }).click();
  await expect(page.locator('#work-gallery')).toBeVisible();
});
