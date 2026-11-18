const { test: base, expect } = require('@playwright/test');

const projects = [
  ['cloud-portfolio', 'Portfolio website'],
  ['azure-retail-pipeline', 'Azure retail data pipeline'],
  ['spendwise', 'SpendWise']
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
  for (const [name, id] of [['Work', 'work'], ['Skills', 'skills'], ['Phase 1', 'phase1'], ['About', 'about'], ['Contact', 'contact']]) {
    await page.getByRole('navigation').getByRole('link', { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
  await expectPageFits(page);
});

test('project overviews stack in order and only SpendWise links out', async ({ page }, testInfo) => {
  await page.goto('/#work');
  const cards = page.locator('.work-card');
  await expect(cards.locator('h3')).toHaveText(projects.map(([, title]) => title));
  await expect(cards.locator('.work-copy p')).toHaveCount(projects.length * 3);
  await expect(cards.getByRole('link')).toHaveCount(1);
  await expect(cards.last().getByRole('link')).toHaveAttribute('href', 'https://spendwise.abdullahiomer.com');
  for (let index = 0; index < projects.length; index++) {
    const card = cards.nth(index);
    await card.scrollIntoViewIfNeeded();
    const image = await card.locator('img').boundingBox();
    const copy = await card.locator('.work-copy').boundingBox();
    expect(Math.abs(image.width - copy.width)).toBeLessThan(2);
    expect(image.x < copy.x).toBe(index % 2 === 0);
    expect(Math.min(image.y + image.height, copy.y + copy.height)).toBeGreaterThan(Math.max(image.y, copy.y));
  }
  await expectPageFits(page);
  await page.locator('#work').screenshot({ path: testInfo.outputPath('selected-work.png') });
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
    if (id === 'spendwise') await expect(page.locator('#case-content')).toContainText('published browser demo');
    await expectPageFits(page);
  });
}

test('the removed project route has a recovery link', async ({ page }) => {
  await page.goto('/project.html?id=paper-trading');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Project not found');
  await page.getByRole('link', { name: '← Selected work', exact: true }).click();
  await expect(page.locator('#work-gallery')).toBeVisible();
});

test('motion keeps navigation and the case heading intact', async ({ page }, testInfo) => {
  await page.goto('/#work');
  await expect(page.locator('html')).toHaveClass(/\blenis\b/);
  // Activate the native anchor without Playwright first scrolling the header into view.
  await page.getByRole('navigation').getByRole('link', { name: 'About' }).evaluate(link => link.click());
  await expect(page).toHaveURL(/#about$/);
  await expect(page.locator('#about')).toBeInViewport();
  await page.goBack();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.locator('#work')).toBeInViewport();
  await page.goForward();
  await expect(page).toHaveURL(/#about$/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('html')).not.toHaveClass(/\blenis\b/);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    new MutationObserver(() => {
      if (document.querySelector('#case-title > span[aria-hidden=true] > span')) {
        document.documentElement.dataset.splitTitleMounted = '';
      }
    }).observe(document, { childList: true, subtree: true });
  });
  await page.goto('/project.html?id=cloud-portfolio');
  const title = page.getByRole('heading', { level: 1, name: 'Portfolio website' });
  await expect(title).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-split-title-mounted', '');
  await expect(title.locator('span')).toHaveCount(0);
  await page.locator('.case-header').screenshot({ path: testInfo.outputPath('case-header.png') });
  await expectPageFits(page);
});

test('a blocked motion bundle leaves project content and links available', async ({ page }) => {
  await page.route('**/assets/portfolio-motion.js', route => route.abort());
  await page.goto('/project.html?id=cloud-portfolio');
  await expect(page.getByRole('heading', { level: 1, name: 'Portfolio website' })).toBeVisible();
  await page.getByRole('link', { name: '← Selected work', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Selected work', exact: true })).toBeInViewport();
  await expect(page.locator('.work-card a')).toHaveCount(1);
});
