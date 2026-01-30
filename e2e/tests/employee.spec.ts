import { test, expect, uniqueEmail, uniqueId, createUserViaAPI, createSeatViaAPI, login, getFutureDate } from './helpers';

test.describe('Employee Portal', () => {
  let employeeEmail: string;
  let employeePassword: string;
  let adminToken: string;

  test.beforeEach(async ({ apiRequest }) => {
    // Create admin for setting up test data
    const adminRes = await createUserViaAPI(apiRequest, {
      email: uniqueEmail('admin'),
      password: 'adminpass123',
      name: 'Setup Admin',
      role: 'admin',
    });
    adminToken = adminRes.token;

    // Create employee for tests
    employeeEmail = uniqueEmail('employee');
    employeePassword = 'emppass123';

    await createUserViaAPI(apiRequest, {
      email: employeeEmail,
      password: employeePassword,
      name: 'Test Employee',
      role: 'employee',
    });
  });

  test.describe('Book a Desk (Availability Page)', () => {
    test('should display availability page with date picker', async ({ page }) => {
      await login(page, employeeEmail, employeePassword);

      await expect(page).toHaveURL('/');
      await expect(page.getByRole('heading', { name: 'Book a Desk' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Select Date' })).toBeVisible();
      await expect(page.locator('input[type="date"]')).toBeVisible();
    });

    test('should display available seats', async ({ page, apiRequest }) => {
      // Create seats
      const seat1 = await createSeatViaAPI(apiRequest, adminToken, { name: `Avail-A-${uniqueId()}` });
      const seat2 = await createSeatViaAPI(apiRequest, adminToken, { name: `Avail-B-${uniqueId()}` });

      await login(page, employeeEmail, employeePassword);

      // Wait for seats to load
      await expect(page.getByText(seat1.name)).toBeVisible({ timeout: 10000 });
      await expect(page.getByText(seat2.name)).toBeVisible();
    });

    test('should book a seat for AM slot', async ({ page, apiRequest }) => {
      const seatName = `Book-AM-${uniqueId()}`;
      await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      await login(page, employeeEmail, employeePassword);

      // Wait for seat to appear
      await expect(page.getByText(seatName)).toBeVisible({ timeout: 10000 });

      // Find the seat card and click AM button
      const seatCard = page.locator('[class*="Card"]', { has: page.getByText(seatName) });
      await seatCard.getByRole('button', { name: 'AM' }).click();

      // Confirm booking
      await expect(page.getByRole('heading', { name: 'Confirm Booking' })).toBeVisible();
      await page.getByRole('button', { name: 'Confirm Booking' }).click();

      await expect(page.getByText('Successfully booked')).toBeVisible();
    });

    test('should book a seat for PM slot', async ({ page, apiRequest }) => {
      const seatName = `Book-PM-${uniqueId()}`;
      await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      await login(page, employeeEmail, employeePassword);

      await expect(page.getByText(seatName)).toBeVisible({ timeout: 10000 });

      const seatCard = page.locator('[class*="Card"]', { has: page.getByText(seatName) });
      await seatCard.getByRole('button', { name: 'PM' }).click();

      await page.getByRole('button', { name: 'Confirm Booking' }).click();

      await expect(page.getByText('Successfully booked')).toBeVisible();
    });

    test('should not show blocked seats as bookable', async ({ page, apiRequest }) => {
      const seatName = `Blocked-${uniqueId()}`;
      const seat = await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      // Block the seat via API
      await apiRequest.patch(`http://localhost:3000/api/seats/${seat.id}/block`, {
        headers: { Authorization: `Bearer ${adminToken}` },
        data: { isBlocked: true },
      });

      await login(page, employeeEmail, employeePassword);

      // Blocked seat should not be visible on availability page
      await page.waitForTimeout(1000); // Give time for seats to load
      await expect(page.getByText(seatName)).not.toBeVisible();
    });
  });

  test.describe('My Bookings', () => {
    test('should display my bookings page', async ({ page }) => {
      await login(page, employeeEmail, employeePassword);
      await page.getByRole('link', { name: 'My Bookings' }).click();

      await expect(page).toHaveURL('/my-bookings');
      await expect(page.getByRole('heading', { name: 'My Bookings' })).toBeVisible();
    });

    test('should show empty state when no bookings', async ({ page }) => {
      await login(page, employeeEmail, employeePassword);
      await page.getByRole('link', { name: 'My Bookings' }).click();

      await expect(page.getByText(/no.*booking/i)).toBeVisible();
    });

    test('should display user bookings', async ({ page, apiRequest }) => {
      // Create seat and booking
      const seatName = `MyBook-${uniqueId()}`;
      const seat = await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      const empRes = await createUserViaAPI(apiRequest, {
        email: uniqueEmail('booker'),
        password: 'pass123',
        name: 'Booker',
      });

      const today = new Date().toISOString().split('T')[0];
      await apiRequest.post('http://localhost:3000/api/bookings', {
        headers: { Authorization: `Bearer ${empRes.token}` },
        data: { seatId: seat.id, date: today, slot: 'AM' },
      });

      await login(page, empRes.user.email, 'pass123');
      await page.getByRole('link', { name: 'My Bookings' }).click();

      await expect(page.getByText(seatName)).toBeVisible();
    });

    test('should cancel own booking', async ({ page, apiRequest }) => {
      const seatName = `Cancel-${uniqueId()}`;
      const seat = await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      const empRes = await createUserViaAPI(apiRequest, {
        email: uniqueEmail('canceler'),
        password: 'pass123',
        name: 'Canceler',
      });

      const today = new Date().toISOString().split('T')[0];
      await apiRequest.post('http://localhost:3000/api/bookings', {
        headers: { Authorization: `Bearer ${empRes.token}` },
        data: { seatId: seat.id, date: today, slot: 'PM' },
      });

      await login(page, empRes.user.email, 'pass123');
      await page.getByRole('link', { name: 'My Bookings' }).click();

      await expect(page.getByText(seatName)).toBeVisible();

      // Click cancel button
      await page.getByRole('button', { name: /cancel/i }).click();

      // Booking should be removed or show cancelled
      await expect(page.getByText(/no.*booking/i)).toBeVisible();
    });
  });

  test.describe('Who Booked What', () => {
    test('should display who booked what page', async ({ page }) => {
      await login(page, employeeEmail, employeePassword);
      await page.getByRole('link', { name: 'Who Booked What' }).click();

      await expect(page).toHaveURL('/who-booked');
      await expect(page.getByRole('heading', { name: 'Who Booked What' })).toBeVisible();
    });

    test('should show bookings for selected date', async ({ page, apiRequest }) => {
      // Create seat and booking
      const seatName = `WhoBooked-${uniqueId()}`;
      const seat = await createSeatViaAPI(apiRequest, adminToken, { name: seatName });

      const empRes = await createUserViaAPI(apiRequest, {
        email: uniqueEmail('visible'),
        password: 'pass123',
        name: 'Visible User',
      });

      const today = new Date().toISOString().split('T')[0];
      await apiRequest.post('http://localhost:3000/api/bookings', {
        headers: { Authorization: `Bearer ${empRes.token}` },
        data: { seatId: seat.id, date: today, slot: 'AM' },
      });

      await login(page, employeeEmail, employeePassword);
      await page.getByRole('link', { name: 'Who Booked What' }).click();

      // Should see the booking
      await expect(page.getByText(seatName)).toBeVisible();
      await expect(page.getByText('Visible User')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should show employee navigation links', async ({ page }) => {
      await login(page, employeeEmail, employeePassword);

      await expect(page.getByRole('link', { name: 'Book a Desk' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'My Bookings' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Who Booked What' })).toBeVisible();
    });

    test('should display user info in navbar', async ({ page }) => {
      await login(page, employeeEmail, employeePassword);

      await expect(page.getByText('Test Employee')).toBeVisible();
    });
  });
});
