import { Op } from 'sequelize';
import { Seat, SeatCreationAttributes, SeatType } from '../../models/Seat';
import { Booking } from '../../models/Booking';
import { AppError } from '../../middleware/errorHandler';

export interface SeatWithAvailability extends Seat {
  availability?: {
    am: boolean;
    pm: boolean;
  };
}

export const getAllSeats = async (date?: string): Promise<SeatWithAvailability[]> => {
  const seats = await Seat.findAll({
    order: [['name', 'ASC']],
  });

  if (!date) {
    return seats;
  }

  // Get bookings for the specified date
  const bookings = await Booking.findAll({
    where: { date },
    attributes: ['seatId', 'slot'],
  });

  // Create a map of booked slots
  const bookedSlots = new Map<string, Set<string>>();
  bookings.forEach((booking) => {
    if (!bookedSlots.has(booking.seatId)) {
      bookedSlots.set(booking.seatId, new Set());
    }
    bookedSlots.get(booking.seatId)!.add(booking.slot);
  });

  // Add availability info to seats
  return seats.map((seat) => {
    const seatBookings = bookedSlots.get(seat.id) || new Set();
    return {
      ...seat.toJSON(),
      availability: {
        am: !seat.isBlocked && !seatBookings.has('AM'),
        pm: !seat.isBlocked && !seatBookings.has('PM'),
      },
    } as SeatWithAvailability;
  });
};

export const getSeatById = async (id: string): Promise<Seat> => {
  const seat = await Seat.findByPk(id);

  if (!seat) {
    throw new AppError(404, 'Seat not found');
  }

  return seat;
};

export const createSeat = async (data: SeatCreationAttributes): Promise<Seat> => {
  const seat = await Seat.create(data);
  return seat;
};

export const updateSeat = async (
  id: string,
  data: Partial<{ name: string; type: SeatType; tags: Record<string, string> }>
): Promise<Seat> => {
  const seat = await Seat.findByPk(id);

  if (!seat) {
    throw new AppError(404, 'Seat not found');
  }

  await seat.update(data);
  return seat;
};

export const deleteSeat = async (id: string): Promise<void> => {
  const seat = await Seat.findByPk(id);

  if (!seat) {
    throw new AppError(404, 'Seat not found');
  }

  // Check for future bookings
  const futureBookings = await Booking.count({
    where: {
      seatId: id,
      date: {
        [Op.gte]: new Date().toISOString().split('T')[0],
      },
    },
  });

  if (futureBookings > 0) {
    throw new AppError(400, 'Cannot delete seat with future bookings');
  }

  await seat.destroy();
};

export const toggleBlockSeat = async (id: string, isBlocked: boolean): Promise<Seat> => {
  const seat = await Seat.findByPk(id);

  if (!seat) {
    throw new AppError(404, 'Seat not found');
  }

  seat.isBlocked = isBlocked;
  await seat.save();

  return seat;
};
