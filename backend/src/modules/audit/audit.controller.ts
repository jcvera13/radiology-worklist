import { Controller, Get, Query, Param } from '@nestjs/common';
import { AuditService } from './audit.service';

@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  /**
   * GET /api/audit
   * Get audit logs with pagination
   */
  @Get()
  async findAll(
    @Query('limit') limit: string = '100',
    @Query('offset') offset: string = '0',
  ) {
    return this.auditService.findAll(parseInt(limit), parseInt(offset));
  }

  /**
   * GET /api/audit/actor/:actor
   * Get logs by actor
   */
  @Get('actor/:actor')
  async findByActor(@Param('actor') actor: string) {
    return this.auditService.findByActor(actor);
  }

  /**
   * GET /api/audit/exam/:examId
   * Get exam assignment history
   */
  @Get('exam/:examId')
  async getExamHistory(@Param('examId') examId: string) {
    return this.auditService.getExamAssignmentHistory(examId);
  }

  /**
   * GET /api/audit/radiologist/:id/activity
   * Get radiologist activity summary
   */
  @Get('radiologist/:id/activity')
  async getRadiologistActivity(
    @Param('id') id: string,
    @Query('days') days: string = '7',
  ) {
    return this.auditService.getRadiologistActivity(id, parseInt(days));
  }

  /**
   * GET /api/audit/stats
   * Get system-wide statistics
   */
  @Get('stats')
  async getSystemStats(@Query('hours') hours: string = '24') {
    return this.auditService.getSystemStats(parseInt(hours));
  }

  /**
   * GET /api/audit/fairness
   * Verify RVU fairness
   */
  @Get('fairness')
  async verifyFairness() {
    return this.auditService.verifyRVUFairness();
  }
}
