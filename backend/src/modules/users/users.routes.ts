import { Router } from 'express';
import * as usersController from './users.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roleGuard';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(requireAdmin);

router.get('/', usersController.getAllUsers);
router.get('/:id', usersController.getUserById);
router.patch('/:id/role', usersController.updateUserRole);

export default router;
