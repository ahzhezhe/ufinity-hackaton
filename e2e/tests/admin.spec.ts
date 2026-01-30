import { test, expect, uniqueEmail, uniqueId, createUserViaAPI, createSeatViaAPI, login } from './helpers';

test.describe('Admin Portal', () => {
  let adminEmail: string;
  let adminPassword: string;
  let adminToken: string;

  test.beforeEach(async ({ apiRequest }) => {
    // Create a new admin for each test
    adminEmail = uniqueEmail('admin');
    adminPassword = 'adminpass123';

    const result = await createUserViaAPI(apiRequest, {
      email: adminEmail,
      password: adminPassword,
      name: 'Test Admin',
      role: 'admin',
    });
    adminToken = result.token;
  });

  test.describe('Admin Dashboard', () => {
    test('should display dashboard with stats', async ({ page }) => {
      await login(page, adminEmail, adminPassword);

      // Admin should be redirected to admin dashboard
      await expect(page).toHaveURL('/admin');
      await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
      await expect(page.getByText('Total Seats')).toBeVisible();
      await expect(page.getByText('Available Seats')).toBeVisible();
    });

    test('should show navigation links for admin', async ({ page }) => {
      await login(page, adminEmail, adminPassword);

      await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Manage Seats' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'All Bookings' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Floor Plans' })).toBeVisible();
    });
  });

  test.describe('Seat Management', () => {
    test('should create a new seat', async ({ page }) => {
      await login(page, adminEmail, adminPassword);
      await page.getByRole('link', { name: 'Manage Seats' }).click();

      await expect(page).toHaveURL('/admin/seats');

      // Click Add Seat button
      await page.getByRole('button', { name: /Add Seat/i }).click();

      // Wait for form to appear
      await expect(page.getByLabel('Seat Name')).toBeVisible();

      const seatName = `Desk-${uniqueId()}`;
      await page.getByLabel('Seat Name').fill(seatName);
      await page.getByRole('button', { name: 'Create Seat' }).click();

      // Wait for the seat to appear in the table
      await expect(page.getByRole('cell', { name: seatName })).toBeVisible();
    });

    test('should create a standing desk', async ({ page }) => {
      await login(page, adminEmail, adminPassword);
      await page.getByRole('link', { name: 'Manage Seats' }).click();
      await page.getByRole('button', { name: /Add Seat/i }).click();

      const seatName = `Standing-${uniqueId()}`;
      await page.getByLabel('Seat Name').fill(seatName);

      // Select standing desk type - click the combobox trigger
      await page.locator('button[role="combobox"]').first().click();
      await page.getByRole('option', { name: 'Standing Desk' }).click();

      await page.getByRole('button', { name: 'Create Seat' }).click();

      // Verify seat created with Standing type
      const row = page.getByRole('row', { name: new RegExp(seatName) });
      await expect(row).toBeVisible();
      await expect(row.getByText('Standing')).toBeVisible();
    });

    test('should edit an existing seat', async ({ page, apiRequest }) => {
      // Create a seat via API
      const originalName = `Edit-${uniqueId()}`;
      await createSeatViaAPI(apiRequest, adminToken, { name: originalName });

      await login(page, adminEmail, adminPassword);
      await page.getByRole('link', { name: 'Manage Seats' }).click();

      // Wait for seats table to load
      await expect(page.getByRole('cell', { name: originalName })).toBeVisible();

      // Find the row and click edit button (pencil icon)
      const row = page.getByRole('row', { name: new RegExp(originalName) });
      await row.locator('button').nth(1).click(); // Edit is second button (after block/unblock)

      const newName = `Updated-${uniqueId()}`;
      await page.getByLabel('Seat Name').fill(newName);
      await page.getByRole('button', { name: 'Update Seat' }).click();

      await expect(page.getByRole('cell', { name: newName })).toBeVisible();
    });

    test('should block and unblock a seat', async ({ page, apiRequest }) => {
      const seatName = `Block-${uniqueId()}`;
      await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      await login(page, adminEmail, adminPassword);
      await page.getByRole('link', { name: 'Manage Seats' }).click();

      await expect(page.getByRole('cell', { name: seatName })).toBeVisible();

      const row = page.getByRole('row', { name: new RegExp(seatName) });

      // Initially should show "Available"
      await expect(row.getByText('Available')).toBeVisible();

      // Click block button (first button)
      await row.locator('button').first().click();

      // Should now show "Blocked"
      await expect(row.getByText('Blocked')).toBeVisible();

      // Click unblock
      await row.locator('button').first().click();

      // Should be "Available" again
      await expect(row.getByText('Available')).toBeVisible();
    });

    test('should delete a seat', async ({ page, apiRequest }) => {
      const seatName = `Delete-${uniqueId()}`;
      await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      await login(page, adminEmail, adminPassword);
      await page.getByRole('link', { name: 'Manage Seats' }).click();

      await expect(page.getByRole('cell', { name: seatName })).toBeVisible();

      const row = page.getByRole('row', { name: new RegExp(seatName) });

      // Handle confirm dialog
      page.on('dialog', dialog => dialog.accept());

      // Click delete button (third button)
      await row.locator('button').nth(2).click();

      // Seat should be removed
      await expect(page.getByRole('cell', { name: seatName })).not.toBeVisible();
    });
  });

  test.describe('Booking Viewer', () => {
    test('should display all bookings page', async ({ page }) => {
      await login(page, adminEmail, adminPassword);
      await page.getByRole('link', { name: 'All Bookings' }).click();

      await expect(page).toHaveURL('/admin/bookings');
      await expect(page.getByRole('heading', { name: 'All Bookings' })).toBeVisible();
    });
  });

  test.describe('Floor Plans', () => {
    test('should display floor plans page', async ({ page }) => {
      await login(page, adminEmail, adminPassword);
      await page.getByRole('link', { name: 'Floor Plans' }).click();

      await expect(page).toHaveURL('/admin/floor-plans');
      await expect(page.getByRole('heading', { name: 'Floor Plans' })).toBeVisible();
    });
  });
});
