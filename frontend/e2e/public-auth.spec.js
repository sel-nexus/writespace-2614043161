import { expect, test } from '@playwright/test';

test('visitor discovers WriteSpace, registers, and retains a session after reload', async ({ page }) => {
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Your thoughts\./ })).toBeVisible();
  await expect(page.getByText('No posts yet - check back soon!')).toBeVisible();
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill('Mira Vale');
  await page.getByLabel('Username').fill('mira');
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: 'WriteSpace' })).toBeVisible();
  await page.getByRole('button', { name: /Mira Vale/ }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
  expect(browserErrors).toEqual([]);
  await page.screenshot({ path: 'test-results/public-auth-desktop.png', fullPage: true });
});

test('login rejects invalid credentials and accepts the default admin', async ({ page }) => {
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.goto('/login');
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('wrong');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page.getByRole('alert')).toHaveText('Invalid username or password.');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  expect(browserErrors).toEqual([]);
});

test('landing layout remains usable on a mobile viewport', async ({ page }) => {
  const browserErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') browserErrors.push(message.text()); });
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Get Started' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Write Freely' })).toBeVisible();
  await page.screenshot({ path: 'test-results/public-auth-mobile.png', fullPage: true });
  expect(browserErrors).toEqual([]);
});
