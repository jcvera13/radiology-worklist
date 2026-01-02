import { Injectable } from '@nestjs/common';
import { LocksService } from '../locks/locks.service';

/**
 * RADWHERE STATE MANAGEMENT SERVICE
 * Tracks PowerScribe session state, open reports, and user status
 */
@Injectable()
export class RadWhereService {
  private currentUser: string | null = null;
  private openReports: Map<string, any> = new Map();

  constructor(private locksService: LocksService) {}

  /**
   * Set user logged in status
   */
  async setUserLoggedIn(userName: string): Promise<void> {
    this.currentUser = userName;
    
    // Store in Redis for distributed state
    await this.locksService.redis.set(
      'radwhere:current_user',
      userName,
      'EX',
      28800, // 8 hours
    );
  }

  /**
   * Set user logged out status
   */
  async setUserLoggedOut(userName: string): Promise<void> {
    if (this.currentUser === userName) {
      this.currentUser = null;
    }
    
    await this.locksService.redis.del('radwhere:current_user');
  }

  /**
   * Get current logged-in user
   */
  async getCurrentUser(): Promise<string | null> {
    if (this.currentUser) {
      return this.currentUser;
    }
    
    // Try to retrieve from Redis
    const user = await this.locksService.redis.get('radwhere:current_user');
    if (user) {
      this.currentUser = user;
    }
    
    return this.currentUser;
  }

  /**
   * Record that a report was opened
   */
  async recordReportOpened(examId: string, data: any): Promise<void> {
    this.openReports.set(examId, {
      ...data,
      openedAt: new Date(),
    });
    
    // Store in Redis
    await this.locksService.redis.set(
      `radwhere:report:${examId}`,
      JSON.stringify(data),
      'EX',
      3600, // 1 hour
    );
  }

  /**
   * Record that a report was closed
   */
  async recordReportClosed(examId: string, data: any): Promise<void> {
    this.openReports.delete(examId);
    
    // Remove from Redis
    await this.locksService.redis.del(`radwhere:report:${examId}`);
  }

  /**
   * Get all currently open reports
   */
  getOpenReports(): Map<string, any> {
    return this.openReports;
  }

  /**
   * Check if a specific exam is open in PowerScribe
   */
  async isReportOpen(examId: string): Promise<boolean> {
    if (this.openReports.has(examId)) {
      return true;
    }
    
    // Check Redis
    const exists = await this.locksService.redis.exists(`radwhere:report:${examId}`);
    return exists === 1;
  }

  /**
   * Get report details
   */
  async getReportDetails(examId: string): Promise<any | null> {
    if (this.openReports.has(examId)) {
      return this.openReports.get(examId);
    }
    
    // Try Redis
    const data = await this.locksService.redis.get(`radwhere:report:${examId}`);
    if (data) {
      return JSON.parse(data);
    }
    
    return null;
  }

  /**
   * Clear all state (for testing/reset)
   */
  async clearAll(): Promise<void> {
    this.currentUser = null;
    this.openReports.clear();
    
    await this.locksService.redis.del('radwhere:current_user');
    
    // Clear all report keys
    const reportKeys = await this.locksService.redis.keys('radwhere:report:*');
    if (reportKeys.length > 0) {
      await this.locksService.redis.del(...reportKeys);
    }
  }
}
