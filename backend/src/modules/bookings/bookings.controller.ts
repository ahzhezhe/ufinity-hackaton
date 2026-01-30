import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as bookingsService from './bookings.service';

const createBookingSchema = z.object({
  seatId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  slot: z.enum(['AM', 'PM']),
});

const bulkBookingSchema = z.object({
  seatIds: z.array(z.string().uuid()).min(1),
  dates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).min(1),
  slots: z.array(z.enum(['AM', 'PM'])).min(1),
});

const availabilityQuerySchema = z.object({
  dates: z.string().transform((val) => val.split(',')),
});

export const getBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const filter = {
      date: req.query.date as string | undefined,
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
      userId: req.query.userId as string | undefined,
      seatId: req.query.seatId as string | undefined,
    };
    const bookings = await bookingsService.getBookings(filter);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const bookings = await bookingsService.getMyBookings(req.user.userId);
    res.json(bookings);
  } catch (error) {
    next(error);
  }
};

export const getAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { dates } = availabilityQuerySchema.parse(req.query);
    const availability = await bookingsService.getAvailability(dates);
    res.json(availability);
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    // Check if it's a bulk booking request
    if (Array.isArray(req.body.seatIds) || Array.isArray(req.body.dates) || Array.isArray(req.body.slots)) {
      const data = bulkBookingSchema.parse(req.body);
      const bookings = await bookingsService.createBulkBooking(req.user.userId, data);
      res.status(201).json(bookings);
      return;
    }

    // Single booking
    const data = createBookingSchema.parse(req.body);
    const booking = await bookingsService.createBooking(req.user.userId, data);
    res.status(201).json(booking);
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    const isAdmin = req.user.role === 'admin';
    await bookingsService.cancelBooking(req.params.id, req.user.userId, isAdmin);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
