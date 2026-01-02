import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exam } from './exam.entity';
import { Radiologist } from '../radiologists/radiologist.entity';

@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'exam_id' })
  examId: string;

  @ManyToOne(() => Exam)
  @JoinColumn({ name: 'exam_id' })
  exam: Exam;

  @Column({ name: 'radiologist_id' })
  radiologistId: string;

  @ManyToOne(() => Radiologist)
  @JoinColumn({ name: 'radiologist_id' })
  radiologist: Radiologist;

  @CreateDateColumn({ name: 'assigned_at' })
  assignedAt: Date;

  @Column({ default: 'assigned' })
  status: string;

  @Column({ name: 'assignment_type', default: 'automatic' })
  assignmentType: string; // 'automatic', 'manual'

  @Column({
    name: 'rvu_at_assignment',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  rvuAtAssignment: number;
}
