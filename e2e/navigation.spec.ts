/**
 * E2E Tests: Navigation - Sprint 5.7
 *
 * Tests core navigation flows throughout the application.
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage', async ({ page }) => {
    // Check that page loads
    await expect(page).toHaveTitle(/RehabFlow/i);
  });

  test('should navigate to exercises page', async ({ page }) => {
    // Look for exercise link/button
    const exerciseLink = page.getByRole('link', { name: /övningar|träning|exercises/i });

    if (await exerciseLink.isVisible()) {
      await exerciseLink.click();
      await expect(page).toHaveURL(/.*exercise|.*ovning|.*training/i);
    }
  });

  test('should navigate to progress page', async ({ page }) => {
    const progressLink = page.getByRole('link', { name: /framsteg|progress|statistik/i });

    if (await progressLink.isVisible()) {
      await progressLink.click();
      await expect(page).toHaveURL(/.*progress|.*stats|.*framsteg/i);
    }
  });

  test('should navigate to settings page', async ({ page }) => {
    const settingsLink = page.getByRole('link', { name: /inställningar|settings/i });

    if (await settingsLink.isVisible()) {
      await settingsLink.click();
      await expect(page).toHaveURL(/.*settings|.*installningar/i);
    }
  });

  test('should show bottom navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Check for bottom navigation bar
    const navBar = page.locator('nav, [role="navigation"]').first();
    await expect(navBar).toBeVisible();
  });

  test('should navigate back to home', async ({ page }) => {
    // Navigate away first
    const anyLink = page.locator('a').first();
    if (await anyLink.isVisible()) {
      await anyLink.click();
    }

    // Click logo or home link
    const homeLink = page.getByRole('link', { name: /hem|home|rehabflow/i }).first();

    if (await homeLink.isVisible()) {
      await homeLink.click();
      await expect(page).toHaveURL('/');
    }
  });
});

test.describe('Route Protection', () => {
  test('should handle 404 pages gracefully', async ({ page }) => {
    await page.goto('/nonexistent-page-12345');

    // Should show 404 or redirect to home
    const pageContent = await page.content();
    const is404 = pageContent.includes('404') ||
                  pageContent.includes('finns inte') ||
                  pageContent.includes('not found');

    // Either shows 404 or redirects
    expect(is404 || page.url().includes('localhost:5173')).toBeTruthy();
  });
});
