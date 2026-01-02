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
exports.RadWhereGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const radwhere_service_1 = require("./radwhere.service");
const exams_service_1 = require("../exams/exams.service");
const audit_service_1 = require("../audit/audit.service");
let RadWhereGateway = class RadWhereGateway {
    constructor(radWhereService, examsService, auditService) {
        this.radWhereService = radWhereService;
        this.examsService = examsService;
        this.auditService = auditService;
        this.agentSocket = null;
        this.webClients = new Map();
    }
    async handleConnection(client) {
        const clientType = client.handshake.query.clientType;
        if (clientType === 'agent') {
            this.agentSocket = client;
            console.log('RadWhere desktop agent connected');
            this.broadcastToWebClients('agent:status', { online: true });
            await this.auditService.log({
                actor: 'SYSTEM',
                action: 'RADWHERE_AGENT_CONNECTED',
                context: 'Desktop agent connected',
            });
        }
        else {
            this.webClients.set(client.id, client);
            client.emit('agent:status', { online: this.agentSocket !== null });
        }
    }
    async handleDisconnect(client) {
        if (client === this.agentSocket) {
            console.log('RadWhere desktop agent disconnected');
            this.agentSocket = null;
            this.broadcastToWebClients('agent:status', { online: false });
            await this.auditService.log({
                actor: 'SYSTEM',
                action: 'RADWHERE_AGENT_DISCONNECTED',
                context: 'Desktop agent disconnected',
            });
        }
        else {
            this.webClients.delete(client.id);
        }
    }
    async handleLogin(client, data) {
        if (!this.agentSocket) {
            return { success: false, error: 'Desktop agent not connected' };
        }
        try {
            this.agentSocket.emit('radwhere:login', {
                username: data.username,
                password: data.password,
            });
            await this.auditService.log({
                actor: data.radiologistId,
                actorId: data.radiologistId,
                action: 'PS_LOGIN_REQUESTED',
                context: `Login requested for user: ${data.username}`,
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleOpenExam(client, data) {
        if (!this.agentSocket) {
            return { success: false, error: 'Desktop agent not connected' };
        }
        try {
            const exam = await this.examsService.findAll();
            const targetExam = exam.find(e => e.id === data.examId);
            if (!targetExam) {
                return { success: false, error: 'Exam not found' };
            }
            await this.examsService.lockExam(data.examId, data.radiologistId);
            this.agentSocket.emit('radwhere:open-report', {
                siteName: '',
                accessionNumber: targetExam.accessionNumber,
            });
            await this.auditService.log({
                actor: data.radiologistId,
                actorId: data.radiologistId,
                action: 'PS_OPEN_REQUESTED',
                resourceType: 'exam',
                resourceId: data.examId,
                context: `Opening exam ${targetExam.accessionNumber} in PowerScribe`,
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleAssociateOrders(client, data) {
        if (!this.agentSocket) {
            return { success: false, error: 'Desktop agent not connected' };
        }
        try {
            const accessionString = data.accessionNumbers.join(',');
            this.agentSocket.emit('radwhere:associate-orders', {
                accessionNumbers: accessionString,
            });
            await this.auditService.log({
                actor: data.radiologistId,
                actorId: data.radiologistId,
                action: 'PS_ASSOCIATE_ORDERS',
                context: `Associated orders: ${accessionString}`,
            });
            return { success: true };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleGetAccessions(client) {
        if (!this.agentSocket) {
            return { success: false, error: 'Desktop agent not connected' };
        }
        this.agentSocket.emit('radwhere:get-accessions', {});
        return { success: true };
    }
    async handleUserLoggedIn(client, data) {
        console.log(`PowerScribe user logged in: ${data.userName}`);
        await this.radWhereService.setUserLoggedIn(data.userName);
        this.broadcastToWebClients('ps:user-logged-in', data);
        await this.auditService.log({
            actor: data.userName,
            action: 'PS_USER_LOGGED_IN',
            context: `User ${data.userName} logged into PowerScribe`,
        });
    }
    async handleUserLoggedOut(client, data) {
        console.log(`PowerScribe user logged out: ${data.userName}`);
        await this.radWhereService.setUserLoggedOut(data.userName);
        this.broadcastToWebClients('ps:user-logged-out', data);
        await this.auditService.log({
            actor: data.userName,
            action: 'PS_USER_LOGGED_OUT',
            context: `User ${data.userName} logged out of PowerScribe`,
        });
    }
    async handleReportOpened(client, data) {
        console.log(`Report opened: ${data.accessionNumbers}`);
        const exams = await this.examsService.findAll();
        const exam = exams.find(e => e.accessionNumber === data.accessionNumbers);
        if (exam) {
            await this.radWhereService.recordReportOpened(exam.id, data);
        }
        this.broadcastToWebClients('ps:report-opened', data);
        await this.auditService.log({
            actor: 'POWERSCRIBE',
            action: 'PS_REPORT_OPENED',
            resourceType: 'exam',
            resourceId: exam?.id,
            context: `Report opened: ${data.accessionNumbers} - Status: ${data.status}`,
            metadata: data,
        });
    }
    async handleReportClosed(client, data) {
        console.log(`Report closed: ${data.accessionNumbers}`);
        const exams = await this.examsService.findAll();
        const exam = exams.find(e => e.accessionNumber === data.accessionNumbers);
        if (exam) {
            await this.radWhereService.recordReportClosed(exam.id, data);
            if (data.status.toLowerCase() === 'signed' || data.status.toLowerCase() === 'final') {
                await this.examsService.completeExam(exam.id, exam.assignedTo);
            }
            else {
                await this.examsService.releaseLock(exam.id, exam.assignedTo);
            }
        }
        this.broadcastToWebClients('ps:report-closed', data);
        await this.auditService.log({
            actor: 'POWERSCRIBE',
            action: 'PS_REPORT_CLOSED',
            resourceType: 'exam',
            resourceId: exam?.id,
            context: `Report closed: ${data.accessionNumbers} - Status: ${data.status}`,
            metadata: data,
        });
    }
    handleAccessions(client, data) {
        this.broadcastToWebClients('ps:accessions', data);
    }
    async handleError(client, data) {
        console.error(`RadWhere error: ${data.errorType} - ${data.message}`);
        this.broadcastToWebClients('ps:error', data);
        await this.auditService.log({
            actor: 'POWERSCRIBE',
            action: 'PS_ERROR',
            context: `${data.errorType}: ${data.message}`,
            metadata: data,
        });
    }
    async handleTerminated(client, data) {
        console.log('RadWhere terminated');
        this.broadcastToWebClients('ps:terminated', data);
        await this.auditService.log({
            actor: 'SYSTEM',
            action: 'PS_TERMINATED',
            context: 'RadWhere control terminated',
        });
    }
    broadcastToWebClients(event, data) {
        this.webClients.forEach(client => {
            client.emit(event, data);
        });
    }
    isAgentConnected() {
        return this.agentSocket !== null;
    }
    getWebClientCount() {
        return this.webClients.size;
    }
};
exports.RadWhereGateway = RadWhereGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RadWhereGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ps:login'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RadWhereGateway.prototype, "handleLogin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ps:open-exam'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RadWhereGateway.prototype, "handleOpenExam", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ps:associate-orders'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RadWhereGateway.prototype, "handleAssociateOrders", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('ps:get-accessions'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], RadWhereGateway.prototype, "handleGetAccessions", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('radwhere:user-logged-in'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RadWhereGateway.prototype, "handleUserLoggedIn", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('radwhere:user-logged-out'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RadWhereGateway.prototype, "handleUserLoggedOut", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('radwhere:report-opened'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RadWhereGateway.prototype, "handleReportOpened", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('radwhere:report-closed'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RadWhereGateway.prototype, "handleReportClosed", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('radwhere:accessions'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], RadWhereGateway.prototype, "handleAccessions", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('radwhere:error'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RadWhereGateway.prototype, "handleError", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('radwhere:terminated'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], RadWhereGateway.prototype, "handleTerminated", null);
exports.RadWhereGateway = RadWhereGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [radwhere_service_1.RadWhereService,
        exams_service_1.ExamsService,
        audit_service_1.AuditService])
], RadWhereGateway);
//# sourceMappingURL=radwhere.gateway.js.map