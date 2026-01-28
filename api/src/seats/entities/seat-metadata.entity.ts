import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn } from 'typeorm';
import { Seat } from './seat.entity';

@Entity('seatMetadata')
export class SeatMetadata {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'seatId', type: 'int' })
  @Index()
  seatId!: number;

  @Column({ name: 'metaKey', type: 'varchar', length: 100 })
  @Index()
  metaKey!: string;

  @Column({ name: 'metaValue', type: 'varchar', length: 255 })
  metaValue!: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @ManyToOne(() => Seat)
  @JoinColumn({ name: 'seatId' })
  seat!: Seat;
}
