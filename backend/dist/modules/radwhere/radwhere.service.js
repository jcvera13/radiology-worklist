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
exports.RadWhereService = void 0;
const common_1 = require("@nestjs/common");
const locks_service_1 = require("../locks/locks.service");
let RadWhereService = class RadWhereService {
    constructor(locksService) {
        this.locksService = locksService;
        this.currentUser = null;
        this.openReports = new Map();
    }
    async setUserLoggedIn(userName) {
        this.currentUser = userName;
        await this.locksService.redis.set('radwhere:current_user', userName, 'EX', 28800);
    }
    async setUserLoggedOut(userName) {
        if (this.currentUser === userName) {
            this.currentUser = null;
        }
        await this.locksService.redis.del('radwhere:current_user');
    }
    async getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }
        const user = await this.locksService.redis.get('radwhere:current_user');
        if (user) {
            this.currentUser = user;
        }
        return this.currentUser;
    }
    async recordReportOpened(examId, data) {
        this.openReports.set(examId, {
            ...data,
            openedAt: new Date(),
        });
        await this.locksService.redis.set(`radwhere:report:${examId}`, JSON.stringify(data), 'EX', 3600);
    }
    async recordReportClosed(examId, data) {
        this.openReports.delete(examId);
        await this.locksService.redis.del(`radwhere:report:${examId}`);
    }
    getOpenReports() {
        return this.openReports;
    }
    async isReportOpen(examId) {
        if (this.openReports.has(examId)) {
            return true;
        }
        const exists = await this.locksService.redis.exists(`radwhere:report:${examId}`);
        return exists === 1;
    }
    async getReportDetails(examId) {
        if (this.openReports.has(examId)) {
            return this.openReports.get(examId);
        }
        const data = await this.locksService.redis.get(`radwhere:report:${examId}`);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    }
    async clearAll() {
        this.currentUser = null;
        this.openReports.clear();
        await this.locksService.redis.del('radwhere:current_user');
        const reportKeys = await this.locksService.redis.keys('radwhere:report:*');
        if (reportKeys.length > 0) {
            await this.locksService.redis.del(...reportKeys);
        }
    }
};
exports.RadWhereService = RadWhereService;
exports.RadWhereService = RadWhereService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [locks_service_1.LocksService])
], RadWhereService);
//# sourceMappingURL=radwhere.service.js.map