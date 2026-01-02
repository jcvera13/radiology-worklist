import { Exam } from './exam.entity';
import { Radiologist } from '../radiologists/radiologist.entity';
export declare class Assignment {
    id: string;
    examId: string;
    exam: Exam;
    radiologistId: string;
    radiologist: Radiologist;
    assignedAt: Date;
    status: string;
    assignmentType: string;
    rvuAtAssignment: number;
}
