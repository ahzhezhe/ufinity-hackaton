import request from 'supertest';
import path from 'path';
import fs from 'fs';
import { createTestApp } from '../helpers/testApp';
import {
  createTestUser,
  createTestAdmin,
  createTestFloorPlan,
  getAuthHeader,
} from '../helpers/testData';

const app = createTestApp();

describe('Floor Plans API', () => {
  describe('GET /api/floor-plans/active', () => {
    it('should return active floor plan for authenticated user', async () => {
      const { token } = await createTestUser();
      await createTestFloorPlan({
        name: 'Main Office',
        imageUrl: '/uploads/floor-plan.png',
        isActive: true,
      });

      const response = await request(app)
        .get('/api/floor-plans/active')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Main Office');
      expect(response.body.isActive).toBe(true);
    });

    it('should return null when no active floor plan', async () => {
      const { token } = await createTestUser();
      await createTestFloorPlan({ isActive: false });

      const response = await request(app)
        .get('/api/floor-plans/active')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body).toBeNull();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/floor-plans/active');
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/floor-plans', () => {
    it('should return all floor plans for admin', async () => {
      const { token } = await createTestAdmin();
      await createTestFloorPlan({ name: 'Floor 1', isActive: true });
      await createTestFloorPlan({ name: 'Floor 2', isActive: false });

      const response = await request(app)
        .get('/api/floor-plans')
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .get('/api/floor-plans')
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
    });
  });

  describe('POST /api/floor-plans', () => {
    const testImagePath = path.join(__dirname, '../fixtures/test-image.png');

    beforeAll(() => {
      // Create test fixtures directory and a dummy image
      const fixturesDir = path.join(__dirname, '../fixtures');
      if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true });
      }
      // Create a minimal PNG file (1x1 pixel)
      const minimalPng = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
        0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
        0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
        0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82,
      ]);
      fs.writeFileSync(testImagePath, minimalPng);
    });

    afterAll(() => {
      // Clean up test image
      if (fs.existsSync(testImagePath)) {
        fs.unlinkSync(testImagePath);
      }
    });

    it('should upload floor plan as admin', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .post('/api/floor-plans')
        .set(getAuthHeader(token))
        .field('name', 'New Floor Plan')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.name).toBe('New Floor Plan');
      expect(response.body.imageUrl).toContain('/uploads/');
      expect(response.body.isActive).toBe(true);
    });

    it('should deactivate existing floor plans when uploading new one', async () => {
      const { token } = await createTestAdmin();
      const existingFloorPlan = await createTestFloorPlan({ isActive: true });

      const response = await request(app)
        .post('/api/floor-plans')
        .set(getAuthHeader(token))
        .field('name', 'Newer Floor Plan')
        .attach('image', testImagePath);

      expect(response.status).toBe(201);
      expect(response.body.isActive).toBe(true);

      // Check old floor plan is deactivated
      const getResponse = await request(app)
        .get('/api/floor-plans')
        .set(getAuthHeader(token));

      const oldFloorPlan = getResponse.body.find((fp: any) => fp.id === existingFloorPlan.id);
      expect(oldFloorPlan.isActive).toBe(false);
    });

    it('should return 400 without image file', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .post('/api/floor-plans')
        .set(getAuthHeader(token))
        .field('name', 'Floor Plan Without Image');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('No image file provided');
    });

    it('should return 400 without name', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .post('/api/floor-plans')
        .set(getAuthHeader(token))
        .attach('image', testImagePath);

      expect(response.status).toBe(400);
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createTestUser();

      const response = await request(app)
        .post('/api/floor-plans')
        .set(getAuthHeader(token))
        .field('name', 'Floor Plan')
        .attach('image', testImagePath);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/floor-plans/:id/activate', () => {
    it('should activate floor plan as admin', async () => {
      const { token } = await createTestAdmin();
      const floorPlan1 = await createTestFloorPlan({ name: 'Floor 1', isActive: true });
      const floorPlan2 = await createTestFloorPlan({ name: 'Floor 2', isActive: false });

      const response = await request(app)
        .patch(`/api/floor-plans/${floorPlan2.id}/activate`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(200);
      expect(response.body.isActive).toBe(true);

      // Check old active floor plan is deactivated
      const getResponse = await request(app)
        .get('/api/floor-plans')
        .set(getAuthHeader(token));

      const oldActive = getResponse.body.find((fp: any) => fp.id === floorPlan1.id);
      expect(oldActive.isActive).toBe(false);
    });

    it('should return 404 for non-existent floor plan', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .patch('/api/floor-plans/non-existent-id/activate')
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createTestUser();
      const floorPlan = await createTestFloorPlan({ isActive: false });

      const response = await request(app)
        .patch(`/api/floor-plans/${floorPlan.id}/activate`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/floor-plans/:id', () => {
    it('should delete floor plan as admin', async () => {
      const { token } = await createTestAdmin();
      const floorPlan = await createTestFloorPlan();

      const response = await request(app)
        .delete(`/api/floor-plans/${floorPlan.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent floor plan', async () => {
      const { token } = await createTestAdmin();

      const response = await request(app)
        .delete('/api/floor-plans/non-existent-id')
        .set(getAuthHeader(token));

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-admin user', async () => {
      const { token } = await createTestUser();
      const floorPlan = await createTestFloorPlan();

      const response = await request(app)
        .delete(`/api/floor-plans/${floorPlan.id}`)
        .set(getAuthHeader(token));

      expect(response.status).toBe(403);
    });
  });
});
