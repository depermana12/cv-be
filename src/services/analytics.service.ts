import type { IAnalyticsRepository } from "../repositories/analytics.repo";
import type { IUserRepository } from "../repositories/user.repo";
import type {
  ApplicationMetrics,
  StatusDistribution,
  ApplicationTrends,
  PortalPerformance,
  MonthlyProgress,
  TimeRange,
  TimeToResponseResult,
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
  getAverageTimeToResponse(userId: number): Promise<TimeToResponseResult>;
  getMonthlyProgress(userId: number): Promise<MonthlyProgress>;
  getApplicationCountByMonth(
    userId: number,
    year: number,
    month: number,
  ): Promise<number>;
  getMonthlyApplicationRate(
    userId: number,
  ): Promise<{ thisMonth: number; lastMonth: number; growthRate: number }>;
}

export class AnalyticsService implements IAnalyticsService {
  constructor(
    private analyticsRepo: IAnalyticsRepository,
    private userRepo: IUserRepository,
  ) {}

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
      responseRate: this.calculatePercentage(interviews, totalApps),
      successRate: this.calculatePercentage(offers, totalApps),
    };
  }

  // =============================
  // DATA VISUALIZATION METRICS
  // =============================

  // 2. Status Distribution for Pie Chart
  async getStatusDistribution(userId: number) {
    const distribution = await this.analyticsRepo.getStatusDistribution(userId);

    // Ensure we always return data even if no applications exist
    if (distribution.length === 0) {
      return [
        {
          status: "No applications yet",
          count: 0,
        },
      ];
    }

    return distribution;
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
    const rawData = await this.analyticsRepo.getPortalPerformance(userId);

    // Add calculated success rates for each portal
    return rawData.map((portal) => ({
      ...portal,
      interviewRate: this.calculatePercentage(
        portal.interviews,
        portal.totalApplications,
      ),
      offerRate: this.calculatePercentage(
        portal.offers,
        portal.totalApplications,
      ),
    }));
  }

  // 5. Average Time to Response
  async getAverageTimeToResponse(
    userId: number,
  ): Promise<TimeToResponseResult> {
    const result = await this.analyticsRepo.getAverageTimeToResponse(userId);

    if (result === null) {
      return {
        avgDays: null,
        hasData: false,
        description: "No applications have reached interview stage yet",
      };
    }

    const roundedDays = this.roundToTwoDecimals(result);

    return {
      avgDays: roundedDays,
      hasData: true,
      description: `Average time from application to interview: ${roundedDays} days`,
    };
  }

  // =============================
  // GOAL TRACKING
  // =============================

  // 6. Monthly Goal Progress
  async getMonthlyProgress(userId: number) {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    now.setHours(0, 0, 0, 0); // Reset time to start of day

    const currentCount = await this.analyticsRepo.getMonthlyApplicationCount(
      userId,
      firstDayOfMonth,
    );

    const user = await this.userRepo.getByIdSafe(userId);
    const goal = user?.monthlyApplicationGoal ?? 30;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const remainingDays =
      (lastDayOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    // Add 1 to include today in the count
    const remainingDaysInt = Math.max(0, Math.floor(remainingDays) + 1);

    return {
      goal,
      current: currentCount,
      percentage: this.calculatePercentage(currentCount, goal),
      remainingItem: Math.max(0, goal - currentCount),
      remainingDays: remainingDaysInt,
    };
  }

  // Application Count by Specific Month
  async getApplicationCountByMonth(
    userId: number,
    year: number,
    month: number,
  ) {
    return this.analyticsRepo.getApplicationCountByMonth(userId, year, month);
  }

  // Current vs previous month
  async getMonthlyApplicationRate(userId: number) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed

    // Calculate previous month
    let previousYear = currentYear;
    let previousMonth = currentMonth - 1;

    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear = currentYear - 1;
    }

    const [thisMonth, lastMonth] = await Promise.all([
      this.getApplicationCountByMonth(userId, currentYear, currentMonth),
      this.getApplicationCountByMonth(userId, previousYear, previousMonth),
    ]);

    // Calculate growth rate percentage
    const growthRate =
      lastMonth === 0
        ? thisMonth > 0
          ? 100
          : 0
        : this.calculatePercentage(thisMonth - lastMonth, lastMonth);

    return {
      thisMonth,
      lastMonth,
      growthRate,
    };
  }

  // =============================
  // PRIVATE UTILITY METHODS
  // =============================

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private calculatePercentage(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return this.roundToTwoDecimals((numerator / denominator) * 100);
  }
}
