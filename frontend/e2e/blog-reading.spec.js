import { expect, test } from '@playwright/test';

test('reader browses posts, opens a detail, and sees ownership controls', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill('Reader One');
  await page.getByLabel('Username').fill('reader1');
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
  await page.getByRole('link', { name: 'Write a Post' }).click();
  await page.getByLabel('Title').fill('A reader note');
  await page.getByLabel('Content').fill('A complete thought saved in this browser.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'A reader note' })).toBeVisible();
  await expect(page.getByText('A complete thought saved in this browser.')).toBeVisible();
  await page.getByRole('link', { name: 'Back to All Posts' }).click();
  await expect(page.getByRole('heading', { name: 'A reader note' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit A reader note' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'A reader note' })).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/blog-reading-desktop.png', fullPage: true });
});

test('guest is redirected from a protected post route and missing posts show a not-found state', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/blog/missing');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('link', { name: 'WriteSpace' }).click();
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill('Reader Two');
  await page.getByLabel('Username').fill('reader2');
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.goto('/blog/missing');
  await expect(page.getByRole('heading', { name: 'Post not found' })).toBeVisible();
  expect(errors).toEqual([]);
});
