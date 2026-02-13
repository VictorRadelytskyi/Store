/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';

test('debug navigation flow', async ({ page }) => {
  await page.goto('/');
  
  console.log('Step 1: Homepage loaded');
  console.log('Current URL:', page.url());
  
  await page.getByText('Log In').click();
  await page.waitForURL('**/login');
  
  console.log('Step 2: Login page loaded');
  console.log('Current URL:', page.url());
  
  const signUpLink = page.getByRole('link', { name: 'Sign Up' });
  const signUpExists = await signUpLink.count();
  console.log('Sign Up link found:', signUpExists > 0);
  
  if (signUpExists > 0) {
    await signUpLink.click();
    await page.waitForURL('**/register');
    
    console.log('Step 3: Register page loaded');
    console.log('Current URL:', page.url());
    
    // Wait for the form to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Check what's actually on the page
    const pageContent = await page.content();
    const hasForm = pageContent.includes('First Name');
    console.log('Page contains "First Name":', hasForm);
    
    // Try different selectors
    const firstNameByPlaceholder = page.getByPlaceholder('First Name');
    const firstNameByTestId = page.getByTestId('firstName');
    const firstNameByInput = page.locator('input[type="text"]').first();
    
    console.log('First Name by placeholder:', await firstNameByPlaceholder.count() > 0);
    console.log('First Name by test id:', await firstNameByTestId.count() > 0);
    console.log('First text input:', await firstNameByInput.count() > 0);
    
    // List all form inputs
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    console.log('Total inputs found:', inputCount);
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const type = await input.getAttribute('type');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      console.log(`Input ${i}: type=${type}, placeholder=${placeholder}, id=${id}`);
    }
    
    // List all labels
    const labels = page.locator('label');
    const labelCount = await labels.count();
    console.log('Total labels found:', labelCount);
    
    for (let i = 0; i < labelCount; i++) {
      const label = labels.nth(i);
      const text = await label.textContent();
      const htmlFor = await label.getAttribute('for');
      console.log(`Label ${i}: text="${text}", for=${htmlFor}`);
    }
  }
});
