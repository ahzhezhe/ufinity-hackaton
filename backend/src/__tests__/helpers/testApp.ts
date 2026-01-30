import express from 'express';
import cors from 'cors';
import path from 'path';
import { errorHandler } from '../../middleware/errorHandler';

// Import routes
import authRoutes from '../../modules/auth/auth.routes';
import usersRoutes from '../../modules/users/users.routes';
import seatsRoutes from '../../modules/seats/seats.routes';
import bookingsRoutes from '../../modules/bookings/bookings.routes';
import floorPlansRoutes from '../../modules/floor-plans/floor-plans.routes';

export const createTestApp = () => {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(__dirname, '../../..', 'uploads')));

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/seats', seatsRoutes);
  app.use('/api/bookings', bookingsRoutes);
  app.use('/api/floor-plans', floorPlansRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Error handler
  app.use(errorHandler);

  return app;
};
