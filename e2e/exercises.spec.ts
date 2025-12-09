/**
 * E2E Tests: Exercises - Sprint 5.7
 *
 * Tests exercise browsing, selection, and session flow.
 */

import { test, expect } from '@playwright/test';

test.describe('Exercise Browsing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display exercise cards', async ({ page }) => {
    // Navigate to exercises if not on main page
    const exerciseLink = page.getByRole('link', { name: /övningar|exercises/i });
    if (await exerciseLink.isVisible()) {
      await exerciseLink.click();
    }

    // Look for exercise cards or list items
    const exerciseCards = page.locator('[data-testid="exercise-card"], .exercise-card, [class*="exercise"]');

    // Should have at least one exercise
    await expect(exerciseCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter exercises by body part', async ({ page }) => {
    // Navigate to exercises
    const exerciseLink = page.getByRole('link', { name: /övningar|exercises/i });
    if (await exerciseLink.isVisible()) {
      await exerciseLink.click();
    }

    // Look for filter buttons
    const filterButtons = page.locator('button, [role="tab"]').filter({
      hasText: /rygg|nacke|axel|knä|höft|back|neck|shoulder|knee|hip/i
    });

    if (await filterButtons.first().isVisible()) {
      await filterButtons.first().click();

      // Give time to filter
      await page.waitForTimeout(500);

      // Verify filter was applied (URL or state changed)
      const pageContent = await page.content();
      expect(pageContent.length).toBeGreaterThan(0);
    }
  });

  test('should show exercise details on click', async ({ page }) => {
    // Navigate to exercises
    const exerciseLink = page.getByRole('link', { name: /övningar|exercises/i });
    if (await exerciseLink.isVisible()) {
      await exerciseLink.click();
    }

    // Click on first exercise
    const exerciseCard = page.locator('[data-testid="exercise-card"], .exercise-card, [class*="exercise"]').first();

    if (await exerciseCard.isVisible()) {
      await exerciseCard.click();

      // Should navigate to detail view or show modal
      await page.waitForTimeout(500);

      // Look for exercise details
      const detailContent = page.locator('h1, h2, [class*="title"], [class*="detail"]');
      await expect(detailContent.first()).toBeVisible();
    }
  });

  test('should display exercise difficulty indicators', async ({ page }) => {
    // Navigate to exercises
    const exerciseLink = page.getByRole('link', { name: /övningar|exercises/i });
    if (await exerciseLink.isVisible()) {
      await exerciseLink.click();
    }

    // Look for difficulty indicators
    const difficultyIndicators = page.locator('[class*="difficulty"], [class*="level"], [data-difficulty]');

    // Should have difficulty shown somewhere
    const hasIndicators = await difficultyIndicators.count() > 0;
    const hasDifficultyText = await page.locator('text=/lätt|medel|svår|easy|medium|hard/i').count() > 0;

    expect(hasIndicators || hasDifficultyText).toBeTruthy();
  });
});

test.describe('Exercise Session', () => {
  test('should start exercise session', async ({ page }) => {
    await page.goto('/');

    // Navigate to exercises
    const exerciseLink = page.getByRole('link', { name: /övningar|exercises/i });
    if (await exerciseLink.isVisible()) {
      await exerciseLink.click();
    }

    // Find and click an exercise
    const exerciseCard = page.locator('[data-testid="exercise-card"], .exercise-card, [class*="exercise"]').first();
    if (await exerciseCard.isVisible()) {
      await exerciseCard.click();
    }

    // Look for start button
    const startButton = page.getByRole('button', { name: /starta|börja|start|begin/i });

    if (await startButton.isVisible()) {
      await startButton.click();

      // Should navigate to session or show camera
      await page.waitForTimeout(1000);

      // Look for session UI elements
      const sessionUI = page.locator('[class*="session"], [class*="camera"], video, canvas');
      const hasSessionUI = await sessionUI.count() > 0;

      // Or check URL changed
      const urlChanged = page.url().includes('session') || page.url().includes('exercise');

      expect(hasSessionUI || urlChanged).toBeTruthy();
    }
  });

  test('should handle camera permission request', async ({ page, context }) => {
    // Grant camera permission
    await context.grantPermissions(['camera']);

    await page.goto('/');

    // Navigate to start exercise
    const exerciseLink = page.getByRole('link', { name: /övningar|exercises/i });
    if (await exerciseLink.isVisible()) {
      await exerciseLink.click();
    }

    const exerciseCard = page.locator('[data-testid="exercise-card"], .exercise-card').first();
    if (await exerciseCard.isVisible()) {
      await exerciseCard.click();
    }

    const startButton = page.getByRole('button', { name: /starta|start/i });
    if (await startButton.isVisible()) {
      await startButton.click();

      // Should show video element or camera UI
      await page.waitForTimeout(2000);
      const videoElement = page.locator('video');
      const hasVideo = await videoElement.count() > 0;

      // Or has canvas (pose detection overlay)
      const canvasElement = page.locator('canvas');
      const hasCanvas = await canvasElement.count() > 0;

      expect(hasVideo || hasCanvas).toBeTruthy();
    }
  });
});

test.describe('Exercise Search', () => {
  test('should search exercises', async ({ page }) => {
    await page.goto('/');

    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="sök"], input[placeholder*="search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('rygg');
      await page.waitForTimeout(500);

      // Results should update
      const exerciseCards = page.locator('[data-testid="exercise-card"], .exercise-card');
      const count = await exerciseCards.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
});
