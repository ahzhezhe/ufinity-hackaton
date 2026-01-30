import { test, expect, uniqueEmail, uniqueId, createUserViaAPI, createSeatViaAPI, login } from './helpers';

test.describe('Role-Based Access Control', () => {
  test.describe('Admin Access', () => {
    let adminEmail: string;
    let adminPassword: string;

    test.beforeEach(async ({ apiRequest }) => {
      adminEmail = uniqueEmail('admin');
      adminPassword = 'adminpass123';

      await createUserViaAPI(apiRequest, {
        email: adminEmail,
        password: adminPassword,
        name: 'Test Admin',
        role: 'admin',
      });
    });

    test('admin can access dashboard', async ({ page }) => {
      await login(page, adminEmail, adminPassword);

      await expect(page).toHaveURL('/admin');
      await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
    });

    test('admin can access seat management', async ({ page }) => {
      await login(page, adminEmail, adminPassword);
      await page.getByRole('link', { name: 'Manage Seats' }).click();

      await expect(page).toHaveURL('/admin/seats');
      await expect(page.getByRole('heading', { name: 'Seat Management' })).toBeVisible();
    });

    test('admin can access all bookings', async ({ page }) => {
      await login(page, adminEmail, adminPassword);
      await page.getByRole('link', { name: 'All Bookings' }).click();

      await expect(page).toHaveURL('/admin/bookings');
      await expect(page.getByRole('heading', { name: 'All Bookings' })).toBeVisible();
    });

    test('admin can access floor plans', async ({ page }) => {
      await login(page, adminEmail, adminPassword);
      await page.getByRole('link', { name: 'Floor Plans' }).click();

      await expect(page).toHaveURL('/admin/floor-plans');
      await expect(page.getByRole('heading', { name: 'Floor Plans' })).toBeVisible();
    });
  });

  test.describe('Employee Restrictions', () => {
    let empEmail: string;
    let empPassword: string;

    test.beforeEach(async ({ apiRequest }) => {
      empEmail = uniqueEmail('employee');
      empPassword = 'emppass123';

      await createUserViaAPI(apiRequest, {
        email: empEmail,
        password: empPassword,
        name: 'Test Employee',
        role: 'employee',
      });
    });

    test('employee is redirected from admin dashboard', async ({ page }) => {
      await login(page, empEmail, empPassword);

      // Employee should be at / not /admin
      await expect(page).toHaveURL('/');

      // Try to navigate to admin
      await page.goto('/admin');

      // Should be redirected back
      await expect(page).not.toHaveURL('/admin');
    });

    test('employee is redirected from seat management', async ({ page }) => {
      await login(page, empEmail, empPassword);
      await page.goto('/admin/seats');

      await expect(page).not.toHaveURL('/admin/seats');
    });

    test('employee is redirected from admin bookings', async ({ page }) => {
      await login(page, empEmail, empPassword);
      await page.goto('/admin/bookings');

      await expect(page).not.toHaveURL('/admin/bookings');
    });

    test('employee is redirected from floor plans', async ({ page }) => {
      await login(page, empEmail, empPassword);
      await page.goto('/admin/floor-plans');

      await expect(page).not.toHaveURL('/admin/floor-plans');
    });

    test('employee can access availability page', async ({ page }) => {
      await login(page, empEmail, empPassword);

      await expect(page).toHaveURL('/');
      await expect(page.getByRole('heading', { name: 'Book a Desk' })).toBeVisible();
    });

    test('employee can access my bookings', async ({ page }) => {
      await login(page, empEmail, empPassword);
      await page.getByRole('link', { name: 'My Bookings' }).click();

      await expect(page).toHaveURL('/my-bookings');
      await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();
    });

    test('employee can access who booked what', async ({ page }) => {
      await login(page, empEmail, empPassword);
      await page.getByRole('link', { name: 'Who Booked What' }).click();

      await expect(page).toHaveURL('/who-booked');
      await expect(page.getByRole('heading', { name: 'Who Booked What' })).toBeVisible();
    });
  });

  test.describe('Unauthenticated Access', () => {
    test('unauthenticated user is redirected to login', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveURL('/login');
    });

    test('login page is accessible without auth', async ({ page }) => {
      await page.goto('/login');
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('heading', { name: 'Hot Desk Booking' })).toBeVisible();
    });
  });
});
