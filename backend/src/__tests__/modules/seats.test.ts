import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import {
  createTestUser,
  createTestAdmin,
  createTestSeat,
  createTestBooking,
  getAuthHeader,
  getFutureDate,
} from '../helpers/testData';

const app = createTestApp();

describe('Seats API', () => {
  describe('GET /api/seats', () => {
    it('should return all seats for authenticated user', async () => {
      const { token } = await createTestUser();
      await createTestSeat({ name: 'A-101' });
      await createTestSeat({ name: 'A-102' });

      const response = await request(app)
        .get('/api/seats')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should return seats with availability when date is provided', async () => {
      const { token, user } = await createTestUser();
      const seat = await createTestSeat({ name: 'A-101' });
      const futureDate = getFutureDate(1);

      // Book AM slot
      await createTestBooking({
        userId: user.id,
        seatId: seat.id,
        date: futureDate,
        slot: 'AM',
      });

      const response = await request(app)
        .get(`/api/seats?date=${futureDate}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      const seatWithAvailability = response.body.find((s: any) => s.id === seat.id);
      expect(seatWithAvailability.availability.am).toBe(false);
      expect(seatWithAvailability.availability.pm).toBe(true);
    });

    it('should show blocked seats as unavailable', async () => {
      const { token } = await createTestUser();
      const seat = await createTestSeat({ name: 'A-101', isBlocked: true });
      const futureDate = getFutureDate(1);

      const response = await request(app)
        .get(`/api/seats?date=${futureDate}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      const blockedSeat = response.body.find((s: any) => s.id === seat.id);
      expect(blockedSeat.availability.am).toBe(false);
      expect(blockedSeat.availability.pm).toBe(false);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/seats');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/seats/:id', () => {
    it('should return seat by id', async () => {
      const { token } = await createTestUser();
      const seat = await createTestSeat({
        name: 'B-201',
        type: 'standing',
        tags: { department: 'Engineering' },
      });

      const response = await request(app)
        .get(`/api/seats/${seat.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(seat.id);
      expect(response.body.name).toBe('B-201');
      expect(response.body.type).toBe('standing');
      expect(response.body.tags.department).toBe('Engineering');
    });

    it('should return 404 for non-existent seat', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .get('/api/seats/non-existent-id')
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Seat not found');
    });
  });

  describe('POST /api/seats', () => {
    it('should create a seat as admin', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .post('/api/seats')
        .set(getAuthHeader(token))
        .send({
          name: 'C-301',
          type: 'regular',
          tags: { floor: '3', window: 'yes' },
        });

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('C-301');
      expect(response.body.type).toBe('regular');
      expect(response.body.tags.floor).toBe('3');
      expect(response.body.isBlocked).toBe(false);
    });

    it('should create a standing desk', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .post('/api/seats')
        .set(getAuthHeader(token))
        .send({
          name: 'D-401',
          type: 'standing',
        });

      expect(response.status).toBe(201);
      expect(response.body.type).toBe('standing');
    });

    it('should return 400 for missing name', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .post('/api/seats')
        .set(getAuthHeader(token))
        .send({
          type: 'regular',
        });

      expect(response.status).toBe(400);
    });

    it('should return 400 for invalid type', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .post('/api/seats')
        .set(getAuthHeader(token))
        .send({
          name: 'E-501',
          type: 'invalid',
        });

      expect(response.status).toBe(400);
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .post('/api/seats')
        .set(getAuthHeader(token))
        .send({
          name: 'F-601',
        });

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/seats/:id', () => {
    it('should update seat as admin', async () => {
      const { token } = await createTestAdmin();
      const seat = await createTestSeat({ name: 'G-701' });

      const response = await request(app)
        .patch(`/api/seats/${seat.id}`)
        .set(getAuthHeader(token))
        .send({
          name: 'G-701-Updated',
          type: 'standing',
          tags: { updated: 'true' },
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('G-701-Updated');
      expect(response.body.type).toBe('standing');
      expect(response.body.tags.updated).toBe('true');
    });

    it('should partially update seat', async () => {
      const { token } = await createTestAdmin();
      const seat = await createTestSeat({
        name: 'H-801',
        type: 'regular',
        tags: { floor: '8' },
      });

      const response = await request(app)
        .patch(`/api/seats/${seat.id}`)
        .set(getAuthHeader(token))
        .send({
          name: 'H-801-New',
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('H-801-New');
      expect(response.body.type).toBe('regular'); // unchanged
    });

    it('should return 404 for non-existent seat', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .patch('/api/seats/non-existent-id')
        .set(getAuthHeader(token))
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createTestUser();
      const seat = await createTestSeat();

      const response = await request(app)
        .patch(`/api/seats/${seat.id}`)
        .set(getAuthHeader(token))
        .send({ name: 'Updated' });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/seats/:id', () => {
    it('should delete seat as admin when no future bookings', async () => {
      const { token } = await createTestAdmin();
      const seat = await createTestSeat({ name: 'I-901' });

      const response = await request(app)
        .delete(`/api/seats/${seat.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(204);
    });

    it('should return 400 when seat has future bookings', async () => {
      const { token, user } = await createTestAdmin();
      const seat = await createTestSeat({ name: 'J-1001' });
      const futureDate = getFutureDate(7);

      await createTestBooking({
        userId: user.id,
        seatId: seat.id,
        date: futureDate,
        slot: 'AM',
      });

      const response = await request(app)
        .delete(`/api/seats/${seat.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cannot delete seat with future bookings');
    });

    it('should return 404 for non-existent seat', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .delete('/api/seats/non-existent-id')
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createTestUser();
      const seat = await createTestSeat();

      const response = await request(app)
        .delete(`/api/seats/${seat.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/seats/:id/block', () => {
    it('should block seat as admin', async () => {
      const { token } = await createTestAdmin();
      const seat = await createTestSeat({ name: 'K-1101', isBlocked: false });

      const response = await request(app)
        .patch(`/api/seats/${seat.id}/block`)
        .set(getAuthHeader(token))
        .send({ isBlocked: true });

      expect(response.status).toBe(200);
      expect(response.body.isBlocked).toBe(true);
    });

    it('should unblock seat as admin', async () => {
      const { token } = await createTestAdmin();
      const seat = await createTestSeat({ name: 'L-1201', isBlocked: true });

      const response = await request(app)
        .patch(`/api/seats/${seat.id}/block`)
        .set(getAuthHeader(token))
        .send({ isBlocked: false });

      expect(response.status).toBe(200);
      expect(response.body.isBlocked).toBe(false);
    });

    it('should return 400 for missing isBlocked field', async () => {
      const { token } = await createTestAdmin();
      const seat = await createTestSeat();

      const response = await request(app)
        .patch(`/api/seats/${seat.id}/block`)
        .set(getAuthHeader(token))
        .send({});

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent seat', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .patch('/api/seats/non-existent-id/block')
        .set(getAuthHeader(token))
        .send({ isBlocked: true });

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createTestUser();
      const seat = await createTestSeat();

      const response = await request(app)
        .patch(`/api/seats/${seat.id}/block`)
        .set(getAuthHeader(token))
        .send({ isBlocked: true });

      expect(response.status).toBe(403);
    });
  });
});
