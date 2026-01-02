import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { Exam } from './exam.entity';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  /**
   * GET /api/exams
   * Get all exams
   */
  @Get()
  async findAll(): Promise<Exam[]> {
    return this.examsService.findAll();
  }

  /**
   * GET /api/exams/radiologist/:id
   * Get exams for specific radiologist
   */
  @Get('radiologist/:id')
  async findByRadiologist(@Param('id') id: string): Promise<Exam[]> {
    return this.examsService.findByRadiologist(id);
  }

  /**
   * POST /api/exams
   * Create new exam (simulates HL7 ingestion)
   */
  @Post()
  async create(@Body() examData: Partial<Exam>): Promise<Exam> {
    return this.examsService.create(examData);
  }

  /**
   * POST /api/exams/:id/assign
   * Trigger auto-assignment for exam
   */
  @Post(':id/assign')
  async assign(@Param('id') id: string) {
    return this.examsService.assignExam(id);
  }

  /**
   * POST /api/exams/:id/manual-assign
   * Manual assignment override (admin)
   */
  @Post(':id/manual-assign')
  async manualAssign(
    @Param('id') examId: string,
    @Body() data: { radiologistId: string; adminActor: string },
  ) {
    await this.examsService.manualAssign(examId, data.radiologistId, data.adminActor);
    return { success: true };
  }

  /**
   * POST /api/exams/:id/lock
   * Lock exam
   */
  @Post(':id/lock')
  async lock(
    @Param('id') examId: string,
    @Body() data: { radiologistId: string },
  ) {
    await this.examsService.lockExam(examId, data.radiologistId);
    return { success: true };
  }

  /**
   * POST /api/exams/:id/unlock
   * Release lock
   */
  @Post(':id/unlock')
  async unlock(
    @Param('id') examId: string,
    @Body() data: { radiologistId: string },
  ) {
    await this.examsService.releaseLock(examId, data.radiologistId);
    return { success: true };
  }

  /**
   * POST /api/exams/:id/complete
   * Complete exam
   */
  @Post(':id/complete')
  async complete(
    @Param('id') examId: string,
    @Body() data: { radiologistId: string },
  ) {
    await this.examsService.completeExam(examId, data.radiologistId);
    return { success: true };
  }
}
