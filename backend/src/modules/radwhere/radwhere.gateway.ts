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
import { RadWhereService } from './radwhere.service';
import { ExamsService } from '../exams/exams.service';
import { AuditService } from '../audit/audit.service';

/**
 * RADWHERE WEBSOCKET GATEWAY
 * Manages communication between web frontend and desktop RadWhere agent
 */
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RadWhereGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private agentSocket: Socket | null = null;
  private webClients: Map<string, Socket> = new Map();

  constructor(
    private radWhereService: RadWhereService,
    private examsService: ExamsService,
    private auditService: AuditService,
  ) {}

  /**
   * Handle client connection
   * Distinguish between desktop agent and web clients
   */
  async handleConnection(client: Socket) {
    const clientType = client.handshake.query.clientType as string;
    
    if (clientType === 'agent') {
      // Desktop agent connected
      this.agentSocket = client;
      console.log('RadWhere desktop agent connected');
      
      // Notify all web clients that agent is online
      this.broadcastToWebClients('agent:status', { online: true });
      
      await this.auditService.log({
        actor: 'SYSTEM',
        action: 'RADWHERE_AGENT_CONNECTED',
        context: 'Desktop agent connected',
      });
    } else {
      // Web client connected
      this.webClients.set(client.id, client);
      
      // Send agent status to new client
      client.emit('agent:status', { online: this.agentSocket !== null });
    }
  }

  /**
   * Handle client disconnection
   */
  async handleDisconnect(client: Socket) {
    if (client === this.agentSocket) {
      console.log('RadWhere desktop agent disconnected');
      this.agentSocket = null;
      
      // Notify all web clients
      this.broadcastToWebClients('agent:status', { online: false });
      
      await this.auditService.log({
        actor: 'SYSTEM',
        action: 'RADWHERE_AGENT_DISCONNECTED',
        context: 'Desktop agent disconnected',
      });
    } else {
      this.webClients.delete(client.id);
    }
  }

  // ==================== WEB CLIENT → AGENT COMMANDS ====================

  /**
   * Web client requests to login to PowerScribe
   */
  @SubscribeMessage('ps:login')
  async handleLogin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { username: string; password: string; radiologistId: string },
  ) {
    if (!this.agentSocket) {
      return { success: false, error: 'Desktop agent not connected' };
    }

    try {
      // Forward to desktop agent
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
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Web client requests to open exam in PowerScribe
   */
  @SubscribeMessage('ps:open-exam')
  async handleOpenExam(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { examId: string; radiologistId: string },
  ) {
    if (!this.agentSocket) {
      return { success: false, error: 'Desktop agent not connected' };
    }

    try {
      // Get exam details
      const exam = await this.examsService.findAll();
      const targetExam = exam.find(e => e.id === data.examId);

      if (!targetExam) {
        return { success: false, error: 'Exam not found' };
      }

      // Lock exam first
      await this.examsService.lockExam(data.examId, data.radiologistId);

      // Forward to desktop agent
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
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Web client requests to associate multiple orders
   */
  @SubscribeMessage('ps:associate-orders')
  async handleAssociateOrders(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { accessionNumbers: string[]; radiologistId: string },
  ) {
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
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current accession numbers from PowerScribe
   */
  @SubscribeMessage('ps:get-accessions')
  async handleGetAccessions(@ConnectedSocket() client: Socket) {
    if (!this.agentSocket) {
      return { success: false, error: 'Desktop agent not connected' };
    }

    this.agentSocket.emit('radwhere:get-accessions', {});
    return { success: true };
  }

  // ==================== AGENT → WEB CLIENT EVENTS ====================

  /**
   * Agent reports user logged in
   */
  @SubscribeMessage('radwhere:user-logged-in')
  async handleUserLoggedIn(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userName: string; timestamp: string },
  ) {
    console.log(`PowerScribe user logged in: ${data.userName}`);

    // Update RadWhere service state
    await this.radWhereService.setUserLoggedIn(data.userName);

    // Broadcast to all web clients
    this.broadcastToWebClients('ps:user-logged-in', data);

    await this.auditService.log({
      actor: data.userName,
      action: 'PS_USER_LOGGED_IN',
      context: `User ${data.userName} logged into PowerScribe`,
    });
  }

  /**
   * Agent reports user logged out
   */
  @SubscribeMessage('radwhere:user-logged-out')
  async handleUserLoggedOut(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userName: string; timestamp: string },
  ) {
    console.log(`PowerScribe user logged out: ${data.userName}`);

    await this.radWhereService.setUserLoggedOut(data.userName);

    this.broadcastToWebClients('ps:user-logged-out', data);

    await this.auditService.log({
      actor: data.userName,
      action: 'PS_USER_LOGGED_OUT',
      context: `User ${data.userName} logged out of PowerScribe`,
    });
  }

  /**
   * Agent reports report opened
   */
  @SubscribeMessage('radwhere:report-opened')
  async handleReportOpened(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      siteName: string;
      accessionNumbers: string;
      status: string;
      isAddendum: boolean;
      timestamp: string;
    },
  ) {
    console.log(`Report opened: ${data.accessionNumbers}`);

    // Find exam by accession number
    const exams = await this.examsService.findAll();
    const exam = exams.find(e => e.accessionNumber === data.accessionNumbers);

    if (exam) {
      await this.radWhereService.recordReportOpened(exam.id, data);
    }

    // Broadcast to all web clients
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

  /**
   * Agent reports report closed
   */
  @SubscribeMessage('radwhere:report-closed')
  async handleReportClosed(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      siteName: string;
      accessionNumbers: string;
      status: string;
      isAddendum: boolean;
      timestamp: string;
    },
  ) {
    console.log(`Report closed: ${data.accessionNumbers}`);

    // Find exam by accession number
    const exams = await this.examsService.findAll();
    const exam = exams.find(e => e.accessionNumber === data.accessionNumbers);

    if (exam) {
      await this.radWhereService.recordReportClosed(exam.id, data);
      
      // If status is "signed" or "finalized", complete the exam
      if (data.status.toLowerCase() === 'signed' || data.status.toLowerCase() === 'final') {
        await this.examsService.completeExam(exam.id, exam.assignedTo);
      } else {
        // Otherwise just release the lock
        await this.examsService.releaseLock(exam.id, exam.assignedTo);
      }
    }

    // Broadcast to all web clients
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

  /**
   * Agent reports current accession numbers
   */
  @SubscribeMessage('radwhere:accessions')
  handleAccessions(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { accessions: string },
  ) {
    // Broadcast to all web clients
    this.broadcastToWebClients('ps:accessions', data);
  }

  /**
   * Agent reports error
   */
  @SubscribeMessage('radwhere:error')
  async handleError(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { errorType: string; message: string; timestamp: string },
  ) {
    console.error(`RadWhere error: ${data.errorType} - ${data.message}`);

    // Broadcast to all web clients
    this.broadcastToWebClients('ps:error', data);

    await this.auditService.log({
      actor: 'POWERSCRIBE',
      action: 'PS_ERROR',
      context: `${data.errorType}: ${data.message}`,
      metadata: data,
    });
  }

  /**
   * Agent reports terminated
   */
  @SubscribeMessage('radwhere:terminated')
  async handleTerminated(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { timestamp: string },
  ) {
    console.log('RadWhere terminated');

    this.broadcastToWebClients('ps:terminated', data);

    await this.auditService.log({
      actor: 'SYSTEM',
      action: 'PS_TERMINATED',
      context: 'RadWhere control terminated',
    });
  }

  // ==================== HELPER METHODS ====================

  /**
   * Broadcast message to all web clients
   */
  private broadcastToWebClients(event: string, data: any) {
    this.webClients.forEach(client => {
      client.emit(event, data);
    });
  }

  /**
   * Check if desktop agent is connected
   */
  isAgentConnected(): boolean {
    return this.agentSocket !== null;
  }

  /**
   * Get number of connected web clients
   */
  getWebClientCount(): number {
    return this.webClients.size;
  }
}
