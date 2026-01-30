import { test, expect, uniqueEmail, uniqueId, createUserViaAPI, createSeatViaAPI, login, getFutureDate } from './helpers';

test.describe('Booking Flows', () => {
  let employeeEmail: string;
  let employeePassword: string;
  let adminToken: string;

  test.beforeEach(async ({ apiRequest }) => {
    // Create admin for test data setup
    const adminRes = await createUserViaAPI(apiRequest, {
      email: uniqueEmail('admin'),
      password: 'adminpass123',
      name: 'Setup Admin',
      role: 'admin',
    });
    adminToken = adminRes.token;

    // Create employee
    employeeEmail = uniqueEmail('employee');
    employeePassword = 'emppass123';

    await createUserViaAPI(apiRequest, {
      email: employeeEmail,
      password: employeePassword,
      name: 'Test Employee',
    });
  });

  test.describe('Single Day Booking', () => {
    test('complete booking flow: select date -> select seat -> confirm', async ({ page, apiRequest }) => {
      const seatName = `Flow-${uniqueId()}`;
      await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      await login(page, employeeEmail, employeePassword);

      // Step 1: Select today's date (default)
      await expect(page.getByRole('heading', { name: 'Select Date' })).toBeVisible();

      // Step 2: Find and select seat
      await expect(page.getByText(seatName)).toBeVisible({ timeout: 10000 });

      const seatCard = page.locator('[class*="Card"]', { has: page.getByText(seatName) });

      // Step 3: Select AM slot
      await seatCard.getByRole('button', { name: 'AM' }).click();

      // Step 4: Confirm booking
      await expect(page.getByRole('heading', { name: 'Confirm Booking' })).toBeVisible();
      await page.getByRole('button', { name: 'Confirm Booking' }).click();

      // Step 5: Verify success
      await expect(page.getByText('Successfully booked')).toBeVisible();
    });

    test('should prevent double booking same slot', async ({ page, apiRequest }) => {
      const seatName = `Double-${uniqueId()}`;
      const seat = await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      // Book AM slot via API first
      const empRes = await createUserViaAPI(apiRequest, {
        email: uniqueEmail('other'),
        password: 'pass123',
        name: 'Other User',
      });

      const today = new Date().toISOString().split('T')[0];
      await apiRequest.post('http://localhost:3000/api/bookings', {
        headers: { Authorization: `Bearer ${empRes.token}` },
        data: { seatId: seat.id, date: today, slot: 'AM' },
      });

      await login(page, employeeEmail, employeePassword);

      await expect(page.getByText(seatName)).toBeVisible({ timeout: 10000 });

      const seatCard = page.locator('[class*="Card"]', { has: page.getByText(seatName) });

      // AM should be disabled (shown as div with X icon, not a button)
      await expect(seatCard.locator('div').filter({ hasText: 'AM' }).locator('svg')).toBeVisible();

      // PM should still be available as a button
      await expect(seatCard.getByRole('button', { name: 'PM' })).toBeVisible();
    });

    test('should allow canceling and rebooking', async ({ page, apiRequest }) => {
      const seatName = `Rebook-${uniqueId()}`;
      const seat = await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      // Create a fresh employee with a booking
      const empRes = await createUserViaAPI(apiRequest, {
        email: uniqueEmail('rebooker'),
        password: 'pass123',
        name: 'Rebooker',
      });

      const today = new Date().toISOString().split('T')[0];
      await apiRequest.post('http://localhost:3000/api/bookings', {
        headers: { Authorization: `Bearer ${empRes.token}` },
        data: { seatId: seat.id, date: today, slot: 'AM' },
      });

      await login(page, empRes.user.email, 'pass123');

      // Go to my bookings and cancel
      await page.getByRole('link', { name: 'My Bookings' }).click();
      await expect(page.getByText(seatName)).toBeVisible();
      await page.getByRole('button', { name: /cancel/i }).click();

      // Go back to availability
      await page.getByRole('link', { name: 'Book a Desk' }).click();

      // AM should be available again
      await expect(page.getByText(seatName)).toBeVisible({ timeout: 10000 });
      const seatCard = page.locator('[class*="Card"]', { has: page.getByText(seatName) });
      await expect(seatCard.getByRole('button', { name: 'AM' })).toBeVisible();
    });
  });

  test.describe('Booking for Future Dates', () => {
    test('should book seat for tomorrow', async ({ page, apiRequest }) => {
      const seatName = `Tomorrow-${uniqueId()}`;
      await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      await login(page, employeeEmail, employeePassword);

      // Change date to tomorrow
      const tomorrow = getFutureDate(1);
      await page.locator('input[type="date"]').fill(tomorrow);

      // Wait for seats to reload
      await expect(page.getByText(seatName)).toBeVisible({ timeout: 10000 });

      const seatCard = page.locator('[class*="Card"]', { has: page.getByText(seatName) });
      await seatCard.getByRole('button', { name: 'PM' }).click();
      await page.getByRole('button', { name: 'Confirm Booking' }).click();

      await expect(page.getByText('Successfully booked')).toBeVisible();
    });
  });

  test.describe('Seat Types', () => {
    test('should display different seat types', async ({ page, apiRequest }) => {
      const regularName = `Regular-${uniqueId()}`;
      const standingName = `Standing-${uniqueId()}`;

      await createSeatViaAPI(apiRequest, adminToken, { name: regularName, type: 'regular' });
      await createSeatViaAPI(apiRequest, adminToken, { name: standingName, type: 'standing' });

      await login(page, employeeEmail, employeePassword);

      await expect(page.getByText(regularName)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(standingName)).toBeVisible();

      // Check seat type badges
      const regularCard = page.locator('[class*="Card"]', { has: page.getByText(regularName) });
      const standingCard = page.locator('[class*="Card"]', { has: page.getByText(standingName) });

      await expect(regularCard.getByText('Regular Desk')).toBeVisible();
      await expect(standingCard.getByText('Standing Desk')).toBeVisible();
    });

    test('should book standing desk', async ({ page, apiRequest }) => {
      const standingName = `StandingBook-${uniqueId()}`;
      await createSeatViaAPI(apiRequest, adminToken, { name: standingName, type: 'standing' });

      await login(page, employeeEmail, employeePassword);

      await expect(page.getByText(standingName)).toBeVisible({ timeout: 10000 });

      const seatCard = page.locator('[class*="Card"]', { has: page.getByText(standingName) });
      await seatCard.getByRole('button', { name: 'AM' }).click();
      await page.getByRole('button', { name: 'Confirm Booking' }).click();

      await expect(page.getByText('Successfully booked')).toBeVisible();
    });
  });
});
