import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as seatsService from './seats.service';

const createSeatSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['regular', 'standing']).optional(),
  tags: z.record(z.string()).optional(),
  floorPlanId: z.string().uuid().optional().nullable(),
});

const updateSeatSchema = z.object({
  name: z.string().min(1).optional(),
  type: z.enum(['regular', 'standing']).optional(),
  tags: z.record(z.string()).optional(),
});

const blockSeatSchema = z.object({
  isBlocked: z.boolean(),
});

export const getAllSeats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const date = req.query.date as string | undefined;
    const seats = await seatsService.getAllSeats(date);
    res.json(seats);
  } catch (error) {
    next(error);
  }
};

export const getSeatsAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const date = req.query.date as string;
    if (!date) {
      res.status(400).json({ message: 'Date parameter is required' });
      return;
    }
    const seats = await seatsService.getAllSeats(date);
    res.json(seats);
  } catch (error) {
    next(error);
  }
};

export const getSeatsAvailabilityRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { startDate, endDate } = req.query as { startDate: string; endDate: string };
    if (!startDate || !endDate) {
      res.status(400).json({ message: 'startDate and endDate parameters are required' });
      return;
    }
    const result = await seatsService.getSeatsAvailabilityRange(startDate, endDate);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getSeatById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const seat = await seatsService.getSeatById(req.params.id);
    res.json(seat);
  } catch (error) {
    next(error);
  }
};

export const createSeat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = createSeatSchema.parse(req.body);
    const seat = await seatsService.createSeat(data);
    res.status(201).json(seat);
  } catch (error) {
    next(error);
  }
};

export const updateSeat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = updateSeatSchema.parse(req.body);
    const seat = await seatsService.updateSeat(req.params.id, data);
    res.json(seat);
  } catch (error) {
    next(error);
  }
};

export const deleteSeat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await seatsService.deleteSeat(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const toggleBlockSeat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { isBlocked } = blockSeatSchema.parse(req.body);
    const seat = await seatsService.toggleBlockSeat(req.params.id, isBlocked);
    res.json(seat);
  } catch (error) {
    next(error);
  }
};
