import { Controller, Post, Body, Get } from '@nestjs/common';
import { HL7Service } from './hl7.service';

@Controller('hl7')
export class HL7Controller {
  constructor(private readonly hl7Service: HL7Service) {}

  /**
   * POST /api/hl7/ingest
   * Receive and parse HL7 message
   */
  @Post('ingest')
  async ingest(@Body() data: { message: string }) {
    return this.hl7Service.parseAndIngest(data.message);
  }

  /**
   * GET /api/hl7/generate-mock
   * Generate mock HL7 message for testing
   */
  @Get('generate-mock')
  generateMock() {
    return {
      message: this.hl7Service.generateMockHL7Message(),
    };
  }

  /**
   * POST /api/hl7/mock-exam
   * Generate and ingest mock exam (shortcut for testing)
   */
  @Post('mock-exam')
  async createMockExam() {
    return this.hl7Service.generateMockExam();
  }
}
