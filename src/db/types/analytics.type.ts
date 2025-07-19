export type JobApplicationStatus =
  | "applied"
  | "interview"
  | "offer"
  | "rejected"
  | "accepted"
  | "ghosted";

// Repository return types
export type ApplicationCount = {
  count: number;
};

export type StatusDistribution = {
  status: string;
  count: number;
};

export type ApplicationTrends = {
  date: string;
  count: number;
};

export type PortalPerformance = {
  portal: string;
  totalApplications: number;
  interviews: number;
  offers: number;
};

export type AverageTimeToResponse = {
  avgDays: number;
};

export type MonthlyApplicationCount = {
  count: number;
};

// Service return types
export type ApplicationMetrics = {
  totalApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
  responseRate: number;
  successRate: number;
};

export type MonthlyProgress = {
  goal: number;
  current: number;
  percentage: number;
  remaining: number;
};

export type TimeRange = "week" | "month" | "all";
