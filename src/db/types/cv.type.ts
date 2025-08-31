import { cv } from "../schema/cv.db";
import type { ContactSelect } from "./contact.type";
import type { EducationSelect } from "./education.type";
import type { WorkSelect } from "./work.type";
import type { ProjectSelect } from "./project.type";
import type { OrganizationSelect } from "./organization.type";
import type { CourseSelect } from "./course.type";
import type { SkillSelect } from "./skill.type";
import type { LanguageSelect } from "./language.type";

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

// Minimal CV data for public access (used in getCvByUsernameAndSlug)
export type CvMinimalSelect = {
  id: number;
  title: string;
  description: string;
  isPublic: boolean;
  views: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CvData = {
  // All CV child sections
  contacts: ContactSelect[];
  educations: EducationSelect[];
  works: WorkSelect[];
  projects: ProjectSelect[];
  organizations: OrganizationSelect[];
  courses: CourseSelect[];
  skills: SkillSelect[];
  languages: LanguageSelect[];
};

// Complete CV with all child sections for public access
export type CompleteCvResponse = CvData & {
  // Core CV metadata (minimal for performance)
  id: number;
  title: string;
  description: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
};
