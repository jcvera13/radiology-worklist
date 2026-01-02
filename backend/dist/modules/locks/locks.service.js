"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocksService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
let LocksService = class LocksService {
    constructor() {
        this.redis = new ioredis_1.default({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT) || 6379,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
        this.redis.on('connect', () => {
            console.log('✅ Redis connected for lock management');
        });
        this.redis.on('error', (err) => {
            console.error('❌ Redis connection error:', err);
        });
    }
    async acquireLock(resourceId, ownerId, ttlSeconds = 1800) {
        const lockKey = `lock:exam:${resourceId}`;
        const result = await this.redis.set(lockKey, ownerId, 'EX', ttlSeconds, 'NX');
        return result === 'OK';
    }
    async releaseLock(resourceId) {
        const lockKey = `lock:exam:${resourceId}`;
        await this.redis.del(lockKey);
    }
    async isLocked(resourceId) {
        const lockKey = `lock:exam:${resourceId}`;
        const exists = await this.redis.exists(lockKey);
        return exists === 1;
    }
    async getLockOwner(resourceId) {
        const lockKey = `lock:exam:${resourceId}`;
        return this.redis.get(lockKey);
    }
    async extendLock(resourceId, additionalSeconds) {
        const lockKey = `lock:exam:${resourceId}`;
        const currentTTL = await this.redis.ttl(lockKey);
        if (currentTTL > 0) {
            await this.redis.expire(lockKey, currentTTL + additionalSeconds);
            return true;
        }
        return false;
    }
    async getCurrentRVU(radiologistId) {
        const key = `rvu:shift:${radiologistId}`;
        const value = await this.redis.get(key);
        return value ? parseFloat(value) : 0;
    }
    async incrementRVU(radiologistId, rvuValue) {
        const key = `rvu:shift:${radiologistId}`;
        const result = await this.redis.incrbyfloat(key, rvuValue);
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        const secondsUntilEndOfDay = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
        await this.redis.expire(key, secondsUntilEndOfDay);
        return parseFloat(result);
    }
    async resetRVU(radiologistId) {
        const key = `rvu:shift:${radiologistId}`;
        await this.redis.del(key);
    }
    async setUserPresence(userId, status) {
        const key = `presence:user:${userId}`;
        if (status === 'online') {
            await this.redis.set(key, 'online', 'EX', 300);
        }
        else {
            await this.redis.del(key);
        }
    }
    async getActiveUsers() {
        const keys = await this.redis.keys('presence:user:*');
        return keys.map((key) => key.replace('presence:user:', ''));
    }
    async atomicAssignment(examId, radiologistId, rvuValue) {
        const multi = this.redis.multi();
        multi.set(`lock:exam:${examId}`, radiologistId, 'EX', 1800, 'NX');
        multi.incrbyfloat(`rvu:shift:${radiologistId}`, rvuValue);
        multi.set(`exam:${examId}:status`, 'assigned');
        const results = await multi.exec();
        return results.every((result) => result[0] === null);
    }
    async healthCheck() {
        try {
            const pong = await this.redis.ping();
            return pong === 'PONG';
        }
        catch (error) {
            return false;
        }
    }
    async onModuleDestroy() {
        await this.redis.quit();
    }
};
exports.LocksService = LocksService;
exports.LocksService = LocksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LocksService);
//# sourceMappingURL=locks.service.js.map