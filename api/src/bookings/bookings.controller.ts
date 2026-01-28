import { Controller, Get, Post, Body, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  findAll(
    @Query('date') date?: string,
    @Query('userId') userId?: string,
    @Query('seatId') seatId?: string,
  ) {
    return this.bookingsService.findAll({
      date,
      userId: userId ? +userId : undefined,
      seatId: seatId ? +seatId : undefined,
    });
  }

  @Get('availability/:date')
  getAvailability(@Param('date') date: string) {
    return this.bookingsService.getAvailability(date);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(+id);
  }

  @Post()
  create(
    @Body()
    createBookingDto: {
      userId: number;
      seatId: number;
      bookingDate: string;
      slot: 'AM' | 'PM';
    },
  ) {
    return this.bookingsService.create(createBookingDto);
  }

  @Post('bulk')
  createBulk(
    @Body()
    bulkBookingDto: {
      userId: number;
      bookings: Array<{ seatId: number; bookingDate: string; slot: 'AM' | 'PM' }>;
    },
  ) {
    return this.bookingsService.createBulk(bulkBookingDto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(+id);
  }
}
