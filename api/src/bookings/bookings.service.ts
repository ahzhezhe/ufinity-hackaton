import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async findAll(filters?: { date?: string; userId?: number; seatId?: number }) {
    const query = this.bookingsRepository.createQueryBuilder('booking');

    if (filters?.date) {
      query.where('booking.bookingDate = :date', { date: filters.date });
    }

    if (filters?.userId) {
      query.andWhere('booking.userId = :userId', { userId: filters.userId });
    }

    if (filters?.seatId) {
      query.andWhere('booking.seatId = :seatId', { seatId: filters.seatId });
    }

    query.andWhere('booking.status = :status', { status: 'active' });

    return query.getMany();
  }

  async findOne(id: number) {
    const booking = await this.bookingsRepository.findOneBy({ id });
    if (!booking) {
      throw new NotFoundException(`Booking #${id} not found`);
    }
    return booking;
  }

  async getAvailability(date: string) {
    // Get all active bookings for the date
    const bookings = await this.bookingsRepository.find({
      where: { bookingDate: date, status: 'active' },
    });

    // Group by seat and slot
    const booked = new Set<string>();
    bookings.forEach((b) => {
      booked.add(`${b.seatId}-${b.slot}`);
    });

    return {
      date,
      booked: Array.from(booked),
    };
  }

  async create(createBookingDto: {
    userId: number;
    seatId: number;
    bookingDate: string;
    slot: 'AM' | 'PM';
  }) {
    // Check if booking already exists
    const existing = await this.bookingsRepository.findOne({
      where: {
        seatId: createBookingDto.seatId,
        bookingDate: createBookingDto.bookingDate,
        slot: createBookingDto.slot,
        status: 'active',
      },
    });

    if (existing) {
      throw new ConflictException('This seat is already booked for this time slot');
    }

    const booking = this.bookingsRepository.create(createBookingDto);
    return this.bookingsRepository.save(booking);
  }

  async createBulk(bulkBookingDto: {
    userId: number;
    bookings: Array<{ seatId: number; bookingDate: string; slot: 'AM' | 'PM' }>;
  }) {
    const results: Booking[] = [];
    const errors: Array<{ seatId: number; bookingDate: string; slot: 'AM' | 'PM'; error: string }> = [];

    for (const bookingData of bulkBookingDto.bookings) {
      try {
        const booking = await this.create({
          userId: bulkBookingDto.userId,
          ...bookingData,
        });
        results.push(booking);
      } catch (error) {
        errors.push({
          ...bookingData,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return {
      successful: results,
      failed: errors,
      summary: {
        total: bulkBookingDto.bookings.length,
        success: results.length,
        failed: errors.length,
      },
    };
  }

  async cancel(id: number) {
    const booking = await this.bookingsRepository.findOneBy({ id });
    if (!booking) {
      throw new NotFoundException(`Booking #${id} not found`);
    }

    booking.status = 'cancelled';
    await this.bookingsRepository.save(booking);

    return booking;
  }
}
