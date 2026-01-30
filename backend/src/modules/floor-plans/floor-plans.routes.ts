import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as floorPlansController from './floor-plans.controller';
import { authenticate } from '../../middleware/auth';
import { requireAdmin } from '../../middleware/roleGuard';
import { env } from '../../config/env';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, env.upload.dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.upload.maxFileSize,
  },
});

// Public route (authenticated)
router.get('/active', authenticate, floorPlansController.getActiveFloorPlan);

// Admin only routes
router.get('/', authenticate, requireAdmin, floorPlansController.getAllFloorPlans);
router.post('/', authenticate, requireAdmin, upload.single('image'), floorPlansController.uploadFloorPlan);
router.patch('/:id/activate', authenticate, requireAdmin, floorPlansController.setActiveFloorPlan);
router.delete('/:id', authenticate, requireAdmin, floorPlansController.deleteFloorPlan);

export default router;
