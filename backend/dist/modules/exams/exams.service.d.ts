import { Repository } from 'typeorm';
import { Exam } from './exam.entity';
import { Assignment } from './assignment.entity';
import { Radiologist } from '../radiologists/radiologist.entity';
import { LocksService } from '../locks/locks.service';
import { AuditService } from '../audit/audit.service';
export declare class ExamsService {
    private examRepository;
    private assignmentRepository;
    private radiologistRepository;
    private locksService;
    private auditService;
    constructor(examRepository: Repository<Exam>, assignmentRepository: Repository<Assignment>, radiologistRepository: Repository<Radiologist>, locksService: LocksService, auditService: AuditService);
    assignExam(examId: string): Promise<{
        success: boolean;
        radiologistId?: string;
        reason: string;
    }>;
    manualAssign(examId: string, radiologistId: string, adminActor: string): Promise<void>;
    lockExam(examId: string, radiologistId: string): Promise<void>;
    releaseLock(examId: string, radiologistId: string): Promise<void>;
    completeExam(examId: string, radiologistId: string): Promise<void>;
    findAll(): Promise<Exam[]>;
    findByRadiologist(radiologistId: string): Promise<Exam[]>;
    create(examData: Partial<Exam>): Promise<Exam>;
}
