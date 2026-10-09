import { expect, test } from '@playwright/test';

const captureBrowserErrors = (page) => {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};

const uniqueUsername = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 10000)}`;

const register = async (page, { displayName, username, password = 'secret', confirmation = password }) => {
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill(displayName);
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByLabel('Confirm Password').fill(confirmation);
  await page.getByRole('button', { name: 'Get Started' }).click();
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('writespace-e2e-initialized')) {
      localStorage.clear();
      sessionStorage.setItem('writespace-e2e-initialized', 'true');
    }
  });
});

test('visitor discovers WriteSpace, registers, and retains a session after reload', async ({ page }, testInfo) => {
  const browserErrors = captureBrowserErrors(page);
  const username = uniqueUsername('mira');
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your thoughts\./ })).toBeVisible();
  await expect(page.getByText('No posts yet - check back soon!')).toBeVisible();
  await register(page, { displayName: 'Mira Vale', username });
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'WriteSpace' })).toBeVisible();
  await page.getByRole('button', { name: 'Mira Vale' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' })).toBeVisible();
  expect(browserErrors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('public-auth-desktop.png'), fullPage: true });
});

test('registration rejects empty, mismatched, and duplicate account details', async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  const username = uniqueUsername('duplicate');
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page.getByLabel('Display Name')).toHaveJSProperty('validity.valid', false);
  await page.getByLabel('Display Name').fill('Duplicate Check');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('different');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page.getByRole('alert')).toHaveText('Passwords do not match.');
  await expect.poll(() => page.evaluate(() => ({
    users: localStorage.getItem('writespace_users'),
    session: localStorage.getItem('writespace_session'),
  }))).toEqual({ users: null, session: null });
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await page.getByRole('button', { name: 'Duplicate Check' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill('Second Account');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page.getByRole('alert')).toHaveText('That username is already taken.');
  await expect.poll(() => page.evaluate(() => ({
    users: JSON.parse(localStorage.getItem('writespace_users') || '[]'),
    session: localStorage.getItem('writespace_session'),
  }))).toEqual({
    users: [{ id: expect.any(String), displayName: 'Duplicate Check', username, password: 'secret', role: 'user', createdAt: expect.any(String) }],
    session: null,
  });
  expect(browserErrors).toEqual([]);
});

test('login rejects invalid credentials and accepts the default admin', async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login', exact: true }).first().click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('alert')).toHaveText('Invalid username or password.');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  expect(browserErrors).toEqual([]);
});

test('landing layout remains usable on a mobile viewport', async ({ page }, testInfo) => {
  const browserErrors = captureBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Get Started', exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Write Freely' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('public-auth-mobile.png'), fullPage: true });
  expect(browserErrors).toEqual([]);
});

test('authenticated mobile navigation opens, closes, navigates, and logs out', async ({ page }) => {
  const browserErrors = captureBrowserErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await register(page, { displayName: 'Mobile Reader', username: uniqueUsername('mobile') });
  await expect(page).toHaveURL(/\/blogs$/);

  const menuButton = page.getByRole('button', { name: 'Open navigation menu' });
  await expect(menuButton).toBeVisible();
  await menuButton.click();
  await expect(page.getByRole('button', { name: 'Close navigation menu' })).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('link', { name: 'Write', exact: true }).first().click();
  await expect(page).toHaveURL(/\/write$/);
  await expect(page.getByRole('button', { name: 'Open navigation menu' })).toHaveAttribute('aria-expanded', 'false');

  await page.getByRole('button', { name: 'Open navigation menu' }).click();
  await page.getByRole('button', { name: 'Mobile Reader' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('writespace_session'))).toBeNull();
  expect(browserErrors).toEqual([]);
});
