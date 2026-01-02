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
exports.RadiologistsController = void 0;
const common_1 = require("@nestjs/common");
const radiologists_service_1 = require("./radiologists.service");
let RadiologistsController = class RadiologistsController {
    constructor(radiologistsService) {
        this.radiologistsService = radiologistsService;
    }
    async findAll() {
        return this.radiologistsService.findAll();
    }
    async findOne(id) {
        return this.radiologistsService.findOne(id);
    }
    async updateStatus(id, data) {
        await this.radiologistsService.updateStatus(id, data.status);
        return { success: true };
    }
    async resetRVU(id) {
        await this.radiologistsService.resetRVU(id);
        return { success: true };
    }
    async getWorkload(id) {
        return this.radiologistsService.getWorkload(id);
    }
};
exports.RadiologistsController = RadiologistsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RadiologistsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RadiologistsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RadiologistsController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Post)(':id/reset-rvu'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RadiologistsController.prototype, "resetRVU", null);
__decorate([
    (0, common_1.Get)(':id/workload'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RadiologistsController.prototype, "getWorkload", null);
exports.RadiologistsController = RadiologistsController = __decorate([
    (0, common_1.Controller)('radiologists'),
    __metadata("design:paramtypes", [radiologists_service_1.RadiologistsService])
], RadiologistsController);
//# sourceMappingURL=radiologists.controller.js.map