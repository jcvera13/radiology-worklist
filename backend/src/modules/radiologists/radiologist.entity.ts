import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('radiologists')
export class Radiologist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column('text', { array: true, default: '{}' })
  subspecialties: string[];

  @Column({
    name: 'max_rvu_per_shift',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 50.0,
  })
  maxRVUPerShift: number;

  @Column({ default: 'offline' })
  status: string; // 'available', 'busy', 'offline'

  @Column({
    name: 'current_shift_rvu',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0.0,
  })
  currentShiftRVU: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
