import { cv } from "../schema/cv.db";

export type CvSelect = typeof cv.$inferSelect;
export type CvInsert = typeof cv.$inferInsert;
export type CvUpdate = Partial<Omit<CvInsert, "id" | "userId">>;

export type CvQueryOptions = {
  search?: string;
  sortBy?: keyof CvSelect;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
  isPublic?: boolean;
  from?: Date;
  to?: Date;
};

export type PaginatedCvResponse = {
  data: CvSelect[];
  total: number;
  limit: number;
  offset: number;
};

export type CvStats = {
  totalViews: number;
  totalDownloads: number;
  totalCvs: number;
};
