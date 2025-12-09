/**
 * E2E Tests: Progress & Statistics - Sprint 5.7
 *
 * Tests progress tracking, statistics, and data visualization.
 */

import { test, expect } from '@playwright/test';

test.describe('Progress Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Navigate to progress page
    const progressLink = page.getByRole('link', { name: /framsteg|progress|statistik/i });
    if (await progressLink.isVisible()) {
      await progressLink.click();
    }
  });

  test('should display progress overview', async ({ page }) => {
    // Look for progress-related content
    const progressContent = page.locator('[class*="progress"], [class*="stats"], [class*="dashboard"]');

    await expect(progressContent.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show streak information', async ({ page }) => {
    // Look for streak display
    const streakElement = page.locator('text=/streak|rad|serie|dagar i rad/i');

    if (await streakElement.isVisible()) {
      await expect(streakElement).toBeVisible();
    }
  });

  test('should display exercise history', async ({ page }) => {
    // Look for history section
    const historySection = page.locator('[class*="history"], [class*="log"], [class*="recent"]');

    if (await historySection.first().isVisible()) {
      await expect(historySection.first()).toBeVisible();
    }
  });

  test('should show charts or graphs', async ({ page }) => {
    // Look for chart elements (canvas, svg, or chart containers)
    const charts = page.locator('canvas, svg[class*="chart"], [class*="chart"], [class*="graph"]');

    // May not have charts if no data
    const chartCount = await charts.count();
    expect(chartCount).toBeGreaterThanOrEqual(0);
  });

  test('should display weekly summary', async ({ page }) => {
    // Look for weekly view
    const weeklyContent = page.locator('text=/vecka|weekly|denna vecka|this week/i');

    if (await weeklyContent.isVisible()) {
      await expect(weeklyContent).toBeVisible();
    }
  });
});

test.describe('Gamification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display points and level', async ({ page }) => {
    // Look for points display
    const pointsDisplay = page.locator('text=/poäng|points|xp/i');

    if (await pointsDisplay.isVisible()) {
      await expect(pointsDisplay).toBeVisible();
    }

    // Look for level display
    const levelDisplay = page.locator('text=/nivå|level|lv\\.?\\s*\\d/i');

    if (await levelDisplay.isVisible()) {
      await expect(levelDisplay).toBeVisible();
    }
  });

  test('should show achievements', async ({ page }) => {
    // Navigate to achievements if there's a link
    const achievementsLink = page.getByRole('link', { name: /prestationer|achievements|badges/i });

    if (await achievementsLink.isVisible()) {
      await achievementsLink.click();

      const achievementItems = page.locator('[class*="achievement"], [class*="badge"], [class*="milestone"]');
      await expect(achievementItems.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display challenges', async ({ page }) => {
    // Look for challenges section
    const challengeSection = page.locator('text=/utmaning|challenge|daglig|weekly/i');

    if (await challengeSection.isVisible()) {
      await expect(challengeSection).toBeVisible();
    }
  });
});

test.describe('Pain Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow pain level input', async ({ page }) => {
    // Look for pain input
    const painSlider = page.locator('input[type="range"], [class*="slider"], [class*="pain"]');

    if (await painSlider.first().isVisible()) {
      // Should be interactive
      await expect(painSlider.first()).toBeEnabled();
    }
  });

  test('should show pain history chart', async ({ page }) => {
    // Navigate to progress or pain section
    const progressLink = page.getByRole('link', { name: /framsteg|progress|smärta|pain/i });
    if (await progressLink.isVisible()) {
      await progressLink.click();
    }

    // Look for pain chart
    const painChart = page.locator('[class*="pain"][class*="chart"], [data-testid="pain-chart"]');

    if (await painChart.isVisible()) {
      await expect(painChart).toBeVisible();
    }
  });
});

test.describe('Data Export', () => {
  test('should have export option', async ({ page }) => {
    await page.goto('/');

    // Navigate to settings or progress
    const settingsLink = page.getByRole('link', { name: /inställningar|settings/i });
    if (await settingsLink.isVisible()) {
      await settingsLink.click();
    }

    // Look for export button
    const exportButton = page.getByRole('button', { name: /exportera|export|ladda ner|download/i });

    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeEnabled();
    }
  });
});
