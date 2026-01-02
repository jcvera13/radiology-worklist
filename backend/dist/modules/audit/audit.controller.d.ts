import { AuditService } from './audit.service';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(limit?: string, offset?: string): Promise<import("./audit-log.entity").AuditLog[]>;
    findByActor(actor: string): Promise<import("./audit-log.entity").AuditLog[]>;
    getExamHistory(examId: string): Promise<import("./audit-log.entity").AuditLog[]>;
    getRadiologistActivity(id: string, days?: string): Promise<any>;
    getSystemStats(hours?: string): Promise<any>;
    verifyFairness(): Promise<any>;
}
