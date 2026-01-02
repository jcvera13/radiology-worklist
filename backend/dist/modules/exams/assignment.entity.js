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
exports.Assignment = void 0;
const typeorm_1 = require("typeorm");
const exam_entity_1 = require("./exam.entity");
const radiologist_entity_1 = require("../radiologists/radiologist.entity");
let Assignment = class Assignment {
};
exports.Assignment = Assignment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Assignment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'exam_id' }),
    __metadata("design:type", String)
], Assignment.prototype, "examId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => exam_entity_1.Exam),
    (0, typeorm_1.JoinColumn)({ name: 'exam_id' }),
    __metadata("design:type", exam_entity_1.Exam)
], Assignment.prototype, "exam", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'radiologist_id' }),
    __metadata("design:type", String)
], Assignment.prototype, "radiologistId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => radiologist_entity_1.Radiologist),
    (0, typeorm_1.JoinColumn)({ name: 'radiologist_id' }),
    __metadata("design:type", radiologist_entity_1.Radiologist)
], Assignment.prototype, "radiologist", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'assigned_at' }),
    __metadata("design:type", Date)
], Assignment.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'assigned' }),
    __metadata("design:type", String)
], Assignment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assignment_type', default: 'automatic' }),
    __metadata("design:type", String)
], Assignment.prototype, "assignmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'rvu_at_assignment',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Number)
], Assignment.prototype, "rvuAtAssignment", void 0);
exports.Assignment = Assignment = __decorate([
    (0, typeorm_1.Entity)('assignments')
], Assignment);
//# sourceMappingURL=assignment.entity.js.map