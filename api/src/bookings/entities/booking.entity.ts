import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Seat } from '../../seats/entities/seat.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'userId', type: 'int' })
  @Index()
  userId!: number;

  @Column({ name: 'seatId', type: 'int' })
  @Index()
  seatId!: number;

  @Column({ name: 'bookingDate', type: 'date' })
  @Index()
  bookingDate!: string;

  @Column({ type: 'enum', enum: ['AM', 'PM'] })
  slot!: string;

  @Column({ type: 'enum', enum: ['active', 'cancelled'], default: 'active' })
  @Index()
  status!: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Seat)
  @JoinColumn({ name: 'seatId' })
  seat!: Seat;
}
