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

test('admin manages accounts and posts while protected accounts remain undeletable', async ({ page }, testInfo) => {
  const errors = captureBrowserErrors(page);
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole('region', { name: 'Dashboard statistics' })).toContainText('Total Admins');
  await page.getByRole('link', { name: 'Manage Users' }).click();
  await expect(page.getByRole('heading', { name: 'Manage Users' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Default admin cannot be deleted' })).toBeDisabled();
  const username = uniqueUsername('ari');
  await page.getByLabel('Display Name').fill('Ari North');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password').fill('secret');
  await page.getByLabel('Role').selectOption('user');
  await page.getByRole('button', { name: 'Create User' }).click();
  await expect(page.getByText('Ari North')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete Ari North' }).click();
  await expect(page.getByText('Ari North')).toHaveCount(0);
  await page.getByRole('link', { name: 'Back to Dashboard' }).click();
  await page.getByRole('link', { name: 'Write New Post' }).click();
  await page.getByLabel('Title').fill('Admin note');
  await page.getByLabel('Content').fill('A post managed by the site owner.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'Admin note' })).toBeVisible();
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Recent Posts' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Edit' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Delete', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('admin-management-desktop.png'), fullPage: true });
});

test('admin can edit and delete a post authored by another user', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.goto('/');
  await registerFromLanding(page, 'Post Author', uniqueUsername('author'));
  await page.getByRole('link', { name: 'Write', exact: true }).click();
  await page.getByLabel('Title').fill('Another users post');
  await page.getByLabel('Content').fill('Original content from a regular account.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'Another users post' })).toBeVisible();
  await page.getByRole('button', { name: 'Post Author' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'WriteSpace' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'All Blogs', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Another users post' })).toBeVisible();
  await page.getByRole('link', { name: 'Edit Another users post' }).click();
  await expect(page.getByRole('heading', { name: 'Edit Post' })).toBeVisible();
  await page.getByLabel('Content').fill('Edited by the administrator.');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('Edited by the administrator.')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByText('No blogs yet. Be the first to write one!')).toBeVisible();
  expect(errors).toEqual([]);
});

test('non-admin users cannot access admin pages', async ({ page }) => {
  const errors = captureBrowserErrors(page);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'WriteSpace' }).click();
  await registerFromLanding(page, 'Reader Admin Test', uniqueUsername('readeradmin'));
  await expect(page).toHaveURL(/\/blogs$/);
  await page.getByRole('button', { name: 'Reader Admin Test' }).click();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Login' }).click();
  await page.getByLabel('Username').fill('admin');
  await page.getByLabel('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'WriteSpace' }).click();
  await page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'All Blogs', exact: true }).click();
  await expect(page).toHaveURL(/\/blogs$/);
  expect(errors).toEqual([]);
});
