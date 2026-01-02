import { Repository } from 'typeorm';
import { Radiologist } from './radiologist.entity';
import { LocksService } from '../locks/locks.service';
import { Exam } from '../exams/exam.entity';
export declare class RadiologistsService {
    private radiologistRepository;
    private examRepository;
    private locksService;
    constructor(radiologistRepository: Repository<Radiologist>, examRepository: Repository<Exam>, locksService: LocksService);
    findAll(): Promise<Radiologist[]>;
    findOne(id: string): Promise<Radiologist>;
    updateStatus(id: string, status: string): Promise<void>;
    resetRVU(id: string): Promise<void>;
    getWorkload(id: string): Promise<any>;
    findAvailableBySubspecialty(subspecialty: string): Promise<Radiologist[]>;
}
