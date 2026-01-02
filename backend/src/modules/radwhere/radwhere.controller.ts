import { Controller, Get, Post, Body } from '@nestjs/common';
import { RadWhereService } from './radwhere.service';
import { RadWhereGateway } from './radwhere.gateway';

@Controller('radwhere')
export class RadWhereController {
  constructor(
    private readonly radWhereService: RadWhereService,
    private readonly radWhereGateway: RadWhereGateway,
  ) {}

  /**
   * GET /api/radwhere/status
   * Get RadWhere agent status
   */
  @Get('status')
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

  /**
   * GET /api/radwhere/open-reports
   * Get all currently open reports
   */
  @Get('open-reports')
  getOpenReports() {
    const reports = this.radWhereService.getOpenReports();
    return Array.from(reports.entries()).map(([examId, data]) => ({
      examId,
      ...data,
    }));
  }

  /**
   * POST /api/radwhere/clear
   * Clear all RadWhere state (admin/testing)
   */
  @Post('clear')
  async clearState() {
    await this.radWhereService.clearAll();
    return { success: true, message: 'RadWhere state cleared' };
  }
}
