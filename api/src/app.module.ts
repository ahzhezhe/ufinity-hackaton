import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SeatsModule } from './seats/seats.module';
import { BookingsModule } from './bookings/bookings.module';
import { FloorPlansModule } from './floor-plans/floor-plans.module';
import { User } from './users/entities/user.entity';
import { Seat } from './seats/entities/seat.entity';
import { SeatMetadata } from './seats/entities/seat-metadata.entity';
import { Booking } from './bookings/entities/booking.entity';
import { FloorPlan } from './floor-plans/entities/floor-plan.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST') || 'localhost',
        port: configService.get<number>('DATABASE_PORT') || 3306,
        username: configService.get<string>('DATABASE_USER') || 'root',
        password: configService.get<string>('DATABASE_PASSWORD') || 'password',
        database: configService.get<string>('DATABASE_NAME') || 'seat_booking',
        entities: [User, Seat, SeatMetadata, Booking, FloorPlan],
        synchronize: false,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    SeatsModule,
    BookingsModule,
    FloorPlansModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
