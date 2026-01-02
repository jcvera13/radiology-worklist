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
exports.HL7Controller = void 0;
const common_1 = require("@nestjs/common");
const hl7_service_1 = require("./hl7.service");
let HL7Controller = class HL7Controller {
    constructor(hl7Service) {
        this.hl7Service = hl7Service;
    }
    async ingest(data) {
        return this.hl7Service.parseAndIngest(data.message);
    }
    generateMock() {
        return {
            message: this.hl7Service.generateMockHL7Message(),
        };
    }
    async createMockExam() {
        return this.hl7Service.generateMockExam();
    }
};
exports.HL7Controller = HL7Controller;
__decorate([
    (0, common_1.Post)('ingest'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], HL7Controller.prototype, "ingest", null);
__decorate([
    (0, common_1.Get)('generate-mock'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HL7Controller.prototype, "generateMock", null);
__decorate([
    (0, common_1.Post)('mock-exam'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HL7Controller.prototype, "createMockExam", null);
exports.HL7Controller = HL7Controller = __decorate([
    (0, common_1.Controller)('hl7'),
    __metadata("design:paramtypes", [hl7_service_1.HL7Service])
], HL7Controller);
//# sourceMappingURL=hl7.controller.js.map