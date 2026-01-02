import { Injectable } from '@nestjs/common';
import { ExamsService } from '../exams/exams.service';

// CPT to subspecialty mapping
const CPT_SUBSPECIALTY_MAP: Record<string, { subspecialty: string; rvu: number }> = {
  '71045': { subspecialty: 'Chest', rvu: 0.78 },
  '71046': { subspecialty: 'Chest', rvu: 0.89 },
  '74177': { subspecialty: 'Body', rvu: 2.15 },
  '70450': { subspecialty: 'Neuro', rvu: 1.89 },
  '72148': { subspecialty: 'MSK', rvu: 2.44 },
  '73721': { subspecialty: 'MSK', rvu: 1.67 },
  '74183': { subspecialty: 'Body', rvu: 2.89 },
  '70553': { subspecialty: 'Neuro', rvu: 3.12 },
  '73218': { subspecialty: 'MSK', rvu: 2.21 },
  '71250': { subspecialty: 'Chest', rvu: 2.01 },
};

/**
 * HL7 MESSAGE PARSER SERVICE
 * Parses ORM and ORU messages and creates exams
 */
@Injectable()
export class HL7Service {
  constructor(private examsService: ExamsService) {}

  /**
   * Parse HL7 message and create exam
   * In production, use a proper HL7 parsing library
   */
  async parseAndIngest(hl7Message: string): Promise<any> {
    try {
      // Simple parser for demo (use proper HL7 library in production)
      const segments = hl7Message.split('\n');
      const msh = segments.find((s) => s.startsWith('MSH'));
      const pid = segments.find((s) => s.startsWith('PID'));
      const obr = segments.find((s) => s.startsWith('OBR'));

      if (!obr) {
        throw new Error('Missing OBR segment');
      }

      const obrFields = obr.split('|');
      const accessionNumber = obrFields[3] || this.generateAccessionNumber();
      const cptCode = obrFields[4]?.split('^')[0] || '71045';
      const priority = this.parsePriority(obrFields[5]);

      const cptInfo = CPT_SUBSPECIALTY_MAP[cptCode] || {
        subspecialty: 'General',
        rvu: 1.0,
      };

      // Extract patient MRN from PID segment
      const pidFields = pid?.split('|') || [];
      const patientMRN = pidFields[3] || `MRN${Math.floor(Math.random() * 1000000)}`;
      const patientName = pidFields[5] || 'Unknown Patient';

      // Create exam
      const exam = await this.examsService.create({
        accessionNumber,
        cptCode,
        rvuValue: cptInfo.rvu,
        priority,
        subspecialty: cptInfo.subspecialty,
        patientMRN,
        patientName,
        status: 'pending',
      });

      return {
        success: true,
        exam,
        message: 'HL7 message processed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate mock HL7 message for testing
   */
  generateMockHL7Message(): string {
    const accessionNumber = this.generateAccessionNumber();
    const cptCodes = Object.keys(CPT_SUBSPECIALTY_MAP);
    const cptCode = cptCodes[Math.floor(Math.random() * cptCodes.length)];
    const priorities = ['R', 'S', 'A']; // Routine, Stat, ASAP
    const priority = priorities[Math.floor(Math.random() * priorities.length)];
    const mrn = `MRN${Math.floor(Math.random() * 1000000)}`;

    return `MSH|^~\\&|SENDING_APP|SENDING_FAC|RECEIVING_APP|RECEIVING_FAC|20240101120000||ORM^O01|MSG${Date.now()}|P|2.5
PID|||${mrn}||DOE^JOHN||19800101|M
ORC|NW|${accessionNumber}||||${priority}
OBR|||${accessionNumber}|${cptCode}^CHEST XRAY||20240101120000`;
  }

  /**
   * Generate mock exam data (without HL7 parsing)
   */
  async generateMockExam(): Promise<any> {
    const cptCodes = Object.keys(CPT_SUBSPECIALTY_MAP);
    const cptCode = cptCodes[Math.floor(Math.random() * cptCodes.length)];
    const cptInfo = CPT_SUBSPECIALTY_MAP[cptCode];
    const priorities = ['routine', 'urgent', 'stat'];
    const priority = priorities[Math.floor(Math.random() * priorities.length)];

    const exam = await this.examsService.create({
      accessionNumber: this.generateAccessionNumber(),
      cptCode,
      rvuValue: cptInfo.rvu,
      priority,
      subspecialty: cptInfo.subspecialty,
      patientMRN: `MRN${Math.floor(Math.random() * 1000000)}`,
      patientName: this.generatePatientName(),
      status: 'pending',
    });

    return {
      success: true,
      exam,
    };
  }

  /**
   * Helper: Generate accession number
   */
  private generateAccessionNumber(): string {
    const prefix = 'ACC';
    const random = Math.random().toString(36).substring(2, 11).toUpperCase();
    return `${prefix}${random}`;
  }

  /**
   * Helper: Parse HL7 priority
   */
  private parsePriority(priorityCode: string): string {
    const map: Record<string, string> = {
      S: 'stat',
      A: 'urgent',
      R: 'routine',
    };
    return map[priorityCode] || 'routine';
  }

  /**
   * Helper: Generate random patient name
   */
  private generatePatientName(): string {
    const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${lastName}^${firstName}`;
  }
}
