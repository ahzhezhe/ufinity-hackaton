import { Router } from 'express';
import * as bookingsController from './bookings.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', bookingsController.getBookings);
router.get('/my', bookingsController.getMyBookings);
router.get('/availability', bookingsController.getAvailability);
router.post('/', bookingsController.createBooking);
router.delete('/:id', bookingsController.cancelBooking);

export default router;
