import Redis from 'ioredis';
export declare class LocksService {
    redis: Redis;
    constructor();
    acquireLock(resourceId: string, ownerId: string, ttlSeconds?: number): Promise<boolean>;
    releaseLock(resourceId: string): Promise<void>;
    isLocked(resourceId: string): Promise<boolean>;
    getLockOwner(resourceId: string): Promise<string | null>;
    extendLock(resourceId: string, additionalSeconds: number): Promise<boolean>;
    getCurrentRVU(radiologistId: string): Promise<number>;
    incrementRVU(radiologistId: string, rvuValue: number): Promise<number>;
    resetRVU(radiologistId: string): Promise<void>;
    setUserPresence(userId: string, status: 'online' | 'offline'): Promise<void>;
    getActiveUsers(): Promise<string[]>;
    atomicAssignment(examId: string, radiologistId: string, rvuValue: number): Promise<boolean>;
    healthCheck(): Promise<boolean>;
    onModuleDestroy(): Promise<void>;
}
