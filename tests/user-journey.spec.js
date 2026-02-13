
/* eslint-disable testing-library/prefer-screen-queries */

import { test, expect } from '@playwright/test';

test.describe('E-commerce User Journey', () => {
  test('complete user flow: registration → login → add to cart → order → verification', async ({ page }) => {
    const timestamp = Date.now();
    const testUser = {
      firstName: 'John',
      lastName: 'Doe', 
      email: `testuser${timestamp}@example.com`,
      password: 'TestPassword123'
    };

    await page.goto('/');
    
    await page.getByText('Log In').click();
    await expect(page).toHaveURL('/login');
    
    await page.getByRole('link', { name: 'Sign Up' }).click();
    await expect(page).toHaveURL('/register');
    
    await page.getByLabel('First Name').fill(testUser.firstName);
    await page.getByLabel('Last Name').fill(testUser.lastName);
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    
    await page.getByRole('button', { name: 'Register' }).click();
    
    await expect(page).toHaveURL('/login', { timeout: 10000 });
    
    await page.getByLabel('Email').fill(testUser.email);
    await page.getByLabel('Password').fill(testUser.password);
    
    await page.getByRole('button', { name: 'Login' }).click();
    
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
    
    await page.getByRole('link', { name: 'Products' }).click();
    await expect(page).toHaveURL('/products');
    
    await page.waitForSelector('.product-card', { timeout: 10000 });
    
    const firstProduct = page.locator('.product-card').first();
    await firstProduct.getByRole('button', { name: 'Add to Cart' }).click();
    
    await expect(page.locator('.alert-success')).toContainText('added to cart');
    
    const secondProduct = page.locator('.product-card').nth(1);
    await secondProduct.getByRole('button', { name: 'Add to Cart' }).click();
    
    await expect(page.locator('.cart-count')).toContainText('2');
    
    await page.getByRole('link', { name: 'Cart' }).click();
    await expect(page).toHaveURL('/cart');
    
    await expect(page.locator('.cart-item')).toHaveCount(2);
    
    const totalPrice = await page.locator('.cart-total').textContent();
    expect(totalPrice).toBeTruthy();
    
    await page.getByRole('button', { name: 'Checkout' }).click();
    
    await expect(page.locator('.alert-success')).toContainText('Order placed successfully');
    await expect(page.locator('.cart-count')).toContainText('0');
    
    await page.getByRole('link', { name: 'Orders' }).click();
    await expect(page).toHaveURL('/orders');
    
    await page.waitForSelector('.order-item, .no-orders', { timeout: 10000 });
    
    const orderExists = await page.locator('.order-item').count();
    expect(orderExists).toBeGreaterThan(0);
    
    const firstOrder = page.locator('.order-item').first();
    await expect(firstOrder).toBeVisible();
    await expect(firstOrder.locator('.order-status')).toContainText('pending');
    await expect(firstOrder.locator('.order-items-count')).toContainText('2 items');
  });
});