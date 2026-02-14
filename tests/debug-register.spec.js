/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';

test('debug register form', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Log In').click();
  await page.getByRole('link', { name: 'Sign Up' }).click();
  
  // Wait for page to fully load
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(2000);
  
  // Check what's actually on the page
  const labels = await page.locator('label').all();
  console.log('Labels found:', labels.length);
  
  for (let i = 0; i < labels.length; i++) {
    const text = await labels[i].textContent();
    console.log(`Label ${i}: "${text}"`);
  }
  
  // Try alternative selectors
  const inputByPlaceholder = await page.locator('input[placeholder*="First"]').count();
  const inputByName = await page.locator('input[name*="first"]').count();
  const allInputs = await page.locator('input').count();
  
  console.log('Inputs with "First" placeholder:', inputByPlaceholder);
  console.log('Inputs with "first" name:', inputByName);  
  console.log('Total inputs:', allInputs);
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'register-page-debug.png' });
});