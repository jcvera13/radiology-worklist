import { ExamsService } from '../exams/exams.service';
export declare class HL7Service {
    private examsService;
    constructor(examsService: ExamsService);
    parseAndIngest(hl7Message: string): Promise<any>;
    generateMockHL7Message(): string;
    generateMockExam(): Promise<any>;
    private generateAccessionNumber;
    private parsePriority;
    private generatePatientName;
}
