import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Radiologist } from './radiologist.entity';
import { LocksService } from '../locks/locks.service';
import { Exam } from '../exams/exam.entity';

@Injectable()
export class RadiologistsService {
  constructor(
    @InjectRepository(Radiologist)
    private radiologistRepository: Repository<Radiologist>,
    @InjectRepository(Exam)
    private examRepository: Repository<Exam>,
    private locksService: LocksService,
  ) {}

  /**
   * Get all radiologists
   */
  async findAll(): Promise<Radiologist[]> {
    return this.radiologistRepository.find({
      order: { name: 'ASC' },
    });
  }

  /**
   * Get radiologist by ID
   */
  async findOne(id: string): Promise<Radiologist> {
    const radiologist = await this.radiologistRepository.findOne({
      where: { id },
    });

    if (!radiologist) {
      throw new NotFoundException(`Radiologist with ID ${id} not found`);
    }

    return radiologist;
  }

  /**
   * Update radiologist status
   */
  async updateStatus(id: string, status: string): Promise<void> {
    const radiologist = await this.findOne(id);
    radiologist.status = status;
    await this.radiologistRepository.save(radiologist);

    // Update presence in Redis
    await this.locksService.setUserPresence(
      id,
      status === 'available' ? 'online' : 'offline',
    );
  }

  /**
   * Reset RVU counter (start of new shift)
   */
  async resetRVU(id: string): Promise<void> {
    const radiologist = await this.findOne(id);
    radiologist.currentShiftRVU = 0;
    await this.radiologistRepository.save(radiologist);
    await this.locksService.resetRVU(id);
  }

  /**
   * Get workload statistics
   */
  async getWorkload(id: string): Promise<any> {
    const radiologist = await this.findOne(id);

    // Get today's exams
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const assignedExams = await this.examRepository.count({
      where: {
        assignedTo: id,
        createdAt: today as any,
      },
    });

    const completedExams = await this.examRepository.count({
      where: {
        assignedTo: id,
        status: 'completed',
        createdAt: today as any,
      },
    });

    const lockedExams = await this.examRepository.count({
      where: {
        lockedBy: id,
      },
    });

    // Calculate RVU percentage
    const rvuPercentage = (radiologist.currentShiftRVU / radiologist.maxRVUPerShift) * 100;

    return {
      radiologistId: id,
      name: radiologist.name,
      currentRVU: radiologist.currentShiftRVU,
      maxRVU: radiologist.maxRVUPerShift,
      rvuPercentage: Math.round(rvuPercentage),
      assignedCount: assignedExams,
      completedCount: completedExams,
      lockedCount: lockedExams,
      status: radiologist.status,
      subspecialties: radiologist.subspecialties,
    };
  }

  /**
   * Get available radiologists for specific subspecialty
   */
  async findAvailableBySubspecialty(subspecialty: string): Promise<Radiologist[]> {
    const radiologists = await this.radiologistRepository.find({
      where: { status: 'available' },
    });

    return radiologists.filter(
      (rad) =>
        rad.subspecialties.includes(subspecialty) ||
        rad.subspecialties.includes('General'),
    );
  }
}
