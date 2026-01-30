import request from 'supertest';
import { createTestApp } from '../helpers/testApp';
import { createTestUser, createTestAdmin, getAuthHeader } from '../helpers/testData';

const app = createTestApp();

describe('Users API', () => {
  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const { token } = await createTestAdmin({ email: 'admin@example.com' });
      await createTestUser({ email: 'user1@example.com' });
      await createTestUser({ email: 'user2@example.com' });

      const response = await request(app)
        .get('/api/users')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3); // admin + 2 users
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createTestUser({ email: 'employee@example.com' });

      const response = await request(app)
        .get('/api/users')
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Insufficient permissions');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/users');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return user by id for admin', async () => {
      const { token } = await createTestAdmin();
      const { user: targetUser } = await createTestUser({
        email: 'target@example.com',
        name: 'Target User',
      });

      const response = await request(app)
        .get(`/api/users/${targetUser.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(targetUser.id);
      expect(response.body.email).toBe('target@example.com');
      expect(response.body.name).toBe('Target User');
    });

    it('should return 404 for non-existent user', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .get('/api/users/non-existent-id')
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createTestUser();
      const { user: targetUser } = await createTestUser({ email: 'target@example.com' });

      const response = await request(app)
        .get(`/api/users/${targetUser.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    it('should update user role for admin', async () => {
      const { token } = await createTestAdmin();
      const { user: targetUser } = await createTestUser({
        email: 'target@example.com',
        role: 'employee',
      });

      const response = await request(app)
        .patch(`/api/users/${targetUser.id}/role`)
        .set(getAuthHeader(token))
        .send({ role: 'admin' });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('admin');
    });

    it('should demote admin to employee', async () => {
      const { token } = await createTestAdmin();
      const { user: targetAdmin } = await createTestAdmin({ email: 'target-admin@example.com' });

      const response = await request(app)
        .patch(`/api/users/${targetAdmin.id}/role`)
        .set(getAuthHeader(token))
        .send({ role: 'employee' });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe('employee');
    });

    it('should return 400 for invalid role', async () => {
      const { token } = await createTestAdmin();
      const { user: targetUser } = await createTestUser({ email: 'target@example.com' });

      const response = await request(app)
        .patch(`/api/users/${targetUser.id}/role`)
        .set(getAuthHeader(token))
        .send({ role: 'superadmin' });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent user', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .patch('/api/users/non-existent-id/role')
        .set(getAuthHeader(token))
        .send({ role: 'admin' });

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createTestUser();
      const { user: targetUser } = await createTestUser({ email: 'target@example.com' });

      const response = await request(app)
        .patch(`/api/users/${targetUser.id}/role`)
        .set(getAuthHeader(token))
        .send({ role: 'admin' });

      expect(response.status).toBe(403);
    });
  });
});
