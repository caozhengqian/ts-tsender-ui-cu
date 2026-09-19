import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/TSender/);
});

test('get started link', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Please connect')).toBeVisible();
});
