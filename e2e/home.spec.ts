import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display header elements', async ({ page }) => {
    // Check logo
    await expect(page.getByAltText('نوجست')).toBeVisible()
    
    // Check tagline
    await expect(page.getByText('نو ( New ) + جَست ( Search )')).toBeVisible()
    
    // Check search bar
    await expect(page.getByPlaceholderText('جستجو...')).toBeVisible()
    
    // Check navigation buttons
    await expect(page.getByText('ارتباط با ما')).toBeVisible()
    await expect(page.getByText('ثبت محصول')).toBeVisible()
  })

  test('should handle search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholderText('جستجو...')
    await searchInput.fill('test product')
    await searchInput.press('Enter')
    
    // Wait for search results
    await page.waitForLoadState('networkidle')
    
    // Check if search results are displayed
    await expect(page.getByTestId('search-results')).toBeVisible()
  })

  test('should navigate to product submission page', async ({ page }) => {
    await page.getByText('ثبت محصول').click()
    await expect(page).toHaveURL('/submit-product')
  })

  test('should handle theme toggle', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /toggle theme/i })
    
    // Get initial theme
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    
    // Toggle theme
    await themeToggle.click()
    
    // Get new theme
    const newTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    
    // Verify theme changed
    expect(newTheme).not.toBe(initialTheme)
  })

  test('should handle responsive design', async ({ page }) => {
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.getByText('ارتباط با ما')).not.toBeVisible()
    await expect(page.getByText('ثبت محصول')).not.toBeVisible()
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.getByText('ارتباط با ما')).toBeVisible()
    await expect(page.getByText('ثبت محصول')).toBeVisible()
  })
}) 