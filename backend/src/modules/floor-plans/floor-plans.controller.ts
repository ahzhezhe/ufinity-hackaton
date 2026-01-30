import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as floorPlansService from './floor-plans.service';
import { AppError } from '../../middleware/errorHandler';

const uploadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

export const getActiveFloorPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const floorPlan = await floorPlansService.getActiveFloorPlan();
    res.json(floorPlan);
  } catch (error) {
    next(error);
  }
};

export const getAllFloorPlans = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const floorPlans = await floorPlansService.getAllFloorPlans();
    res.json(floorPlans);
  } catch (error) {
    next(error);
  }
};

export const uploadFloorPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      throw new AppError(400, 'No image file provided');
    }

    const { name } = uploadSchema.parse(req.body);
    const imageUrl = `/uploads/${req.file.filename}`;

    const floorPlan = await floorPlansService.uploadFloorPlan(name, imageUrl);
    res.status(201).json(floorPlan);
  } catch (error) {
    next(error);
  }
};

export const setActiveFloorPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const floorPlan = await floorPlansService.setActiveFloorPlan(req.params.id);
    res.json(floorPlan);
  } catch (error) {
    next(error);
  }
};

export const deleteFloorPlan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await floorPlansService.deleteFloorPlan(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
