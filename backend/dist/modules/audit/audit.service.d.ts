import { Repository } from 'typeorm';
import { AuditLog } from './audit-log.entity';
export declare class AuditService {
    private auditRepository;
    constructor(auditRepository: Repository<AuditLog>);
    log(data: {
        actor: string;
        actorId?: string;
        action: string;
        resourceType?: string;
        resourceId?: string;
        context?: string;
        metadata?: Record<string, any>;
        ipAddress?: string;
    }): Promise<AuditLog>;
    findAll(limit?: number, offset?: number): Promise<AuditLog[]>;
    findByActor(actor: string): Promise<AuditLog[]>;
    findByResource(resourceType: string, resourceId: string): Promise<AuditLog[]>;
    findByAction(action: string): Promise<AuditLog[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<AuditLog[]>;
    getExamAssignmentHistory(examId: string): Promise<AuditLog[]>;
    getRadiologistActivity(radiologistId: string, days?: number): Promise<any>;
    getSystemStats(hours?: number): Promise<any>;
    verifyRVUFairness(): Promise<any>;
    private calculateFairnessScore;
}
