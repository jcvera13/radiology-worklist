export declare class AuditLog {
    id: string;
    actor: string;
    actorId: string;
    action: string;
    resourceType: string;
    resourceId: string;
    context: string;
    metadata: Record<string, any>;
    ipAddress: string;
    timestamp: Date;
}
