import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExamsService } from './exams.service';
import { LocksService } from '../locks/locks.service';
export declare class ExamsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private examsService;
    private locksService;
    server: Server;
    private connectedClients;
    constructor(examsService: ExamsService, locksService: LocksService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleExamLock(client: Socket, data: {
        examId: string;
        radiologistId: string;
    }): Promise<{
        success: boolean;
        propagationTime: number;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        propagationTime?: undefined;
    }>;
    handleExamUnlock(client: Socket, data: {
        examId: string;
        radiologistId: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleExamComplete(client: Socket, data: {
        examId: string;
        radiologistId: string;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    handleExamAssign(client: Socket, data: {
        examId: string;
    }): Promise<{
        success: boolean;
        radiologistId?: string;
        reason: string;
    } | {
        success: boolean;
        error: any;
    }>;
    broadcastNewExam(exam: any): Promise<void>;
    broadcastExamUpdate(exam: any): Promise<void>;
    handlePing(client: Socket): {
        pong: boolean;
        connectedClients: number;
        timestamp: string;
    };
    handleHeartbeat(client: Socket, data: {
        userId: string;
    }): Promise<{
        success: boolean;
    }>;
}
