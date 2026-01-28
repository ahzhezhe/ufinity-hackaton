import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeatsController } from './seats.controller';
import { SeatsService } from './seats.service';
import { Seat } from './entities/seat.entity';
import { SeatMetadata } from './entities/seat-metadata.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Seat, SeatMetadata])],
  controllers: [SeatsController],
  providers: [SeatsService],
  exports: [SeatsService],
})
export class SeatsModule {}
