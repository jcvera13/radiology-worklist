import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Radiologist } from '../radiologists/radiologist.entity';

@Entity('exams')
export class Exam {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'accession_number', unique: true })
  accessionNumber: string;

  @Column({ name: 'cpt_code' })
  cptCode: string;

  @Column({ name: 'rvu_value', type: 'decimal', precision: 10, scale: 2 })
  rvuValue: number;

  @Column({ default: 'routine' })
  priority: string; // 'stat', 'urgent', 'routine'

  @Column()
  subspecialty: string;

  @Column({ default: 'pending' })
  status: string; // 'pending', 'assigned', 'locked', 'completed'

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo: string;

  @ManyToOne(() => Radiologist, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignedRadiologist: Radiologist;

  @Column({ name: 'locked_by', nullable: true })
  lockedBy: string;

  @Column({ name: 'locked_at', nullable: true })
  lockedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'patient_mrn' })
  patientMRN: string;

  @Column({ name: 'patient_name', nullable: true })
  patientName: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
