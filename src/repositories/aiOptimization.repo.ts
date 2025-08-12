import { and, count, desc, eq, gte } from "drizzle-orm";
import { optimizationRequests, cvScores } from "../db/schema/aiOptimization.db";
import { users } from "../db/schema/user.db";
import type {
  OptimizationRequestInsert,
  OptimizationRequestSelect,
  OptimizationRequestUpdate,
  CvScoreInsert,
  CvScoreSelect,
} from "../db/types/aiOptimization.type";
import type { Database } from "../db/index";

export interface IAIOptimizationRepository {
  // Optimization Requests
  createOptimizationRequest(
    data: OptimizationRequestInsert,
  ): Promise<OptimizationRequestSelect>;
  updateOptimizationRequest(
    id: number,
    userId: number,
    data: OptimizationRequestUpdate,
  ): Promise<OptimizationRequestSelect | null>;
  // CV Scores
  createCvScore(data: CvScoreInsert): Promise<CvScoreSelect>;
  getLatestCvScore(cvId: number, userId: number): Promise<CvScoreSelect | null>;
  getCvScoreHistory(
    cvId: number,
    userId: number,
    limit?: number,
  ): Promise<CvScoreSelect[]>;

  // Usage Limits
  getUserWeeklyUsage(userId: number): Promise<number>;
  getUserSubscriptionType(userId: number): Promise<string | null>;
}

export class AIOptimizationRepository implements IAIOptimizationRepository {
  constructor(private db: Database) {}

  // Optimization Requests
  async createOptimizationRequest(
    data: OptimizationRequestInsert,
  ): Promise<OptimizationRequestSelect> {
    const [result] = await this.db
      .insert(optimizationRequests)
      .values(data)
      .returning();
    return result;
  }

  async updateOptimizationRequest(
    id: number,
    userId: number,
    data: OptimizationRequestUpdate,
  ): Promise<OptimizationRequestSelect | null> {
    const [result] = await this.db
      .update(optimizationRequests)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(optimizationRequests.id, id),
          eq(optimizationRequests.userId, userId),
        ),
      )
      .returning();
    return result || null;
  }

  // CV Scores
  async createCvScore(data: CvScoreInsert): Promise<CvScoreSelect> {
    const [result] = await this.db.insert(cvScores).values(data).returning();
    return result;
  }

  async getLatestCvScore(
    cvId: number,
    userId: number,
  ): Promise<CvScoreSelect | null> {
    const [result] = await this.db
      .select()
      .from(cvScores)
      .innerJoin(
        optimizationRequests,
        eq(cvScores.optimizationRequestId, optimizationRequests.id),
      )
      .where(
        and(eq(cvScores.cvId, cvId), eq(optimizationRequests.userId, userId)),
      )
      .orderBy(desc(cvScores.createdAt))
      .limit(1);

    return result?.cv_scores || null;
  }

  async getCvScoreHistory(
    cvId: number,
    userId: number,
    limit = 10,
  ): Promise<CvScoreSelect[]> {
    const results = await this.db
      .select()
      .from(cvScores)
      .innerJoin(
        optimizationRequests,
        eq(cvScores.optimizationRequestId, optimizationRequests.id),
      )
      .where(
        and(eq(cvScores.cvId, cvId), eq(optimizationRequests.userId, userId)),
      )
      .orderBy(desc(cvScores.createdAt))
      .limit(limit);

    return results.map((r) => r.cv_scores);
  }

  // Usage Limits
  async getUserWeeklyUsage(userId: number): Promise<number> {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [{ count: usage }] = await this.db
      .select({ count: count() })
      .from(optimizationRequests)
      .where(
        and(
          eq(optimizationRequests.userId, userId),
          gte(optimizationRequests.createdAt, oneWeekAgo),
        ),
      );

    return usage;
  }

  async getUserSubscriptionType(userId: number): Promise<string | null> {
    const [user] = await this.db
      .select({
        subscriptionType: users.subscriptionType,
      })
      .from(users)
      .where(eq(users.id, userId));

    return user?.subscriptionType || null;
  }
}
