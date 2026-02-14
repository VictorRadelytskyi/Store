/* eslint-disable testing-library/prefer-screen-queries */
import { test, expect } from '@playwright/test';

test.describe('E-commerce Full User Journey', () => {
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
    
    // Use a more specific button selector
    await page.locator('button:has-text("Log In")').click();
    
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Logout')).toBeVisible();
    
    // Wait for products to load on the home page (using Col elements that contain Item components)
    await page.waitForSelector('.col-md-4', { timeout: 5000 });
    
    // Navigate to the product page
    await page.goto('http://localhost:3000/products/5');

    // Option A: Select by the exact button text (Most reliable for user-facing tests)
    const addToCartButton = page.getByRole('button', { name: /add to cart/i });
    await addToCartButton.click();
    
    await expect(page.locator('.alert-success')).toContainText('Added product to the cart');
    
    // Go back to home page for second product
    await page.getByRole('button', { name: '← Back to Products' }).click();
    await expect(page).toHaveURL('/');
    
    // Navigate manually to second product (assuming product ID 3 exists)
    await page.goto('http://localhost:3000/products/6');
    await page.waitForLoadState('load');
    
    // NEW: Wait for a global UI element that only exists when AUTH is ready
    // This ensures the button 'disabled' logic has all the data it needs to flip to enabled
    await expect(page.getByText('Logout')).toBeVisible();

    // Now wait for the product content
    await page.waitForSelector('.card-title, h3', { timeout: 10000 });

    const addToCartButton2 = page.locator('button').filter({ hasText: /Add to Cart/ });
    await expect(addToCartButton2).toBeEnabled({ timeout: 10000 }); 
    await addToCartButton2.click();
    
    await expect(page.locator('.alert-success')).toContainText('Added product to the cart');
    
    // Navigate to cart to verify items were added
    await page.getByRole('button', { name: '← Back to Products' }).click();
    await expect(page).toHaveURL('/');
    
    // Go to cart
// The 'exact: true' property ensures it won't match 'Add to Cart'
    await page.getByRole('button', { name: 'Cart', exact: true }).click();
    await expect(page).toHaveURL('/cart');
    
    // Verify cart has 2 items (each CartItem is a Row with border-bottom class)
    await expect(page.locator('.border-bottom')).toHaveCount(2);
    
    // Verify total price is displayed
    await expect(page.locator('h5:has-text("Total: $")')).toBeVisible();
    
    // Checkout
    await page.getByRole('button', { name: 'Checkout' }).click();
    
    // Verify cart is now empty (no cart items should be displayed)
    await expect(page.locator('.border-bottom')).toHaveCount(0);
    await expect(page.getByText('Your cart is empty')).toBeVisible();
    
    await page.getByRole('button', { name: 'Orders' }).click();
    await expect(page).toHaveURL('/orders');
    
    // 1. Specifically target the Order Header text to ensure content exists
    await page.waitForSelector('h6:has-text("Order #")', { timeout: 10000 });

    // 2. Use a more reliable locator for the Card components
    const orderCards = page.locator('.card');

    // 3. Count and Assert
    const orderCount = await orderCards.count();
    expect(orderCount).toBeGreaterThan(0);
    
    // Verify the first order has proper status and content
    const firstOrder = orderCards.first();
    await expect(firstOrder).toBeVisible();
    
    // 1. Wait for any element with the text 'Pending' to appear. 
    // This acts as a global 'data has loaded' check.
    await expect(page.getByText(/Pending/i)).toBeVisible({ timeout: 15000 });

    // 2. Now that we know data is there, locate the specific card that contains 'Pending'
    const orderCard = page.locator('.card').filter({ hasText: /Pending/i }).first();

    // 3. Verify the rest of the order details inside that specific card
    await expect(orderCard).toContainText(/Order #/i);
    await expect(orderCard).toContainText(/Total: \$/i);
    });
});