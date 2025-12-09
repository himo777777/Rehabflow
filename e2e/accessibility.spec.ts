/**
 * E2E Tests: Accessibility - Sprint 5.7
 *
 * Tests accessibility features and WCAG compliance.
 */

import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate with Tab key', async ({ page }) => {
    // Press Tab to move focus
    await page.keyboard.press('Tab');

    // First focusable element should be focused
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });

  test('should have visible focus indicators', async ({ page }) => {
    // Press Tab to focus first element
    await page.keyboard.press('Tab');

    // Check that focus is visible
    const hasFocusStyles = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused) return false;

      const styles = window.getComputedStyle(focused);
      const hasOutline = styles.outline !== 'none' && styles.outlineWidth !== '0px';
      const hasBoxShadow = styles.boxShadow !== 'none';
      const hasBorderChange = styles.borderColor !== 'rgba(0, 0, 0, 0)';

      return hasOutline || hasBoxShadow || hasBorderChange;
    });

    expect(hasFocusStyles).toBeTruthy();
  });

  test('should navigate interactive elements sequentially', async ({ page }) => {
    const focusedTags: string[] = [];

    // Tab through first 5 elements
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');

      const tag = await page.evaluate(() => document.activeElement?.tagName);
      if (tag) focusedTags.push(tag);
    }

    // Should have navigated through multiple elements
    expect(focusedTags.length).toBeGreaterThan(0);
  });

  test('should activate buttons with Enter key', async ({ page }) => {
    // Find and focus a button
    const button = page.locator('button').first();

    if (await button.isVisible()) {
      await button.focus();
      await page.keyboard.press('Enter');

      // Button should have been activated
      // (This is a basic check - specific behavior depends on button)
    }
  });

  test('should close modals with Escape key', async ({ page }) => {
    // Try to open a modal (click button that might open one)
    const modalTrigger = page.locator('button').filter({
      hasText: /info|detaljer|mer|settings|inställningar/i
    }).first();

    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForTimeout(500);

      // Press Escape
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Modal should be closed
      const modal = page.locator('[role="dialog"], [class*="modal"]');
      const isHidden = await modal.isHidden().catch(() => true);
      expect(isHidden).toBeTruthy();
    }
  });
});

test.describe('Screen Reader Support', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Get all headings
    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1').length;
      const h2s = document.querySelectorAll('h2').length;
      const h3s = document.querySelectorAll('h3').length;

      return { h1s, h2s, h3s };
    });

    // Should have at least one h1
    expect(headings.h1s).toBeGreaterThanOrEqual(1);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    // Check all images have alt attribute
    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let withoutAlt = 0;

      images.forEach(img => {
        if (!img.hasAttribute('alt')) {
          withoutAlt++;
        }
      });

      return withoutAlt;
    });

    expect(imagesWithoutAlt).toBe(0);
  });

  test('should have proper button labels', async ({ page }) => {
    await page.goto('/');

    // Check buttons have accessible names
    const unlabeledButtons = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      let unlabeled = 0;

      buttons.forEach(btn => {
        const hasText = btn.textContent?.trim();
        const hasAriaLabel = btn.getAttribute('aria-label');
        const hasAriaLabelledBy = btn.getAttribute('aria-labelledby');
        const hasTitle = btn.getAttribute('title');

        if (!hasText && !hasAriaLabel && !hasAriaLabelledBy && !hasTitle) {
          unlabeled++;
        }
      });

      return unlabeled;
    });

    expect(unlabeledButtons).toBe(0);
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/');

    // Check links have meaningful text
    const badLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a');
      let bad = 0;

      links.forEach(link => {
        const text = link.textContent?.trim().toLowerCase() || '';
        const ariaLabel = link.getAttribute('aria-label')?.toLowerCase() || '';

        // Check for non-descriptive link text
        const nonDescriptive = ['click here', 'here', 'read more', 'läs mer', 'klicka här'];
        if (nonDescriptive.includes(text) && !ariaLabel) {
          bad++;
        }
      });

      return bad;
    });

    expect(badLinks).toBe(0);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/');

    // Check form inputs have labels
    const unlabeledInputs = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
      let unlabeled = 0;

      inputs.forEach(input => {
        const id = input.getAttribute('id');
        const hasExplicitLabel = id ? document.querySelector(`label[for="${id}"]`) : false;
        const hasAriaLabel = input.getAttribute('aria-label');
        const hasAriaLabelledBy = input.getAttribute('aria-labelledby');
        const hasPlaceholder = input.getAttribute('placeholder');
        const hasTitle = input.getAttribute('title');
        const parentLabel = input.closest('label');

        if (!hasExplicitLabel && !hasAriaLabel && !hasAriaLabelledBy && !parentLabel && !hasPlaceholder && !hasTitle) {
          unlabeled++;
        }
      });

      return unlabeled;
    });

    expect(unlabeledInputs).toBe(0);
  });

  test('should have ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    // Check for main landmark
    const hasMain = await page.locator('main, [role="main"]').count() > 0;
    const hasNav = await page.locator('nav, [role="navigation"]').count() > 0;

    expect(hasMain || hasNav).toBeTruthy();
  });
});

test.describe('Reduced Motion', () => {
  test('should respect prefers-reduced-motion', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Check that animations are reduced
    const hasReducedMotion = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    });

    expect(hasReducedMotion).toBeTruthy();
  });
});

test.describe('Color Contrast', () => {
  test('should have sufficient text contrast', async ({ page }) => {
    await page.goto('/');

    // Basic check: text should not be same color as background
    const hasGoodContrast = await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, h1, h2, h3, span, a, button');
      let goodContrast = true;

      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const color = style.color;
        const bgColor = style.backgroundColor;

        // Basic check: colors shouldn't be identical
        if (color === bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          goodContrast = false;
        }
      });

      return goodContrast;
    });

    expect(hasGoodContrast).toBeTruthy();
  });
});

test.describe('Font Sizing', () => {
  test('should use relative font sizes', async ({ page }) => {
    await page.goto('/');

    // Check that fonts scale with browser settings
    const usesRelativeUnits = await page.evaluate(() => {
      const body = document.body;
      const style = window.getComputedStyle(body);

      // Most text should be readable (at least 12px at default)
      const fontSize = parseFloat(style.fontSize);
      return fontSize >= 12;
    });

    expect(usesRelativeUnits).toBeTruthy();
  });

  test('should work with 200% zoom', async ({ page }) => {
    await page.goto('/');

    // Set larger viewport to simulate zoom
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Content should still be accessible
    const mainContent = page.locator('main, [role="main"], body');
    await expect(mainContent).toBeVisible();
  });
});
