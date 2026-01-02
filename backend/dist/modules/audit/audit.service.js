"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_log_entity_1 = require("./audit-log.entity");
let AuditService = class AuditService {
    constructor(auditRepository) {
        this.auditRepository = auditRepository;
    }
    async log(data) {
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
    async findAll(limit = 100, offset = 0) {
        return this.auditRepository.find({
            order: { timestamp: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async findByActor(actor) {
        return this.auditRepository.find({
            where: { actor },
            order: { timestamp: 'DESC' },
        });
    }
    async findByResource(resourceType, resourceId) {
        return this.auditRepository.find({
            where: { resourceType, resourceId },
            order: { timestamp: 'DESC' },
        });
    }
    async findByAction(action) {
        return this.auditRepository.find({
            where: { action },
            order: { timestamp: 'DESC' },
        });
    }
    async findByDateRange(startDate, endDate) {
        return this.auditRepository
            .createQueryBuilder('audit_log')
            .where('audit_log.timestamp >= :startDate', { startDate })
            .andWhere('audit_log.timestamp <= :endDate', { endDate })
            .orderBy('audit_log.timestamp', 'DESC')
            .getMany();
    }
    async getExamAssignmentHistory(examId) {
        return this.auditRepository.find({
            where: {
                resourceType: 'exam',
                resourceId: examId,
            },
            order: { timestamp: 'ASC' },
        });
    }
    async getRadiologistActivity(radiologistId, days = 7) {
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
            }, {}),
        };
        return summary;
    }
    async getSystemStats(hours = 24) {
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
    async verifyRVUFairness() {
        const assignments = await this.auditRepository.find({
            where: { action: 'AUTO_ASSIGN' },
            order: { timestamp: 'ASC' },
        });
        const radiologistCounts = assignments.reduce((acc, log) => {
            const radName = log.context?.split('→')[1]?.split('(')[0]?.trim();
            if (radName) {
                acc[radName] = (acc[radName] || 0) + 1;
            }
            return acc;
        }, {});
        return {
            totalAssignments: assignments.length,
            distributionByRadiologist: radiologistCounts,
            fairnessScore: this.calculateFairnessScore(Object.values(radiologistCounts)),
        };
    }
    calculateFairnessScore(counts) {
        if (counts.length === 0)
            return 1;
        const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
        const variance = counts.reduce((acc, count) => acc + Math.pow(count - avg, 2), 0) / counts.length;
        const stdDev = Math.sqrt(variance);
        return Math.max(0, 1 - (stdDev / avg));
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_log_entity_1.AuditLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map