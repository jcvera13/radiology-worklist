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
exports.ExamsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const exams_service_1 = require("./exams.service");
const locks_service_1 = require("../locks/locks.service");
let ExamsGateway = class ExamsGateway {
    constructor(examsService, locksService) {
        this.examsService = examsService;
        this.locksService = locksService;
        this.connectedClients = new Map();
    }
    async handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
        const userId = client.handshake.query.userId;
        if (userId) {
            this.connectedClients.set(client.id, { userId, socketId: client.id });
            await this.locksService.setUserPresence(userId, 'online');
        }
        const exams = await this.examsService.findAll();
        client.emit('exams:list', exams);
    }
    async handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        const clientInfo = this.connectedClients.get(client.id);
        if (clientInfo) {
            await this.locksService.setUserPresence(clientInfo.userId, 'offline');
            this.connectedClients.delete(client.id);
        }
    }
    async handleExamLock(client, data) {
        try {
            const startTime = Date.now();
            await this.examsService.lockExam(data.examId, data.radiologistId);
            const propagationTime = Date.now() - startTime;
            this.server.emit('exam:locked', {
                examId: data.examId,
                radiologistId: data.radiologistId,
                lockedAt: new Date().toISOString(),
                propagationTime,
            });
            return { success: true, propagationTime };
        }
        catch (error) {
            client.emit('exam:lock-failed', {
                examId: data.examId,
                reason: error.message,
            });
            return { success: false, error: error.message };
        }
    }
    async handleExamUnlock(client, data) {
        try {
            await this.examsService.releaseLock(data.examId, data.radiologistId);
            this.server.emit('exam:unlocked', {
                examId: data.examId,
                radiologistId: data.radiologistId,
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleExamComplete(client, data) {
        try {
            await this.examsService.completeExam(data.examId, data.radiologistId);
            this.server.emit('exam:completed', {
                examId: data.examId,
                radiologistId: data.radiologistId,
                completedAt: new Date().toISOString(),
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleExamAssign(client, data) {
        try {
            const result = await this.examsService.assignExam(data.examId);
            if (result.success) {
                const exam = await this.examsService.findAll();
                const assignedExam = exam.find(e => e.id === data.examId);
                this.server.emit('exam:assigned', {
                    examId: data.examId,
                    radiologistId: result.radiologistId,
                    exam: assignedExam,
                });
            }
            return result;
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async broadcastNewExam(exam) {
        this.server.emit('exam:new', exam);
    }
    async broadcastExamUpdate(exam) {
        this.server.emit('exam:updated', exam);
    }
    handlePing(client) {
        return {
            pong: true,
            connectedClients: this.connectedClients.size,
            timestamp: new Date().toISOString(),
        };
    }
    async handleHeartbeat(client, data) {
        await this.locksService.setUserPresence(data.userId, 'online');
        return { success: true };
    }
};
exports.ExamsGateway = ExamsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ExamsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('exam:lock'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ExamsGateway.prototype, "handleExamLock", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('exam:unlock'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ExamsGateway.prototype, "handleExamUnlock", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('exam:complete'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ExamsGateway.prototype, "handleExamComplete", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('exam:assign'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ExamsGateway.prototype, "handleExamAssign", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('system:ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ExamsGateway.prototype, "handlePing", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('user:heartbeat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], ExamsGateway.prototype, "handleHeartbeat", null);
exports.ExamsGateway = ExamsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [exams_service_1.ExamsService,
        locks_service_1.LocksService])
], ExamsGateway);
//# sourceMappingURL=exams.gateway.js.map