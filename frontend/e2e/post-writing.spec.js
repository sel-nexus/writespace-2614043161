import { expect, test } from '@playwright/test';

const captureBrowserErrors = (page) => {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};

const uniqueUsername = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 10000)}`;

const registerFromLanding = async (page, displayName, username) => {
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill(displayName);
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
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

test('writer validates empty fields, creates, edits, and verifies persistence through the collection', async ({ page }, testInfo) => {
  const errors = captureBrowserErrors(page);
  await page.goto('/');
  await registerFromLanding(page, 'Writer One', uniqueUsername('writer'));
  await page.getByRole('link', { name: 'Write', exact: true }).click();
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Title is required.' })).toBeVisible();
  await expect(page.getByRole('alert').filter({ hasText: 'Content is required.' })).toBeVisible();
  await page.getByLabel('Title').fill('A saved thought');
  await page.getByLabel('Content').fill('The first version of this post.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'A saved thought' })).toBeVisible();
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByLabel('Content').fill('The revised version of this post.');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('The revised version of this post.')).toBeVisible();
  await page.getByRole('link', { name: /Back to All Posts/ }).click();
  await expect(page.getByRole('heading', { name: 'A saved thought' })).toBeVisible();
  await expect(page.getByText('The revised version of this post.')).toBeVisible();
  await page.getByRole('link', { name: 'Write', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Write a Post' })).toBeVisible();
  await page.getByRole('link', { name: 'All Blogs' }).click();
  await expect(page.getByRole('heading', { name: 'A saved thought' })).toBeVisible();
  await expect(page.getByText('The revised version of this post.')).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('post-writing-desktop.png'), fullPage: true });
});

test('another user sees no edit action and cannot open the owner edit route', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.goto('/edit/missing');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'WriteSpace' }).click();
  await registerFromLanding(page, 'Owner Account', uniqueUsername('owner'));
  await page.getByRole('link', { name: 'Write', exact: true }).click();
  await page.getByLabel('Title').fill('Owner only post');
  await page.getByLabel('Content').fill('This post belongs to a different account.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'Owner only post' })).toBeVisible();
  await page.getByRole('link', { name: /Back to All Posts/ }).click();
  await expect(page.getByRole('link', { name: 'Read Owner only post' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit Owner only post' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Owner Account' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Get Started', exact: true }).click();
  await page.getByLabel('Display Name').fill('Different Reader');
  await page.getByLabel('Username').fill(uniqueUsername('reader'));
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await expect(page.getByRole('link', { name: 'Edit Owner only post' })).toHaveCount(0);
  await page.getByRole('link', { name: 'Read Owner only post' }).click();
  await expect(page.getByRole('heading', { name: 'Owner only post' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Write', exact: true }).click();
  await expect(page).toHaveURL(/\/write$/);
  await page.getByRole('link', { name: 'All Blogs' }).click();
  await page.getByRole('link', { name: 'Read Owner only post' }).click();
  await expect(page.getByRole('link', { name: 'Edit', exact: true })).toHaveCount(0);
  await page.goto('/edit/owner-only-post');
  await expect(page).toHaveURL(/\/blogs$/);
  expect(errors).toEqual([]);
});

test('registered author completes a create, read, edit, and delete journey', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.goto('/');
  await registerFromLanding(page, 'Journey Author', uniqueUsername('journey'));
  await page.getByRole('link', { name: 'Write a Post', exact: true }).first().click();
  await page.getByLabel('Title').fill('Journey post');
  await page.getByLabel('Content').fill('First draft for the full journey.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'Journey post' })).toBeVisible();
  await expect(page.getByText('First draft for the full journey.')).toBeVisible();
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByLabel('Content').fill('Updated draft for the full journey.');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('Updated draft for the full journey.')).toBeVisible();
  await page.getByRole('link', { name: /Back to All Posts/ }).click();
  await expect(page.getByRole('heading', { name: 'Journey post' })).toBeVisible();
  await page.getByRole('link', { name: 'Read Journey post' }).click();
  await expect(page.getByText('Updated draft for the full journey.')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
  expect(errors).toEqual([]);
});
