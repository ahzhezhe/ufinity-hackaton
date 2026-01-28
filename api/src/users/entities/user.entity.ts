import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email!: string;

  @Column({ name: 'passwordHash', type: 'varchar', length: 255 })
  passwordHash!: string;

  @Column({ type: 'enum', enum: ['employee', 'admin'], default: 'employee' })
  @Index()
  role!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date;
}
