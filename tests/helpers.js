// Test utilities and page object models

export class UserActions {
  constructor(page) {
    this.page = page;
  }

  async register(userData) {
    await this.page.getByRole('link', { name: 'Register' }).click();
    await this.page.getByLabel('First Name').fill(userData.firstName);
    await this.page.getByLabel('Last Name').fill(userData.lastName);
    await this.page.getByLabel('Email').fill(userData.email);
    await this.page.getByLabel('Password', { exact: true }).fill(userData.password);
    await this.page.getByLabel('Confirm Password').fill(userData.password);
    await this.page.getByRole('button', { name: 'Register' }).click();
  }

  async login(email, password) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async logout() {
    await this.page.getByRole('link', { name: 'Logout' }).click();
  }
}

export class ProductActions {
  constructor(page) {
    this.page = page;
  }

  async addToCart(productIndex = 0) {
    await this.page.getByRole('link', { name: 'Products' }).click();
    await this.page.waitForSelector('.product-card', { timeout: 10000 });
    
    const product = this.page.locator('.product-card').nth(productIndex);
    await product.getByRole('button', { name: 'Add to Cart' }).click();
  }

  async getCartItemCount() {
    const cartCount = await this.page.locator('.cart-count').textContent();
    return parseInt(cartCount) || 0;
  }
}

export class OrderActions {
  constructor(page) {
    this.page = page;
  }

  async checkout() {
    await this.page.getByRole('link', { name: 'Cart' }).click();
    await this.page.getByRole('button', { name: 'Checkout' }).click();
  }

  async viewOrders() {
    await this.page.getByRole('link', { name: 'Orders' }).click();
    await this.page.waitForSelector('.order-item, .no-orders', { timeout: 10000 });
  }

  async getOrderCount() {
    return await this.page.locator('.order-item').count();
  }
}

export function generateTestUser() {
  const timestamp = Date.now();
  return {
    firstName: 'Jan',
    lastName: 'Kowalski',
    email: `testuser${timestamp}@example.com`,
    password: 'TestPassword123'
  };
}

export const TEST_CONFIG = {
  TIMEOUTS: {
    NAVIGATION: 10000,
    ELEMENT_WAIT: 5000,
    API_RESPONSE: 15000
  },
  SELECTORS: {
    PRODUCT_CARD: '.product-card',
    CART_COUNT: '.cart-count',
    ORDER_ITEM: '.order-item',
    ALERT_SUCCESS: '.alert-success',
    ALERT_ERROR: '.alert-error, .alert-warning'
  }
};