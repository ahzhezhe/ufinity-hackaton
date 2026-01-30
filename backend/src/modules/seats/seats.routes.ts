import { Router } from 'express';
import * as seatsController from './seats.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roleGuard';

const router = Router();

// Public routes (authenticated)
router.get('/', authenticate, seatsController.getAllSeats);
router.get('/availability', authenticate, seatsController.getSeatsAvailability);
router.get('/availability/range', authenticate, seatsController.getSeatsAvailabilityRange);
router.get('/:id', authenticate, seatsController.getSeatById);

// Admin only routes
router.post('/', authenticate, requireAdmin, seatsController.createSeat);
router.patch('/:id', authenticate, requireAdmin, seatsController.updateSeat);
router.delete('/:id', authenticate, requireAdmin, seatsController.deleteSeat);
router.patch('/:id/block', authenticate, requireAdmin, seatsController.toggleBlockSeat);

export default router;
