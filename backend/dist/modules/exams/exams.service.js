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
exports.ExamsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const exam_entity_1 = require("./exam.entity");
const assignment_entity_1 = require("./assignment.entity");
const radiologist_entity_1 = require("../radiologists/radiologist.entity");
const locks_service_1 = require("../locks/locks.service");
const audit_service_1 = require("../audit/audit.service");
let ExamsService = class ExamsService {
    constructor(examRepository, assignmentRepository, radiologistRepository, locksService, auditService) {
        this.examRepository = examRepository;
        this.assignmentRepository = assignmentRepository;
        this.radiologistRepository = radiologistRepository;
        this.locksService = locksService;
        this.auditService = auditService;
    }
    async assignExam(examId) {
        const exam = await this.examRepository.findOne({ where: { id: examId } });
        if (!exam) {
            return { success: false, reason: 'Exam not found' };
        }
        if (exam.status !== 'pending') {
            return { success: false, reason: 'Exam already assigned' };
        }
        const availableRads = await this.radiologistRepository.find({
            where: { status: 'available' },
        });
        if (availableRads.length === 0) {
            return { success: false, reason: 'No available radiologists' };
        }
        const eligibleRads = availableRads.filter((rad) => rad.subspecialties.includes(exam.subspecialty) ||
            rad.subspecialties.includes('General'));
        if (eligibleRads.length === 0) {
            return { success: false, reason: `No radiologists with ${exam.subspecialty} subspecialty` };
        }
        const sorted = [...eligibleRads].sort((a, b) => a.currentShiftRVU - b.currentShiftRVU);
        let selectedRad = null;
        for (const rad of sorted) {
            if (rad.currentShiftRVU + exam.rvuValue <= rad.maxRVUPerShift) {
                selectedRad = rad;
                break;
            }
        }
        if (!selectedRad) {
            return { success: false, reason: 'All radiologists would exceed max RVU' };
        }
        try {
            exam.status = 'assigned';
            exam.assignedTo = selectedRad.id;
            await this.examRepository.save(exam);
            selectedRad.currentShiftRVU += exam.rvuValue;
            await this.radiologistRepository.save(selectedRad);
            const assignment = this.assignmentRepository.create({
                examId: exam.id,
                radiologistId: selectedRad.id,
                assignmentType: 'automatic',
                rvuAtAssignment: selectedRad.currentShiftRVU - exam.rvuValue,
            });
            await this.assignmentRepository.save(assignment);
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
        }
        catch (error) {
            return { success: false, reason: `Assignment failed: ${error.message}` };
        }
    }
    async manualAssign(examId, radiologistId, adminActor) {
        const exam = await this.examRepository.findOne({ where: { id: examId } });
        const radiologist = await this.radiologistRepository.findOne({ where: { id: radiologistId } });
        if (!exam || !radiologist) {
            throw new common_1.NotFoundException('Exam or Radiologist not found');
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
    async lockExam(examId, radiologistId) {
        const locked = await this.locksService.acquireLock(examId, radiologistId, 1800);
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
    async releaseLock(examId, radiologistId) {
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
    async completeExam(examId, radiologistId) {
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
    async findAll() {
        return this.examRepository.find({
            order: { createdAt: 'DESC' },
        });
    }
    async findByRadiologist(radiologistId) {
        return this.examRepository.find({
            where: { assignedTo: radiologistId },
            order: { createdAt: 'DESC' },
        });
    }
    async create(examData) {
        const exam = this.examRepository.create(examData);
        return this.examRepository.save(exam);
    }
};
exports.ExamsService = ExamsService;
exports.ExamsService = ExamsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(exam_entity_1.Exam)),
    __param(1, (0, typeorm_1.InjectRepository)(assignment_entity_1.Assignment)),
    __param(2, (0, typeorm_1.InjectRepository)(radiologist_entity_1.Radiologist)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        locks_service_1.LocksService,
        audit_service_1.AuditService])
], ExamsService);
//# sourceMappingURL=exams.service.js.map