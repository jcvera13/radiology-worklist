import { RadiologistsService } from './radiologists.service';
import { Radiologist } from './radiologist.entity';
export declare class RadiologistsController {
    private readonly radiologistsService;
    constructor(radiologistsService: RadiologistsService);
    findAll(): Promise<Radiologist[]>;
    findOne(id: string): Promise<Radiologist>;
    updateStatus(id: string, data: {
        status: string;
    }): Promise<{
        success: boolean;
    }>;
    resetRVU(id: string): Promise<{
        success: boolean;
    }>;
    getWorkload(id: string): Promise<any>;
}
