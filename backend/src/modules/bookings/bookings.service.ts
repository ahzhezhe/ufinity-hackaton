import { Op, Transaction } from 'sequelize';
import { sequelize } from '../../config/database';
import { Booking, BookingSlot, BookingCreationAttributes } from '../../models/Booking';
import { Seat } from '../../models/Seat';
import { User } from '../../models/User';
import { AppError } from '../../middleware/errorHandler';

export interface BulkBookingRequest {
  seatIds: string[];
  dates: string[];
  slots: BookingSlot[];
}

export interface BookingFilter {
  date?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  seatId?: string;
}

export const getBookings = async (filter: BookingFilter) => {
  const where: any = {};

  if (filter.date) {
    where.date = filter.date;
  } else if (filter.startDate || filter.endDate) {
    where.date = {};
    if (filter.startDate) {
      where.date[Op.gte] = filter.startDate;
    }
    if (filter.endDate) {
      where.date[Op.lte] = filter.endDate;
    }
  }

  if (filter.userId) {
    where.userId = filter.userId;
  }

  if (filter.seatId) {
    where.seatId = filter.seatId;
  }

  const bookings = await Booking.findAll({
    where,
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Seat, as: 'seat', attributes: ['id', 'name', 'type'] },
    ],
    order: [['date', 'ASC'], ['slot', 'ASC']],
  });

  return bookings;
};

export const getMyBookings = async (userId: string) => {
  const today = new Date().toISOString().split('T')[0];

  const bookings = await Booking.findAll({
    where: {
      userId,
      date: {
        [Op.gte]: today,
      },
    },
    include: [
      { model: Seat, as: 'seat', attributes: ['id', 'name', 'type'] },
    ],
    order: [['date', 'ASC'], ['slot', 'ASC']],
  });

  return bookings;
};

export const getAvailability = async (dates: string[]) => {
  // Get all seats
  const seats = await Seat.findAll({
    where: { isBlocked: false },
    attributes: ['id', 'name', 'type'],
  });

  // Get all bookings for the specified dates
  const bookings = await Booking.findAll({
    where: {
      date: {
        [Op.in]: dates,
      },
    },
    attributes: ['seatId', 'date', 'slot'],
  });

  // Create availability map
  const bookedMap = new Map<string, Set<string>>();
  bookings.forEach((booking) => {
    const key = `${booking.seatId}-${booking.date}`;
    if (!bookedMap.has(key)) {
      bookedMap.set(key, new Set());
    }
    bookedMap.get(key)!.add(booking.slot);
  });

  // Generate availability response
  const availability = dates.map((date) => ({
    date,
    seats: seats.map((seat) => {
      const key = `${seat.id}-${date}`;
      const booked = bookedMap.get(key) || new Set();
      return {
        id: seat.id,
        name: seat.name,
        type: seat.type,
        am: !booked.has('AM'),
        pm: !booked.has('PM'),
      };
    }),
  }));

  return availability;
};

export const createBooking = async (
  userId: string,
  data: { seatId: string; date: string; slot: BookingSlot }
) => {
  // Check if seat exists and is not blocked
  const seat = await Seat.findByPk(data.seatId);
  if (!seat) {
    throw new AppError(404, 'Seat not found');
  }
  if (seat.isBlocked) {
    throw new AppError(400, 'Seat is blocked and cannot be booked');
  }

  // Check if slot is available
  const existingBooking = await Booking.findOne({
    where: {
      seatId: data.seatId,
      date: data.date,
      slot: data.slot,
    },
  });

  if (existingBooking) {
    throw new AppError(409, 'This slot is already booked');
  }

  const booking = await Booking.create({
    userId,
    seatId: data.seatId,
    date: data.date,
    slot: data.slot,
  });

  return Booking.findByPk(booking.id, {
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Seat, as: 'seat', attributes: ['id', 'name', 'type'] },
    ],
  });
};

export const createBulkBooking = async (userId: string, data: BulkBookingRequest) => {
  const { seatIds, dates, slots } = data;

  // Validate all seats exist and are not blocked
  const seats = await Seat.findAll({
    where: {
      id: {
        [Op.in]: seatIds,
      },
    },
  });

  if (seats.length !== seatIds.length) {
    throw new AppError(404, 'One or more seats not found');
  }

  const blockedSeats = seats.filter((s) => s.isBlocked);
  if (blockedSeats.length > 0) {
    throw new AppError(400, `Seats ${blockedSeats.map((s) => s.name).join(', ')} are blocked`);
  }

  // Generate all booking combinations
  const bookingsToCreate: BookingCreationAttributes[] = [];
  for (const seatId of seatIds) {
    for (const date of dates) {
      for (const slot of slots) {
        bookingsToCreate.push({ userId, seatId, date, slot });
      }
    }
  }

  // Use transaction for atomicity
  const result = await sequelize.transaction(async (t: Transaction) => {
    // Check for conflicts
    const conflicts = await Booking.findAll({
      where: {
        [Op.or]: bookingsToCreate.map((b) => ({
          seatId: b.seatId,
          date: b.date,
          slot: b.slot,
        })),
      },
      transaction: t,
    });

    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map((c) => `${c.seatId} on ${c.date} ${c.slot}`);
      throw new AppError(409, `Booking conflicts: ${conflictDetails.join(', ')}`);
    }

    // Create all bookings
    const bookings = await Booking.bulkCreate(bookingsToCreate, { transaction: t });
    return bookings;
  });

  // Fetch created bookings with associations
  const createdBookings = await Booking.findAll({
    where: {
      id: {
        [Op.in]: result.map((b) => b.id),
      },
    },
    include: [
      { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
      { model: Seat, as: 'seat', attributes: ['id', 'name', 'type'] },
    ],
  });

  return createdBookings;
};

export const cancelBooking = async (bookingId: string, userId: string, isAdmin: boolean) => {
  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new AppError(404, 'Booking not found');
  }

  // Only allow cancellation by the booking owner or admin
  if (booking.userId !== userId && !isAdmin) {
    throw new AppError(403, 'You can only cancel your own bookings');
  }

  // Don't allow cancellation of past bookings
  const today = new Date().toISOString().split('T')[0];
  if (booking.date < today) {
    throw new AppError(400, 'Cannot cancel past bookings');
  }

  await booking.destroy();
};
