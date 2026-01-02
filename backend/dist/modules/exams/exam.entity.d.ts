import { Radiologist } from '../radiologists/radiologist.entity';
export declare class Exam {
    id: string;
    accessionNumber: string;
    cptCode: string;
    rvuValue: number;
    priority: string;
    subspecialty: string;
    status: string;
    assignedTo: string;
    assignedRadiologist: Radiologist;
    lockedBy: string;
    lockedAt: Date;
    completedAt: Date;
    patientMRN: string;
    patientName: string;
    createdAt: Date;
    updatedAt: Date;
}
