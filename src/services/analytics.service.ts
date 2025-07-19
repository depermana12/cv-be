import type { IAnalyticsRepository } from "../repositories/analytics.repo";
import type {
  ApplicationMetrics,
  StatusDistribution,
  ApplicationTrends,
  PortalPerformance,
  MonthlyProgress,
  TimeRange,
} from "../db/types/analytics.type";

export interface IAnalyticsService {
  getApplicationMetrics(
    userId: number,
    timeRange?: TimeRange,
  ): Promise<ApplicationMetrics>;
  getStatusDistribution(userId: number): Promise<StatusDistribution[]>;
  getApplicationTrends(
    userId: number,
    days?: number,
  ): Promise<ApplicationTrends[]>;
  getPortalPerformance(userId: number): Promise<PortalPerformance[]>;
  getAverageTimeToResponse(userId: number): Promise<number | null>;
  getMonthlyProgress(
    userId: number,
    monthlyGoal?: number,
  ): Promise<MonthlyProgress>;
}

export class AnalyticsService implements IAnalyticsService {
  constructor(private analyticsRepo: IAnalyticsRepository) {}

  // =============================
  // JOB APPLICATION ANALYTICS
  // =============================

  // 1. Job Application Metrics
  async getApplicationMetrics(userId: number, timeRange?: TimeRange) {
    const timeFilter = this.analyticsRepo.getTimeFilter(timeRange);

    const [totalApps, interviews, offers, rejections] = await Promise.all([
      this.analyticsRepo.getApplicationCount(userId, timeFilter),
      this.analyticsRepo.getApplicationsByStatus(
        userId,
        "interview",
        timeFilter,
      ),
      this.analyticsRepo.getApplicationsByStatus(userId, "offer", timeFilter),
      this.analyticsRepo.getApplicationsByStatus(
        userId,
        "rejected",
        timeFilter,
      ),
    ]);

    return {
      totalApplications: totalApps,
      interviews: interviews,
      offers: offers,
      rejections: rejections,
      responseRate: totalApps > 0 ? (interviews / totalApps) * 100 : 0,
      successRate: totalApps > 0 ? (offers / totalApps) * 100 : 0,
    };
  }

  // =============================
  // DATA VISUALIZATION METRICS
  // =============================

  // 2. Status Distribution for Pie Chart
  async getStatusDistribution(userId: number) {
    return this.analyticsRepo.getStatusDistribution(userId);
  }

  // 3. Applications Over Time (Line Chart)
  async getApplicationTrends(userId: number, days: number = 30) {
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    return this.analyticsRepo.getApplicationTrends(userId, daysAgo);
  }

  // =============================
  // PERFORMANCE ANALYTICS
  // =============================

  // 4. Performance by Job Portal
  async getPortalPerformance(userId: number) {
    return this.analyticsRepo.getPortalPerformance(userId);
  }

  // 5. Average Time to Response
  async getAverageTimeToResponse(userId: number) {
    return this.analyticsRepo.getAverageTimeToResponse(userId);
  }

  // =============================
  // GOAL TRACKING
  // =============================

  // 6. Monthly Goal Progress
  async getMonthlyProgress(userId: number, monthlyGoal: number = 20) {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const currentCount = await this.analyticsRepo.getMonthlyApplicationCount(
      userId,
      startOfMonth,
    );

    return {
      goal: monthlyGoal,
      current: currentCount,
      percentage: (currentCount / monthlyGoal) * 100,
      remaining: monthlyGoal - currentCount,
    };
  }

  // =============================
  // PRIVATE UTILITY METHODS
  // =============================
}
