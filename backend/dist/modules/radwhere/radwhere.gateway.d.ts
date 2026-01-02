import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RadWhereService } from './radwhere.service';
import { ExamsService } from '../exams/exams.service';
import { AuditService } from '../audit/audit.service';
export declare class RadWhereGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private radWhereService;
    private examsService;
    private auditService;
    server: Server;
    private agentSocket;
    private webClients;
    constructor(radWhereService: RadWhereService, examsService: ExamsService, auditService: AuditService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleLogin(client: Socket, data: {
        username: string;
        password: string;
        radiologistId: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleOpenExam(client: Socket, data: {
        examId: string;
        radiologistId: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleAssociateOrders(client: Socket, data: {
        accessionNumbers: string[];
        radiologistId: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleGetAccessions(client: Socket): Promise<{
        success: boolean;
        error: string;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    handleUserLoggedIn(client: Socket, data: {
        userName: string;
        timestamp: string;
    }): Promise<void>;
    handleUserLoggedOut(client: Socket, data: {
        userName: string;
        timestamp: string;
    }): Promise<void>;
    handleReportOpened(client: Socket, data: {
        siteName: string;
        accessionNumbers: string;
        status: string;
        isAddendum: boolean;
        timestamp: string;
    }): Promise<void>;
    handleReportClosed(client: Socket, data: {
        siteName: string;
        accessionNumbers: string;
        status: string;
        isAddendum: boolean;
        timestamp: string;
    }): Promise<void>;
    handleAccessions(client: Socket, data: {
        accessions: string;
    }): void;
    handleError(client: Socket, data: {
        errorType: string;
        message: string;
        timestamp: string;
    }): Promise<void>;
    handleTerminated(client: Socket, data: {
        timestamp: string;
    }): Promise<void>;
    private broadcastToWebClients;
    isAgentConnected(): boolean;
    getWebClientCount(): number;
}
