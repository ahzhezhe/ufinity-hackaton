import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('seats')
export class Seat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 100 })
  name!: string;

  @Column({ type: 'enum', enum: ['regular', 'standing'], default: 'regular' })
  @Index()
  type!: string;

  @Column({ name: 'isBlocked', type: 'boolean', default: false })
  @Index()
  isBlocked!: boolean;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date;
}
