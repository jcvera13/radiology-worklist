import { LocksService } from '../locks/locks.service';
export declare class RadWhereService {
    private locksService;
    private currentUser;
    private openReports;
    constructor(locksService: LocksService);
    setUserLoggedIn(userName: string): Promise<void>;
    setUserLoggedOut(userName: string): Promise<void>;
    getCurrentUser(): Promise<string | null>;
    recordReportOpened(examId: string, data: any): Promise<void>;
    recordReportClosed(examId: string, data: any): Promise<void>;
    getOpenReports(): Map<string, any>;
    isReportOpen(examId: string): Promise<boolean>;
    getReportDetails(examId: string): Promise<any | null>;
    clearAll(): Promise<void>;
}
