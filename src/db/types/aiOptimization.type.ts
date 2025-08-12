import { optimizationRequests, cvScores } from "../schema/aiOptimization.db";

export type OptimizationRequestSelect =
  typeof optimizationRequests.$inferSelect;
export type OptimizationRequestInsert =
  typeof optimizationRequests.$inferInsert;
export type OptimizationRequestUpdate = Partial<
  Omit<OptimizationRequestInsert, "id" | "createdAt">
>;

export type CvScoreSelect = typeof cvScores.$inferSelect;
export type CvScoreInsert = typeof cvScores.$inferInsert;

export type SectionImproveRequest = {
  cvId: number;
  sectionType: string;
  originalText: string;
  targetRole?: string;
  industry?: string;
};

export type CvScoreRequest = {
  cvId: number;
  fullText: string;
  targetRole?: string;
  industry?: string;
};

export type ScoreDimension = {
  score: number;
  rationale: string;
};

export type CvScoreResponse = {
  scores: {
    structure: ScoreDimension;
    measurable: ScoreDimension;
    keyword_alignment: ScoreDimension;
  };
};

export type SectionImproveResponse = {
  improved: string;
  keywords_detected: string[];
  verbs_replaced: { from: string; to: string }[];
  metrics_suggestions: string[];
};

// Usage limiting types
export type UserUsageLimits = {
  weeklyLimit: number;
  currentUsage: number;
  resetDate: Date;
  canUseAI: boolean;
};

export type SubscriptionLimits = {
  free: { weekly: 3 };
  trial: { weekly: 10 };
  pro: { weekly: 30 };
};
