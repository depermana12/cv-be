import { and, count, eq, gte, sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import type { Database } from "../db/index.js";
import {
  jobApplications,
  jobApplicationStatuses,
} from "../db/schema/jobApplication.db.js";
import type {
  JobApplicationStatus,
  ApplicationCount,
  StatusDistribution,
  ApplicationTrends,
  PortalPerformanceRaw,
  AverageTimeToResponse,
  MonthlyApplicationCount,
  TimeRange,
} from "../db/types/analytics.type.js";

export interface IAnalyticsRepository {
  getApplicationCount(userId: number, timeFilter?: SQL): Promise<number>;
  getApplicationsByStatus(
    userId: number,
    status: JobApplicationStatus,
    timeFilter?: SQL,
  ): Promise<number>;
  getStatusDistribution(userId: number): Promise<StatusDistribution[]>;
  getApplicationTrends(
    userId: number,
    daysAgo: Date,
  ): Promise<ApplicationTrends[]>;
  getPortalPerformance(userId: number): Promise<PortalPerformanceRaw[]>;
  getAverageTimeToResponse(userId: number): Promise<number | null>;
  getMonthlyApplicationCount(
    userId: number,
    startOfMonth: Date,
  ): Promise<number>;
  getTimeFilter(timeRange?: TimeRange): SQL | undefined;
}

export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(private db: Database) {}

  async getApplicationCount(userId: number, timeFilter?: SQL) {
    const conditions = [eq(jobApplications.userId, userId)];
    if (timeFilter) {
      conditions.push(timeFilter);
    }

    const result = await this.db
      .select({ count: count() })
      .from(jobApplications)
      .where(and(...conditions));

    return result[0]?.count ?? 0;
  }

  async getApplicationsByStatus(
    userId: number,
    status: JobApplicationStatus,
    timeFilter?: SQL,
  ) {
    const conditions = [
      eq(jobApplications.userId, userId),
      eq(jobApplications.status, status),
    ];
    if (timeFilter) {
      conditions.push(timeFilter);
    }

    const result = await this.db
      .select({ count: count() })
      .from(jobApplications)
      .where(and(...conditions));

    return result[0]?.count ?? 0;
  }

  async getStatusDistribution(userId: number) {
    return this.db
      .select({
        status: jobApplications.status,
        count: count(),
      })
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .groupBy(jobApplications.status);
  }

  async getApplicationTrends(userId: number, daysAgo: Date) {
    return this.db
      .select({
        date: sql<string>`DATE(${jobApplications.appliedAt})`,
        count: count(),
      })
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.userId, userId),
          gte(jobApplications.appliedAt, daysAgo),
        ),
      )
      .groupBy(sql`DATE(${jobApplications.appliedAt})`)
      .orderBy(sql`DATE(${jobApplications.appliedAt})`);
  }

  async getPortalPerformance(userId: number) {
    return this.db
      .select({
        portal: jobApplications.jobPortal,
        totalApplications: count(),
        interviews: count(
          sql`CASE WHEN ${jobApplications.status} = 'interview' THEN 1 END`,
        ),
        offers: count(
          sql`CASE WHEN ${jobApplications.status} = 'offer' THEN 1 END`,
        ),
      })
      .from(jobApplications)
      .where(eq(jobApplications.userId, userId))
      .groupBy(jobApplications.jobPortal);
  }

  async getAverageTimeToResponse(userId: number) {
    const result = await this.db
      .select({
        avgDays: sql<number>`AVG(EXTRACT(EPOCH FROM (${jobApplicationStatuses.changedAt} - ${jobApplications.appliedAt})) / 86400)`,
      })
      .from(jobApplicationStatuses)
      .innerJoin(
        jobApplications,
        eq(jobApplicationStatuses.applicationId, jobApplications.id),
      )
      .where(
        and(
          eq(jobApplications.userId, userId),
          eq(jobApplicationStatuses.status, "interview"),
        ),
      );

    return result[0]?.avgDays ?? null;
  }

  async getMonthlyApplicationCount(userId: number, startOfMonth: Date) {
    const result = await this.db
      .select({ count: count() })
      .from(jobApplications)
      .where(
        and(
          eq(jobApplications.userId, userId),
          gte(jobApplications.appliedAt, startOfMonth),
        ),
      );

    return result[0]?.count ?? 0;
  }

  getTimeFilter(timeRange?: TimeRange): SQL | undefined {
    if (!timeRange || timeRange === "all") {
      return undefined;
    }

    const now = new Date();
    if (timeRange === "week") {
      now.setDate(now.getDate() - 7);
    } else if (timeRange === "month") {
      now.setDate(now.getDate() - 30);
    }

    return gte(jobApplications.appliedAt, now);
  }
}
