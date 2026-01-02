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
exports.RadWhereController = void 0;
const common_1 = require("@nestjs/common");
const radwhere_service_1 = require("./radwhere.service");
const radwhere_gateway_1 = require("./radwhere.gateway");
let RadWhereController = class RadWhereController {
    constructor(radWhereService, radWhereGateway) {
        this.radWhereService = radWhereService;
        this.radWhereGateway = radWhereGateway;
    }
    async getStatus() {
        const currentUser = await this.radWhereService.getCurrentUser();
        const openReports = this.radWhereService.getOpenReports();
        return {
            agentConnected: this.radWhereGateway.isAgentConnected(),
            currentUser,
            openReportsCount: openReports.size,
            webClientsConnected: this.radWhereGateway.getWebClientCount(),
        };
    }
    getOpenReports() {
        const reports = this.radWhereService.getOpenReports();
        return Array.from(reports.entries()).map(([examId, data]) => ({
            examId,
            ...data,
        }));
    }
    async clearState() {
        await this.radWhereService.clearAll();
        return { success: true, message: 'RadWhere state cleared' };
    }
};
exports.RadWhereController = RadWhereController;
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RadWhereController.prototype, "getStatus", null);
__decorate([
    (0, common_1.Get)('open-reports'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RadWhereController.prototype, "getOpenReports", null);
__decorate([
    (0, common_1.Post)('clear'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RadWhereController.prototype, "clearState", null);
exports.RadWhereController = RadWhereController = __decorate([
    (0, common_1.Controller)('radwhere'),
    __metadata("design:paramtypes", [radwhere_service_1.RadWhereService,
        radwhere_gateway_1.RadWhereGateway])
], RadWhereController);
//# sourceMappingURL=radwhere.controller.js.map