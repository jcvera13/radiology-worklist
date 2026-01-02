import { ExamsService } from './exams.service';
import { Exam } from './exam.entity';
export declare class ExamsController {
    private readonly examsService;
    constructor(examsService: ExamsService);
    findAll(): Promise<Exam[]>;
    findByRadiologist(id: string): Promise<Exam[]>;
    create(examData: Partial<Exam>): Promise<Exam>;
    assign(id: string): Promise<{
        success: boolean;
        radiologistId?: string;
        reason: string;
    }>;
    manualAssign(examId: string, data: {
        radiologistId: string;
        adminActor: string;
    }): Promise<{
        success: boolean;
    }>;
    lock(examId: string, data: {
        radiologistId: string;
    }): Promise<{
        success: boolean;
    }>;
    unlock(examId: string, data: {
        radiologistId: string;
    }): Promise<{
        success: boolean;
    }>;
    complete(examId: string, data: {
        radiologistId: string;
    }): Promise<{
        success: boolean;
    }>;
}
