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
exports.Radiologist = void 0;
const typeorm_1 = require("typeorm");
let Radiologist = class Radiologist {
};
exports.Radiologist = Radiologist;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Radiologist.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Radiologist.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], Radiologist.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true, default: '{}' }),
    __metadata("design:type", Array)
], Radiologist.prototype, "subspecialties", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'max_rvu_per_shift',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 50.0,
    }),
    __metadata("design:type", Number)
], Radiologist.prototype, "maxRVUPerShift", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'offline' }),
    __metadata("design:type", String)
], Radiologist.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'current_shift_rvu',
        type: 'decimal',
        precision: 10,
        scale: 2,
        default: 0.0,
    }),
    __metadata("design:type", Number)
], Radiologist.prototype, "currentShiftRVU", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Radiologist.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Radiologist.prototype, "updatedAt", void 0);
exports.Radiologist = Radiologist = __decorate([
    (0, typeorm_1.Entity)('radiologists')
], Radiologist);
//# sourceMappingURL=radiologist.entity.js.map