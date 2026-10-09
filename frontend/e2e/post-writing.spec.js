import { expect, test } from '@playwright/test';

test('reader creates a post, edits it, and sees the saved content after reload', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill('Writer One');
  await page.getByLabel('Username').fill('writer1');
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.getByRole('link', { name: 'Write' }).click();
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('alert')).toHaveText('Title is required.');
  await expect(page.getByText('Content is required.')).toBeVisible();
  await page.getByLabel('Title').fill('A saved thought');
  await page.getByLabel('Content').fill('The first version of this post.');
  await page.getByRole('button', { name: 'Publish Post' }).click();
  await expect(page.getByRole('heading', { name: 'A saved thought' })).toBeVisible();
  await page.getByRole('link', { name: 'Edit' }).click();
  await page.getByLabel('Content').fill('The revised version of this post.');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByText('The revised version of this post.')).toBeVisible();
  await page.reload();
  await expect(page.getByText('The revised version of this post.')).toBeVisible();
  expect(errors).toEqual([]);
  await page.screenshot({ path: 'test-results/post-writing-desktop.png', fullPage: true });
});

test('user cannot edit another account post', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Get Started Free' }).click();
  await page.getByLabel('Display Name').fill('Writer Two');
  await page.getByLabel('Username').fill('writer2');
  await page.getByLabel('Password', { exact: true }).fill('secret');
  await page.getByLabel('Confirm Password').fill('secret');
  await page.getByRole('button', { name: 'Get Started' }).click();
  await page.evaluate(() => localStorage.setItem('writespace_posts', JSON.stringify([{ id: 'other-post', title: 'Other post', content: 'Not yours', createdAt: new Date().toISOString(), authorId: 'someone-else', authorName: 'Someone Else' }])));
  await page.goto('/edit/other-post');
  await expect(page).toHaveURL(/\/blogs$/);
  expect(errors).toEqual([]);
});
