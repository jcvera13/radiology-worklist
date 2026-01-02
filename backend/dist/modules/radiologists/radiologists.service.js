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
exports.RadiologistsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const radiologist_entity_1 = require("./radiologist.entity");
const locks_service_1 = require("../locks/locks.service");
const exam_entity_1 = require("../exams/exam.entity");
let RadiologistsService = class RadiologistsService {
    constructor(radiologistRepository, examRepository, locksService) {
        this.radiologistRepository = radiologistRepository;
        this.examRepository = examRepository;
        this.locksService = locksService;
    }
    async findAll() {
        return this.radiologistRepository.find({
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const radiologist = await this.radiologistRepository.findOne({
            where: { id },
        });
        if (!radiologist) {
            throw new common_1.NotFoundException(`Radiologist with ID ${id} not found`);
        }
        return radiologist;
    }
    async updateStatus(id, status) {
        const radiologist = await this.findOne(id);
        radiologist.status = status;
        await this.radiologistRepository.save(radiologist);
        await this.locksService.setUserPresence(id, status === 'available' ? 'online' : 'offline');
    }
    async resetRVU(id) {
        const radiologist = await this.findOne(id);
        radiologist.currentShiftRVU = 0;
        await this.radiologistRepository.save(radiologist);
        await this.locksService.resetRVU(id);
    }
    async getWorkload(id) {
        const radiologist = await this.findOne(id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const assignedExams = await this.examRepository.count({
            where: {
                assignedTo: id,
                createdAt: today,
            },
        });
        const completedExams = await this.examRepository.count({
            where: {
                assignedTo: id,
                status: 'completed',
                createdAt: today,
            },
        });
        const lockedExams = await this.examRepository.count({
            where: {
                lockedBy: id,
            },
        });
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
    async findAvailableBySubspecialty(subspecialty) {
        const radiologists = await this.radiologistRepository.find({
            where: { status: 'available' },
        });
        return radiologists.filter((rad) => rad.subspecialties.includes(subspecialty) ||
            rad.subspecialties.includes('General'));
    }
};
exports.RadiologistsService = RadiologistsService;
exports.RadiologistsService = RadiologistsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(radiologist_entity_1.Radiologist)),
    __param(1, (0, typeorm_1.InjectRepository)(exam_entity_1.Exam)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        locks_service_1.LocksService])
], RadiologistsService);
//# sourceMappingURL=radiologists.service.js.map