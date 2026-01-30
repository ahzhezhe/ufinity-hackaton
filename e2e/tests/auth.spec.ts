import { test, expect, uniqueEmail, login, register, logout, createUserViaAPI } from './helpers';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');

      await expect(page.getByRole('heading', { name: 'Hot Desk Booking' })).toBeVisible();
      await expect(page.getByText('Sign in to your account')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toContainText('Sign In');
    });

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login');
      await page.click('button[type="submit"]');

      await expect(page.getByText('Invalid email')).toBeVisible();
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.fill('input[type="email"]', 'nonexistent@test.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      await expect(page.getByText('Invalid email or password')).toBeVisible();
    });
  });

  test.describe('Registration', () => {
    test('should register a new employee', async ({ page }) => {
      const email = uniqueEmail('newuser');

      await register(page, 'Test Employee', email, 'password123');

      // Should redirect to employee dashboard (availability page)
      await expect(page).toHaveURL('/');
      await expect(page.getByRole('heading', { name: 'Book a Desk' })).toBeVisible();
    });

    test('should show error for existing email', async ({ page, apiRequest }) => {
      const email = uniqueEmail('existing');

      // Create user via API first
      await createUserViaAPI(apiRequest, {
        email,
        password: 'password123',
        name: 'Existing User',
      });

      await page.goto('/login');
      await page.click("text=Don't have an account");
      await page.fill('input#name', 'Duplicate User');
      await page.fill('input#email', email);
      await page.fill('input#password', 'password123');
      await page.fill('input#confirmPassword', 'password123');
      await page.click('button[type="submit"]');

      await expect(page.getByText('Email already registered')).toBeVisible();
    });

    test('should show error for password mismatch', async ({ page }) => {
      await page.goto('/login');
      await page.click("text=Don't have an account");
      await page.fill('input#name', 'Test User');
      await page.fill('input#email', uniqueEmail('mismatch'));
      await page.fill('input#password', 'password123');
      await page.fill('input#confirmPassword', 'different456');
      await page.click('button[type="submit"]');

      await expect(page.getByText("Passwords don't match")).toBeVisible();
    });
  });

  test.describe('Login and Logout Flow', () => {
    test('should login and logout successfully', async ({ page, apiRequest }) => {
      const email = uniqueEmail('loginlogout');
      const password = 'testpass123';

      await createUserViaAPI(apiRequest, {
        email,
        password,
        name: 'Login Logout User',
      });

      await login(page, email, password);
      await expect(page).toHaveURL('/');

      await logout(page);
      await expect(page).toHaveURL('/login');
    });

    test('should redirect unauthenticated user to login', async ({ page }) => {
      await page.goto('/my-bookings');
      await expect(page).toHaveURL('/login');
    });
  });
});
