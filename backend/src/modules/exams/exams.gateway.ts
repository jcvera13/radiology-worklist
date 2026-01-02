import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ExamsService } from './exams.service';
import { LocksService } from '../locks/locks.service';

/**
 * WEBSOCKET GATEWAY FOR REAL-TIME UPDATES
 * Ensures < 500ms lock propagation to all connected clients
 */
@WebSocketGateway({
  cors: {
    origin: '*', // Configure appropriately for production
  },
})
export class ExamsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, { userId: string; socketId: string }> = new Map();

  constructor(
    private examsService: ExamsService,
    private locksService: LocksService,
  ) {}

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    
    // Extract user ID from handshake (in production, verify auth token)
    const userId = client.handshake.query.userId as string;
    
    if (userId) {
      this.connectedClients.set(client.id, { userId, socketId: client.id });
      await this.locksService.setUserPresence(userId, 'online');
    }

    // Send initial data
    const exams = await this.examsService.findAll();
    client.emit('exams:list', exams);
  }

  /**
   * Handle client disconnection
   */
  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    
    const clientInfo = this.connectedClients.get(client.id);
    if (clientInfo) {
      await this.locksService.setUserPresence(clientInfo.userId, 'offline');
      this.connectedClients.delete(client.id);
    }
  }

  /**
   * Client requests to lock an exam
   */
  @SubscribeMessage('exam:lock')
  async handleExamLock(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { examId: string; radiologistId: string },
  ) {
    try {
      const startTime = Date.now();
      
      // Attempt to lock exam
      await this.examsService.lockExam(data.examId, data.radiologistId);
      
      const propagationTime = Date.now() - startTime;

      // Broadcast lock to ALL clients (< 500ms requirement)
      this.server.emit('exam:locked', {
        examId: data.examId,
        radiologistId: data.radiologistId,
        lockedAt: new Date().toISOString(),
        propagationTime,
      });

      return { success: true, propagationTime };
    } catch (error) {
      client.emit('exam:lock-failed', {
        examId: data.examId,
        reason: error.message,
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Client releases exam lock
   */
  @SubscribeMessage('exam:unlock')
  async handleExamUnlock(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { examId: string; radiologistId: string },
  ) {
    try {
      await this.examsService.releaseLock(data.examId, data.radiologistId);

      // Broadcast unlock to ALL clients
      this.server.emit('exam:unlocked', {
        examId: data.examId,
        radiologistId: data.radiologistId,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Client completes an exam
   */
  @SubscribeMessage('exam:complete')
  async handleExamComplete(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { examId: string; radiologistId: string },
  ) {
    try {
      await this.examsService.completeExam(data.examId, data.radiologistId);

      // Broadcast completion to ALL clients
      this.server.emit('exam:completed', {
        examId: data.examId,
        radiologistId: data.radiologistId,
        completedAt: new Date().toISOString(),
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Client requests exam assignment
   */
  @SubscribeMessage('exam:assign')
  async handleExamAssign(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { examId: string },
  ) {
    try {
      const result = await this.examsService.assignExam(data.examId);

      if (result.success) {
        const exam = await this.examsService.findAll();
        const assignedExam = exam.find(e => e.id === data.examId);

        // Broadcast assignment to ALL clients
        this.server.emit('exam:assigned', {
          examId: data.examId,
          radiologistId: result.radiologistId,
          exam: assignedExam,
        });
      }

      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Broadcast new exam to all clients
   */
  async broadcastNewExam(exam: any) {
    this.server.emit('exam:new', exam);
  }

  /**
   * Broadcast exam update to all clients
   */
  async broadcastExamUpdate(exam: any) {
    this.server.emit('exam:updated', exam);
  }

  /**
   * Get connected clients count
   */
  @SubscribeMessage('system:ping')
  handlePing(client: Socket) {
    return {
      pong: true,
      connectedClients: this.connectedClients.size,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Heartbeat to maintain presence
   */
  @SubscribeMessage('user:heartbeat')
  async handleHeartbeat(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    await this.locksService.setUserPresence(data.userId, 'online');
    return { success: true };
  }
}
