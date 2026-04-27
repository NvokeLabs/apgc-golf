import { test, expect } from '@playwright/test'

test('submit sponsor form successfully', async ({ page }) => {
  await page.goto('http://localhost:3000/register/sponsor')

  // Fill the form
  await page.fill('input[name="companyName"]', 'Test Company')
  await page.fill('input[name="contactName"]', 'John Doe')
  await page.fill('input[name="email"]', 'test@example.com')
  await page.fill('input[name="phone"]', '1234567890')

  // Select a tier (e.g. ALBATROS)
  await page.selectOption('select[name="selectedTier"]', { value: 'ALBATROS' })

  // Wait for API response after submission
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/sponsor-registrations') &&
      response.request().method() === 'POST',
  )

  await page.click('button[type="submit"]')

  const response = await responsePromise
  expect(response.status()).toBe(201)

  // Wait for redirect to success page
  await page.waitForURL(/\/register\/sponsor\/success/)
  expect(page.url()).toContain('/register/sponsor/success')
})
