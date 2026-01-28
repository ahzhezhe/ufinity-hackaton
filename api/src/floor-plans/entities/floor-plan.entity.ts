import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('floorPlans')
export class FloorPlan {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ name: 'imagePath', type: 'varchar', length: 500 })
  imagePath!: string;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  @Index()
  isActive!: boolean;

  @Column({ name: 'uploadedBy', type: 'int', nullable: true })
  uploadedBy!: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt!: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedBy' })
  uploader!: User;
}
