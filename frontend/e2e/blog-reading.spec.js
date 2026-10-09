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

test('reader sees focused empty states, creates a post, and verifies collection persistence through navigation', async ({ page }, testInfo) => {
  const errors = captureBrowserErrors(page);
  await page.goto('/');
  await expect(page.getByText('No posts yet - check back soon!')).toBeVisible();
  await registerFromLanding(page, 'Reader One', uniqueUsername('reader'));
  await expect(page.getByRole('heading', { name: 'All Blogs' })).toBeVisible();
  await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
  await page.getByRole('link', { name: 'Write a Post', exact: true }).first().click();
  await page.getByLabel('Title').fill('A reader note');
  await page.getByLabel('Content').fill('A complete thought saved in this browser.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'A reader note' })).toBeVisible();
  await expect(page.getByText('A complete thought saved in this browser.')).toBeVisible();
  await page.getByRole('link', { name: 'Back to All Posts' }).first().click();
  await expect(page.getByRole('heading', { name: 'A reader note' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit A reader note' })).toBeVisible();
  await page.getByRole('link', { name: 'Write', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Write a Post' })).toBeVisible();
  await page.getByRole('link', { name: 'All Blogs' }).click();
  await expect(page.getByRole('heading', { name: 'A reader note' })).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('blog-reading-desktop.png'), fullPage: true });
});

test('guest clicks a populated public preview and is redirected to login', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.addInitScript(() => localStorage.setItem('writespace_posts', JSON.stringify([{
    id: 'public-preview',
    title: 'A public preview',
    content: 'A post available to preview before signing in.',
    createdAt: new Date().toISOString(),
    authorId: 'preview-author',
    authorName: 'Preview Author',
  }])));
  await page.goto('/');
  const preview = page.getByRole('link', { name: /A public preview/ });
  await expect(preview).toBeVisible();
  await preview.click();
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
});

test('missing post route redirects a guest to login', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.goto('/blog/missing');
  await expect(page).toHaveURL(/\/login$/);
  expect(errors).toEqual([]);
});

test('missing post route shows the not-found state for an authenticated reader', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.addInitScript(() => localStorage.setItem('writespace_session', JSON.stringify({ userId: 'reader-id', username: 'reader', displayName: 'Reader', role: 'user' })));
  await page.goto('/blog/missing');
  await expect(page.getByRole('heading', { name: 'Post not found' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('reader can delete their own post and sees the empty collection again', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.goto('/');
  await registerFromLanding(page, 'Delete Owner', uniqueUsername('owner'));
  await page.getByRole('link', { name: 'Write a Post', exact: true }).first().click();
  await page.getByLabel('Title').fill('Post to remove');
  await page.getByLabel('Content').fill('This post should be deleted by its author.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'Post to remove' })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
  expect(errors).toEqual([]);
});
