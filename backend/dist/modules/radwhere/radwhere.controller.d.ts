import { RadWhereService } from './radwhere.service';
import { RadWhereGateway } from './radwhere.gateway';
export declare class RadWhereController {
    private readonly radWhereService;
    private readonly radWhereGateway;
    constructor(radWhereService: RadWhereService, radWhereGateway: RadWhereGateway);
    getStatus(): Promise<{
        agentConnected: boolean;
        currentUser: string;
        openReportsCount: number;
        webClientsConnected: number;
    }>;
    getOpenReports(): any[];
    clearState(): Promise<{
        success: boolean;
        message: string;
    }>;
}
