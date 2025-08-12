import type { IAIOptimizationRepository } from "../repositories/aiOptimization.repo";
import type { IAIProvider } from "./ai/openaiProvider";
import type {
  OptimizationRequestSelect,
  CvScoreSelect,
  SectionImproveRequest,
  CvScoreRequest,
  SectionImproveResponse,
  CvScoreResponse,
  UserUsageLimits,
} from "../db/types/aiOptimization.type";
import { BadRequestError } from "../errors/bad-request.error";
import {
  SECTION_REPHRASE_PROMPT,
  PROMPT_VERSION as REPHRASE_VERSION,
} from "../prompts/sectionRephrase";
import {
  CV_SCORING_PROMPT,
  PROMPT_VERSION as SCORING_VERSION,
} from "../prompts/cvScoring";
import { NotFoundError } from "../errors/not-found.error";

export interface IAIOptimizationService {
  // Section Improve
  improveSection(
    request: SectionImproveRequest,
    userId: number,
  ): Promise<{
    optimizationRequest: OptimizationRequestSelect;
    aiResponse: SectionImproveResponse;
  }>;

  // CV Scoring
  scoreCv(
    request: CvScoreRequest,
    userId: number,
  ): Promise<{
    optimizationRequest: OptimizationRequestSelect;
    score: CvScoreSelect;
    aiResponse: CvScoreResponse;
  }>;

  // CV Scores
  getLatestCvScore(cvId: number, userId: number): Promise<CvScoreSelect>;
  getCvScoreHistory(
    cvId: number,
    userId: number,
    limit?: number,
  ): Promise<CvScoreSelect[]>;

  // Usage Limits
  checkUserUsage(userId: number): Promise<UserUsageLimits>;
}

export class AIOptimizationService implements IAIOptimizationService {
  constructor(
    private readonly aiOptimizationRepository: IAIOptimizationRepository,
    private readonly aiProvider: IAIProvider,
  ) {}

  async improveSection(
    request: SectionImproveRequest,
    userId: number,
  ): Promise<{
    optimizationRequest: OptimizationRequestSelect;
    aiResponse: SectionImproveResponse;
  }> {
    // Check usage limits
    const usageLimits = await this.checkUserUsage(userId);
    if (!usageLimits.canUseAI) {
      throw new BadRequestError(
        `AI usage limit reached. You have used ${usageLimits.currentUsage}/${
          usageLimits.weeklyLimit
        } requests this week. Limit resets on ${usageLimits.resetDate.toDateString()}.`,
      );
    }

    // Create optimization request
    const optimizationRequest =
      await this.aiOptimizationRepository.createOptimizationRequest({
        cvId: request.cvId,
        userId,
        type: "section",
        status: "processing",
        targetRole: request.targetRole,
        industry: request.industry,
        promptVersion: REPHRASE_VERSION,
      });

    try {
      const payload = {
        section_type: request.sectionType,
        original_text: request.originalText,
        target_role: request.targetRole || "General",
        industry: request.industry || "General",
      };

      const aiResponse = await this.aiProvider.generateText(
        SECTION_REPHRASE_PROMPT,
        payload,
      );

      await this.aiOptimizationRepository.updateOptimizationRequest(
        optimizationRequest.id,
        userId,
        { status: "done" },
      );

      return {
        optimizationRequest: {
          ...optimizationRequest,
          status: "done",
        },
        aiResponse,
      };
    } catch (error) {
      await this.aiOptimizationRepository.updateOptimizationRequest(
        optimizationRequest.id,
        userId,
        {
          status: "error",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      );
      throw error;
    }
  }

  async scoreCv(
    request: CvScoreRequest,
    userId: number,
  ): Promise<{
    optimizationRequest: OptimizationRequestSelect;
    score: CvScoreSelect;
    aiResponse: CvScoreResponse;
  }> {
    const usageLimits = await this.checkUserUsage(userId);
    if (!usageLimits.canUseAI) {
      throw new BadRequestError(
        `AI usage limit reached. You have used ${usageLimits.currentUsage}/${
          usageLimits.weeklyLimit
        } requests this week. Limit resets on ${usageLimits.resetDate.toDateString()}.`,
      );
    }

    const optimizationRequest =
      await this.aiOptimizationRepository.createOptimizationRequest({
        cvId: request.cvId,
        userId,
        type: "score",
        status: "processing",
        targetRole: request.targetRole,
        industry: request.industry,
        promptVersion: SCORING_VERSION,
      });

    try {
      const payload = {
        full_text: request.fullText,
        target_role: request.targetRole || "General",
        industry: request.industry || "General",
      };

      const aiResponse = await this.aiProvider.generateText(
        CV_SCORING_PROMPT,
        payload,
      );

      const { structure, measurable, keyword_alignment } = aiResponse.scores;
      const overallScore = Math.round(
        (structure.score + measurable.score + keyword_alignment.score) / 3,
      );

      const score = await this.aiOptimizationRepository.createCvScore({
        optimizationRequestId: optimizationRequest.id,
        cvId: request.cvId,
        overallScore,
        dimensions: aiResponse.scores,
      });

      // Update request status to done
      await this.aiOptimizationRepository.updateOptimizationRequest(
        optimizationRequest.id,
        userId,
        { status: "done" },
      );

      return {
        optimizationRequest: {
          ...optimizationRequest,
          status: "done",
        },
        score,
        aiResponse,
      };
    } catch (error) {
      await this.aiOptimizationRepository.updateOptimizationRequest(
        optimizationRequest.id,
        userId,
        {
          status: "error",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      );
      throw error;
    }
  }

  async getLatestCvScore(cvId: number, userId: number): Promise<CvScoreSelect> {
    const result = await this.aiOptimizationRepository.getLatestCvScore(
      cvId,
      userId,
    );
    if (!result) {
      throw new NotFoundError("CV score not found");
    }
    return result;
  }

  async getCvScoreHistory(
    cvId: number,
    userId: number,
    limit = 10,
  ): Promise<CvScoreSelect[]> {
    return this.aiOptimizationRepository.getCvScoreHistory(cvId, userId, limit);
  }

  async checkUserUsage(userId: number): Promise<UserUsageLimits> {
    const [subscriptionType, currentUsage] = await Promise.all([
      this.aiOptimizationRepository.getUserSubscriptionType(userId),
      this.aiOptimizationRepository.getUserWeeklyUsage(userId),
    ]);

    const limits = {
      free: 3,
      trial: 10,
      pro: 30,
    };

    const userSubscriptionType = subscriptionType || "free";
    const weeklyLimit =
      limits[userSubscriptionType as keyof typeof limits] || limits.free;

    // Calculate next Monday for reset date
    const resetDate = new Date();
    const daysUntilMonday = (7 - resetDate.getDay() + 1) % 7 || 7;
    resetDate.setDate(resetDate.getDate() + daysUntilMonday);
    resetDate.setHours(0, 0, 0, 0);

    const canUseAI = currentUsage < weeklyLimit;

    return {
      weeklyLimit,
      currentUsage,
      resetDate,
      canUseAI,
    };
  }
}
