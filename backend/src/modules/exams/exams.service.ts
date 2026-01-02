import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from './exam.entity';
import { Assignment } from './assignment.entity';
import { Radiologist } from '../radiologists/radiologist.entity';
import { LocksService } from '../locks/locks.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    @InjectRepository(Assignment)
    private assignmentRepository: Repository<Assignment>,
    @InjectRepository(Radiologist)
    private radiologistRepository: Repository<Radiologist>,
    private locksService: LocksService,
    private auditService: AuditService,
  ) {}

  /**
   * RVU-BASED ASSIGNMENT ALGORITHM
   * Core principle: Fairness over time, deterministic, fully auditable
   */
  async assignExam(examId: string): Promise<{ success: boolean; radiologistId?: string; reason: string }> {
    const exam = await this.examRepository.findOne({ where: { id: examId } });
    
    if (!exam) {
      return { success: false, reason: 'Exam not found' };
    }

    if (exam.status !== 'pending') {
      return { success: false, reason: 'Exam already assigned' };
    }

    // Step 1: Get all available radiologists
    const availableRads = await this.radiologistRepository.find({
      where: { status: 'available' },
    });

    if (availableRads.length === 0) {
      return { success: false, reason: 'No available radiologists' };
    }

    // Step 2: Filter by subspecialty eligibility
    const eligibleRads = availableRads.filter((rad) =>
      rad.subspecialties.includes(exam.subspecialty) ||
      rad.subspecialties.includes('General')
    );

    if (eligibleRads.length === 0) {
      return { success: false, reason: `No radiologists with ${exam.subspecialty} subspecialty` };
    }

    // Step 3: Sort by current cumulative shift RVU (ascending - fairness)
    const sorted = [...eligibleRads].sort(
      (a, b) => a.currentShiftRVU - b.currentShiftRVU
    );

    // Step 4: Find first radiologist who won't exceed max RVU
    let selectedRad: Radiologist | null = null;
    
    for (const rad of sorted) {
      if (rad.currentShiftRVU + exam.rvuValue <= rad.maxRVUPerShift) {
        selectedRad = rad;
        break;
      }
    }

    if (!selectedRad) {
      return { success: false, reason: 'All radiologists would exceed max RVU' };
    }

    // Step 5: Atomically update state (Redis for real-time, then PostgreSQL)
    try {
      // Update exam in database
      exam.status = 'assigned';
      exam.assignedTo = selectedRad.id;
      await this.examRepository.save(exam);

      // Update radiologist RVU
      selectedRad.currentShiftRVU += exam.rvuValue;
      await this.radiologistRepository.save(selectedRad);

      // Create assignment record
      const assignment = this.assignmentRepository.create({
        examId: exam.id,
        radiologistId: selectedRad.id,
        assignmentType: 'automatic',
        rvuAtAssignment: selectedRad.currentShiftRVU - exam.rvuValue,
      });
      await this.assignmentRepository.save(assignment);

      // Audit log
      await this.auditService.log({
        actor: 'SYSTEM',
        action: 'AUTO_ASSIGN',
        resourceType: 'exam',
        resourceId: exam.id,
        context: `${exam.accessionNumber} → ${selectedRad.name} (RVU: ${exam.rvuValue}, Current: ${selectedRad.currentShiftRVU})`,
      });

      return {
        success: true,
        radiologistId: selectedRad.id,
        reason: `Assigned to ${selectedRad.name} (current RVU: ${selectedRad.currentShiftRVU.toFixed(2)})`,
      };
    } catch (error) {
      return { success: false, reason: `Assignment failed: ${error.message}` };
    }
  }

  /**
   * Manual assignment override (Admin function)
   */
  async manualAssign(examId: string, radiologistId: string, adminActor: string): Promise<void> {
    const exam = await this.examRepository.findOne({ where: { id: examId } });
    const radiologist = await this.radiologistRepository.findOne({ where: { id: radiologistId } });

    if (!exam || !radiologist) {
      throw new NotFoundException('Exam or Radiologist not found');
    }

    exam.status = 'assigned';
    exam.assignedTo = radiologistId;
    await this.examRepository.save(exam);

    radiologist.currentShiftRVU += exam.rvuValue;
    await this.radiologistRepository.save(radiologist);

    const assignment = this.assignmentRepository.create({
      examId: exam.id,
      radiologistId: radiologist.id,
      assignmentType: 'manual',
      rvuAtAssignment: radiologist.currentShiftRVU - exam.rvuValue,
    });
    await this.assignmentRepository.save(assignment);

    await this.auditService.log({
      actor: adminActor,
      action: 'MANUAL_ASSIGN',
      resourceType: 'exam',
      resourceId: exam.id,
      context: `${exam.accessionNumber} → ${radiologist.name}`,
    });
  }

  /**
   * Lock exam (when radiologist opens in PowerScribe)
   */
  async lockExam(examId: string, radiologistId: string): Promise<void> {
    // Acquire distributed lock via Redis
    const locked = await this.locksService.acquireLock(examId, radiologistId, 1800); // 30 min timeout

    if (!locked) {
      throw new Error('Exam is already locked by another user');
    }

    const exam = await this.examRepository.findOne({ where: { id: examId } });
    exam.status = 'locked';
    exam.lockedBy = radiologistId;
    exam.lockedAt = new Date();
    await this.examRepository.save(exam);

    await this.auditService.log({
      actor: radiologistId,
      action: 'LOCK_ACQUIRED',
      resourceType: 'exam',
      resourceId: examId,
      context: `Exam ${exam.accessionNumber} locked`,
    });
  }

  /**
   * Release lock
   */
  async releaseLock(examId: string, radiologistId: string): Promise<void> {
    await this.locksService.releaseLock(examId);

    const exam = await this.examRepository.findOne({ where: { id: examId } });
    exam.status = 'assigned';
    exam.lockedBy = null;
    exam.lockedAt = null;
    await this.examRepository.save(exam);

    await this.auditService.log({
      actor: radiologistId,
      action: 'LOCK_RELEASED',
      resourceType: 'exam',
      resourceId: examId,
      context: `Exam ${exam.accessionNumber} released`,
    });
  }

  /**
   * Complete exam
   */
  async completeExam(examId: string, radiologistId: string): Promise<void> {
    const exam = await this.examRepository.findOne({ where: { id: examId } });
    
    exam.status = 'completed';
    exam.completedAt = new Date();
    exam.lockedBy = null;
    await this.examRepository.save(exam);

    await this.locksService.releaseLock(examId);

    await this.auditService.log({
      actor: radiologistId,
      action: 'EXAM_COMPLETED',
      resourceType: 'exam',
      resourceId: examId,
      context: `Exam ${exam.accessionNumber} completed (${exam.rvuValue} RVU)`,
    });
  }

  /**
   * Get all exams
   */
  async findAll(): Promise<Exam[]> {
    return this.examRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get exams for specific radiologist
   */
  async findByRadiologist(radiologistId: string): Promise<Exam[]> {
    return this.examRepository.find({
      where: { assignedTo: radiologistId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Create new exam (from HL7)
   */
  async create(examData: Partial<Exam>): Promise<Exam> {
    const exam = this.examRepository.create(examData);
    return this.examRepository.save(exam);
  }
}
