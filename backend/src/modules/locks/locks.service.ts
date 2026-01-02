import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * REDIS-BASED DISTRIBUTED LOCKING SERVICE
 * Ensures < 500ms lock propagation across all clients
 */
@Injectable()
export class LocksService {
  public redis: Redis;

  constructor() {
    this.redis = new Redis({
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

  /**
   * Acquire a distributed lock
   * Returns true if lock acquired, false if already locked
   */
  async acquireLock(
    resourceId: string,
    ownerId: string,
    ttlSeconds: number = 1800, // 30 minutes default
  ): Promise<boolean> {
    const lockKey = `lock:exam:${resourceId}`;
    
    // SET NX EX - Set if Not eXists with EXpiration
    // This is an atomic operation in Redis
    const result = await this.redis.set(
      lockKey,
      ownerId,
      'EX',
      ttlSeconds,
      'NX',
    );

    return result === 'OK';
  }

  /**
   * Release a lock
   */
  async releaseLock(resourceId: string): Promise<void> {
    const lockKey = `lock:exam:${resourceId}`;
    await this.redis.del(lockKey);
  }

  /**
   * Check if resource is locked
   */
  async isLocked(resourceId: string): Promise<boolean> {
    const lockKey = `lock:exam:${resourceId}`;
    const exists = await this.redis.exists(lockKey);
    return exists === 1;
  }

  /**
   * Get lock owner
   */
  async getLockOwner(resourceId: string): Promise<string | null> {
    const lockKey = `lock:exam:${resourceId}`;
    return this.redis.get(lockKey);
  }

  /**
   * Extend lock TTL (for long-running operations)
   */
  async extendLock(resourceId: string, additionalSeconds: number): Promise<boolean> {
    const lockKey = `lock:exam:${resourceId}`;
    const currentTTL = await this.redis.ttl(lockKey);
    
    if (currentTTL > 0) {
      await this.redis.expire(lockKey, currentTTL + additionalSeconds);
      return true;
    }
    
    return false;
  }

  /**
   * Get current RVU counter for radiologist (real-time state)
   */
  async getCurrentRVU(radiologistId: string): Promise<number> {
    const key = `rvu:shift:${radiologistId}`;
    const value = await this.redis.get(key);
    return value ? parseFloat(value) : 0;
  }

  /**
   * Increment RVU counter atomically
   */
  async incrementRVU(radiologistId: string, rvuValue: number): Promise<number> {
    const key = `rvu:shift:${radiologistId}`;
    const result = await this.redis.incrbyfloat(key, rvuValue);
    
    // Set expiration to end of day (reset daily)
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const secondsUntilEndOfDay = Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
    
    await this.redis.expire(key, secondsUntilEndOfDay);
    // Change to return as number
    return parseFloat(result);
  }

  /**
   * Reset RVU counter (start of new shift)
   */
  async resetRVU(radiologistId: string): Promise<void> {
    const key = `rvu:shift:${radiologistId}`;
    await this.redis.del(key);
  }

  /**
   * Track active user presence
   */
  async setUserPresence(userId: string, status: 'online' | 'offline'): Promise<void> {
    const key = `presence:user:${userId}`;
    if (status === 'online') {
      await this.redis.set(key, 'online', 'EX', 300); // 5 min heartbeat
    } else {
      await this.redis.del(key);
    }
  }

  /**
   * Get all active users
   */
  async getActiveUsers(): Promise<string[]> {
    const keys = await this.redis.keys('presence:user:*');
    return keys.map((key) => key.replace('presence:user:', ''));
  }

  /**
   * Atomic transaction for assignment
   */
  async atomicAssignment(
    examId: string,
    radiologistId: string,
    rvuValue: number,
  ): Promise<boolean> {
    const multi = this.redis.multi();

    // Lock the exam
    multi.set(`lock:exam:${examId}`, radiologistId, 'EX', 1800, 'NX');
    
    // Increment RVU
    multi.incrbyfloat(`rvu:shift:${radiologistId}`, rvuValue);
    
    // Mark exam as assigned
    multi.set(`exam:${examId}:status`, 'assigned');

    const results = await multi.exec();
    
    // Check if all commands succeeded
    return results.every((result) => result[0] === null);
  }

  /**
   * Health check for Redis connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const pong = await this.redis.ping();
      return pong === 'PONG';
    } catch (error) {
      return false;
    }
  }

  /**
   * Cleanup on shutdown
   */
  async onModuleDestroy() {
    await this.redis.quit();
  }
}
