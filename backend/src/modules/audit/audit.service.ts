import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';

/**
 * AUDIT LOGGING SERVICE
 * Every action in the system is logged for compliance and debugging
 */
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  /**
   * Create audit log entry
   */
  async log(data: {
    actor: string;
    actorId?: string;
    action: string;
    resourceType?: string;
    resourceId?: string;
    context?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }): Promise<AuditLog> {
    const log = this.auditRepository.create({
      actor: data.actor,
      actorId: data.actorId,
      action: data.action,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      context: data.context,
      metadata: data.metadata,
      ipAddress: data.ipAddress,
    });

    return this.auditRepository.save(log);
  }

  /**
   * Get all audit logs (paginated)
   */
  async findAll(limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    return this.auditRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get logs by actor
   */
  async findByActor(actor: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { actor },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Get logs by resource
   */
  async findByResource(resourceType: string, resourceId: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { resourceType, resourceId },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Get logs by action
   */
  async findByAction(action: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { action },
      order: { timestamp: 'DESC' },
    });
  }

  /**
   * Search logs by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]> {
    return this.auditRepository
      .createQueryBuilder('audit_log')
      .where('audit_log.timestamp >= :startDate', { startDate })
      .andWhere('audit_log.timestamp <= :endDate', { endDate })
      .orderBy('audit_log.timestamp', 'DESC')
      .getMany();
  }

  /**
   * Get assignment history for an exam
   */
  async getExamAssignmentHistory(examId: string): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: {
        resourceType: 'exam',
        resourceId: examId,
      },
      order: { timestamp: 'ASC' },
    });
  }

  /**
   * Get radiologist activity summary
   */
  async getRadiologistActivity(radiologistId: string, days: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await this.auditRepository
      .createQueryBuilder('audit_log')
      .where('audit_log.actor_id = :radiologistId', { radiologistId })
      .andWhere('audit_log.timestamp >= :startDate', { startDate })
      .getMany();

    const summary = {
      totalActions: logs.length,
      examsCompleted: logs.filter(l => l.action === 'EXAM_COMPLETED').length,
      locksAcquired: logs.filter(l => l.action === 'LOCK_ACQUIRED').length,
      actions: logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };

    return summary;
  }

  /**
   * Get system-wide statistics
   */
  async getSystemStats(hours: number = 24): Promise<any> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);

    const logs = await this.auditRepository
      .createQueryBuilder('audit_log')
      .where('audit_log.timestamp >= :startDate', { startDate })
      .getMany();

    return {
      totalEvents: logs.length,
      autoAssignments: logs.filter(l => l.action === 'AUTO_ASSIGN').length,
      manualAssignments: logs.filter(l => l.action === 'MANUAL_ASSIGN').length,
      examsCompleted: logs.filter(l => l.action === 'EXAM_COMPLETED').length,
      lockAcquisitions: logs.filter(l => l.action === 'LOCK_ACQUIRED').length,
      systemErrors: logs.filter(l => l.action === 'ERROR').length,
      uniqueActors: new Set(logs.map(l => l.actor)).size,
    };
  }

  /**
   * Verify RVU fairness by analyzing assignment patterns
   */
  async verifyRVUFairness(): Promise<any> {
    const assignments = await this.auditRepository.find({
      where: { action: 'AUTO_ASSIGN' },
      order: { timestamp: 'ASC' },
    });

    // Analyze assignment distribution
    const radiologistCounts = assignments.reduce((acc, log) => {
      const radName = log.context?.split('→')[1]?.split('(')[0]?.trim();
      if (radName) {
        acc[radName] = (acc[radName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAssignments: assignments.length,
      distributionByRadiologist: radiologistCounts,
      fairnessScore: this.calculateFairnessScore(Object.values(radiologistCounts)),
    };
  }

  /**
   * Calculate fairness score (0-1, where 1 is perfectly fair)
   */
  private calculateFairnessScore(counts: number[]): number {
    if (counts.length === 0) return 1;
    
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((acc, count) => acc + Math.pow(count - avg, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);
    
    // Normalize: lower std dev = higher fairness
    return Math.max(0, 1 - (stdDev / avg));
  }
}
