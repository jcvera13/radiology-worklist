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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Exam = void 0;
const typeorm_1 = require("typeorm");
const radiologist_entity_1 = require("../radiologists/radiologist.entity");
let Exam = class Exam {
};
exports.Exam = Exam;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Exam.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'accession_number', unique: true }),
    __metadata("design:type", String)
], Exam.prototype, "accessionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cpt_code' }),
    __metadata("design:type", String)
], Exam.prototype, "cptCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rvu_value', type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Exam.prototype, "rvuValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'routine' }),
    __metadata("design:type", String)
], Exam.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Exam.prototype, "subspecialty", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    __metadata("design:type", String)
], Exam.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to', nullable: true }),
    __metadata("design:type", String)
], Exam.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => radiologist_entity_1.Radiologist, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to' }),
    __metadata("design:type", radiologist_entity_1.Radiologist)
], Exam.prototype, "assignedRadiologist", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'locked_by', nullable: true }),
    __metadata("design:type", String)
], Exam.prototype, "lockedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'locked_at', nullable: true }),
    __metadata("design:type", Date)
], Exam.prototype, "lockedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', nullable: true }),
    __metadata("design:type", Date)
], Exam.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_mrn' }),
    __metadata("design:type", String)
], Exam.prototype, "patientMRN", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'patient_name', nullable: true }),
    __metadata("design:type", String)
], Exam.prototype, "patientName", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Exam.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Exam.prototype, "updatedAt", void 0);
exports.Exam = Exam = __decorate([
    (0, typeorm_1.Entity)('exams')
], Exam);
//# sourceMappingURL=exam.entity.js.map