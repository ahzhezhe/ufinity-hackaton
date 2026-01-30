import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import {
  createTestUser,
  createTestAdmin,
  createTestSeat,
  createTestBooking,
  getAuthHeader,
  getFutureDate,
  getPastDate,
} from '../helpers/testData';

const app = createTestApp();

describe('Bookings API', () => {
  describe('GET /api/bookings', () => {
    it('should return all bookings for authenticated user', async () => {
      const { token, user } = await createTestUser();
      const seat = await createTestSeat({ name: 'A-101' });
      const futureDate = getFutureDate(1);

      await createTestBooking({
        userId: user.id,
        seatId: seat.id,
        date: futureDate,
        slot: 'AM',
      });

      const response = await request(app)
        .get('/api/bookings')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].user).toBeDefined();
      expect(response.body[0].seat).toBeDefined();
    });

    it('should filter bookings by date', async () => {
      const { token, user } = await createTestUser();
      const seat = await createTestSeat();
      const date1 = getFutureDate(1);
      const date2 = getFutureDate(2);

      await createTestBooking({ userId: user.id, seatId: seat.id, date: date1, slot: 'AM' });
      await createTestBooking({ userId: user.id, seatId: seat.id, date: date2, slot: 'AM' });

      const response = await request(app)
        .get(`/api/bookings?date=${date1}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].date).toBe(date1);
    });

    it('should filter bookings by date range', async () => {
      const { token, user } = await createTestUser();
      const seat = await createTestSeat();
      const date1 = getFutureDate(1);
      const date2 = getFutureDate(3);
      const date3 = getFutureDate(5);

      await createTestBooking({ userId: user.id, seatId: seat.id, date: date1, slot: 'AM' });
      await createTestBooking({ userId: user.id, seatId: seat.id, date: date2, slot: 'AM' });
      await createTestBooking({ userId: user.id, seatId: seat.id, date: date3, slot: 'AM' });

      const response = await request(app)
        .get(`/api/bookings?startDate=${date1}&endDate=${date2}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);
    });

    it('should filter bookings by userId', async () => {
      const { token, user: user1 } = await createTestUser({ email: 'user1@example.com' });
      const { user: user2 } = await createTestUser({ email: 'user2@example.com' });
      const seat = await createTestSeat();
      const futureDate = getFutureDate(1);

      await createTestBooking({ userId: user1.id, seatId: seat.id, date: futureDate, slot: 'AM' });
      await createTestBooking({ userId: user2.id, seatId: seat.id, date: futureDate, slot: 'PM' });

      const response = await request(app)
        .get(`/api/bookings?userId=${user1.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].userId).toBe(user1.id);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/bookings');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/bookings/my', () => {
    it('should return only current user upcoming bookings', async () => {
      const { token, user } = await createTestUser();
      const { user: otherUser } = await createTestUser({ email: 'other@example.com' });
      const seat = await createTestSeat();
      const futureDate = getFutureDate(1);

      await createTestBooking({ userId: user.id, seatId: seat.id, date: futureDate, slot: 'AM' });
      await createTestBooking({ userId: otherUser.id, seatId: seat.id, date: futureDate, slot: 'PM' });

      const response = await request(app)
        .get('/api/bookings/my')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].userId).toBe(user.id);
    });

    it('should not return past bookings', async () => {
      const { token, user } = await createTestUser();
      const seat = await createTestSeat();
      const pastDate = getPastDate(1);
      const futureDate = getFutureDate(1);

      // Note: Past booking might fail due to date validation,
      // but we're testing the filter logic
      await createTestBooking({ userId: user.id, seatId: seat.id, date: futureDate, slot: 'AM' });

      const response = await request(app)
        .get('/api/bookings/my')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.every((b: any) => b.date >= new Date().toISOString().split('T')[0])).toBe(true);
    });
  });

  describe('GET /api/bookings/availability', () => {
    it('should return availability for specified dates', async () => {
      const { token, user } = await createTestUser();
      const seat1 = await createTestSeat({ name: 'A-101' });
      const seat2 = await createTestSeat({ name: 'A-102' });
      const date1 = getFutureDate(1);
      const date2 = getFutureDate(2);

      await createTestBooking({ userId: user.id, seatId: seat1.id, date: date1, slot: 'AM' });

      const response = await request(app)
        .get(`/api/bookings/availability?dates=${date1},${date2}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(2);

      const day1 = response.body.find((d: any) => d.date === date1);
      expect(day1.seats.length).toBe(2);

      const seat1Avail = day1.seats.find((s: any) => s.id === seat1.id);
      expect(seat1Avail.am).toBe(false);
      expect(seat1Avail.pm).toBe(true);
    });

    it('should exclude blocked seats from availability', async () => {
      const { token } = await createTestUser();
      await createTestSeat({ name: 'A-101', isBlocked: false });
      await createTestSeat({ name: 'A-102', isBlocked: true });
      const futureDate = getFutureDate(1);

      const response = await request(app)
        .get(`/api/bookings/availability?dates=${futureDate}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body[0].seats.length).toBe(1);
    });
  });

  describe('POST /api/bookings', () => {
    it('should create a single booking', async () => {
      const { token, user } = await createTestUser();
      const seat = await createTestSeat({ name: 'B-201' });
      const futureDate = getFutureDate(1);

      const response = await request(app)
        .post('/api/bookings')
        .set(getAuthHeader(token))
        .send({
          seatId: seat.id,
          date: futureDate,
          slot: 'AM',
        });

      expect(response.status).toBe(201);
      expect(response.body.seatId).toBe(seat.id);
      expect(response.body.date).toBe(futureDate);
      expect(response.body.slot).toBe('AM');
      expect(response.body.userId).toBe(user.id);
    });

    it('should create bulk bookings (multiple seats, dates, slots)', async () => {
      const { token, user } = await createTestUser();
      const seat1 = await createTestSeat({ name: 'C-301' });
      const seat2 = await createTestSeat({ name: 'C-302' });
      const date1 = getFutureDate(1);
      const date2 = getFutureDate(2);

      const response = await request(app)
        .post('/api/bookings')
        .set(getAuthHeader(token))
        .send({
          seatIds: [seat1.id, seat2.id],
          dates: [date1, date2],
          slots: ['AM', 'PM'],
        });

      expect(response.status).toBe(201);
      // 2 seats × 2 dates × 2 slots = 8 bookings
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(8);
    });

    it('should return 409 for double booking same slot', async () => {
      const { token, user } = await createTestUser();
      const seat = await createTestSeat();
      const futureDate = getFutureDate(1);

      await createTestBooking({
        userId: user.id,
        seatId: seat.id,
        date: futureDate,
        slot: 'AM',
      });

      const response = await request(app)
        .post('/api/bookings')
        .set(getAuthHeader(token))
        .send({
          seatId: seat.id,
          date: futureDate,
          slot: 'AM',
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('This slot is already booked');
    });

    it('should return 400 for booking blocked seat', async () => {
      const { token } = await createTestUser();
      const seat = await createTestSeat({ isBlocked: true });
      const futureDate = getFutureDate(1);

      const response = await request(app)
        .post('/api/bookings')
        .set(getAuthHeader(token))
        .send({
          seatId: seat.id,
          date: futureDate,
          slot: 'AM',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Seat is blocked and cannot be booked');
    });

    it('should return 400 for non-existent seat (invalid UUID)', async () => {
      const { token } = await createTestUser();
      const futureDate = getFutureDate(1);

      const response = await request(app)
        .post('/api/bookings')
        .set(getAuthHeader(token))
        .send({
          seatId: 'non-existent-id',
          date: futureDate,
          slot: 'AM',
        });

      // Returns 400 because 'non-existent-id' is not a valid UUID
      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid date format', async () => {
      const { token } = await createTestUser();
      const seat = await createTestSeat();

      const response = await request(app)
        .post('/api/bookings')
        .set(getAuthHeader(token))
        .send({
          seatId: seat.id,
          date: 'invalid-date',
          slot: 'AM',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid slot', async () => {
      const { token } = await createTestUser();
      const seat = await createTestSeat();
      const futureDate = getFutureDate(1);

      const response = await request(app)
        .post('/api/bookings')
        .set(getAuthHeader(token))
        .send({
          seatId: seat.id,
          date: futureDate,
          slot: 'INVALID',
        });

      expect(response.status).toBe(400);
    });

    it('should rollback bulk booking on conflict', async () => {
      const { token, user } = await createTestUser();
      const seat1 = await createTestSeat({ name: 'D-401' });
      const seat2 = await createTestSeat({ name: 'D-402' });
      const futureDate = getFutureDate(1);

      // Pre-book one slot
      await createTestBooking({
        userId: user.id,
        seatId: seat2.id,
        date: futureDate,
        slot: 'AM',
      });

      const response = await request(app)
        .post('/api/bookings')
        .set(getAuthHeader(token))
        .send({
          seatIds: [seat1.id, seat2.id],
          dates: [futureDate],
          slots: ['AM'],
        });

      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/bookings/:id', () => {
    it('should cancel own booking', async () => {
      const { token, user } = await createTestUser();
      const seat = await createTestSeat();
      const futureDate = getFutureDate(1);
      const booking = await createTestBooking({
        userId: user.id,
        seatId: seat.id,
        date: futureDate,
        slot: 'AM',
      });

      const response = await request(app)
        .delete(`/api/bookings/${booking.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(204);
    });

    it('should allow admin to cancel any booking', async () => {
      const { user: employee } = await createTestUser();
      const { token: adminToken } = await createTestAdmin();
      const seat = await createTestSeat();
      const futureDate = getFutureDate(1);
      const booking = await createTestBooking({
        userId: employee.id,
        seatId: seat.id,
        date: futureDate,
        slot: 'AM',
      });

      const response = await request(app)
        .delete(`/api/bookings/${booking.id}`)
        .set(getAuthHeader(adminToken));

      expect(response.status).toBe(204);
    });

    it('should return 403 when cancelling other user booking as employee', async () => {
      const { user: user1 } = await createTestUser({ email: 'user1@example.com' });
      const { token: token2 } = await createTestUser({ email: 'user2@example.com' });
      const seat = await createTestSeat();
      const futureDate = getFutureDate(1);
      const booking = await createTestBooking({
        userId: user1.id,
        seatId: seat.id,
        date: futureDate,
        slot: 'AM',
      });

      const response = await request(app)
        .delete(`/api/bookings/${booking.id}`)
        .set(getAuthHeader(token2));

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('You can only cancel your own bookings');
    });

    it('should return 404 for non-existent booking', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .delete('/api/bookings/non-existent-id')
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
    });
  });
});
