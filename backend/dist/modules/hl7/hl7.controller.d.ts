import { HL7Service } from './hl7.service';
export declare class HL7Controller {
    private readonly hl7Service;
    constructor(hl7Service: HL7Service);
    ingest(data: {
        message: string;
    }): Promise<any>;
    generateMock(): {
        message: string;
    };
    createMockExam(): Promise<any>;
}
