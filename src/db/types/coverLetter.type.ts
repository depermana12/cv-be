import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  coverLetterTemplates,
  coverLetters,
  coverLetterSections,
} from "../schema/coverLetter.db.js";

// =====================
// DATABASE TYPES
// =====================

// Cover Letter Template Types
export type CoverLetterTemplate = typeof coverLetterTemplates.$inferSelect;
export type CoverLetterTemplateInsert =
  typeof coverLetterTemplates.$inferInsert;
export type CoverLetterTemplateUpdate = Partial<
  Omit<CoverLetterTemplateInsert, "id" | "userId" | "createdAt" | "updatedAt">
>;

// Cover Letter Types
export type CoverLetter = typeof coverLetters.$inferSelect;
export type CoverLetterInsert = typeof coverLetters.$inferInsert;
export type CoverLetterUpdate = Partial<
  Omit<CoverLetterInsert, "id" | "userId" | "createdAt" | "updatedAt">
>;

// Cover Letter Section Types
export type CoverLetterSection = typeof coverLetterSections.$inferSelect;
export type CoverLetterSectionInsert = typeof coverLetterSections.$inferInsert;
export type CoverLetterSectionUpdate = Partial<
  Omit<
    CoverLetterSectionInsert,
    "id" | "coverLetterId" | "createdAt" | "updatedAt"
  >
>;

// =====================
// BUSINESS LOGIC TYPES
// =====================

// Query/Filter Types
export interface CoverLetterTemplateQuery {
  limit?: number;
  offset?: number;
  tone?: "professional" | "friendly" | "confident" | "enthusiastic" | "formal";
  isDefault?: boolean;
}

export interface CoverLetterQuery {
  limit?: number;
  offset?: number;
  cvId?: number;
  tone?: "professional" | "friendly" | "confident" | "enthusiastic" | "formal";
  applicationId?: number;
}

// Create Types for Services (excludes auto-generated fields)
export type CoverLetterTemplateCreate = Omit<
  CoverLetterTemplateInsert,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type CoverLetterCreate = Omit<
  CoverLetterInsert,
  "id" | "userId" | "createdAt" | "updatedAt"
>;
export type CoverLetterSectionCreate = Omit<
  CoverLetterSectionInsert,
  "id" | "coverLetterId" | "createdAt" | "updatedAt"
>;

// Update Types for Services (only updatable fields)
export type CoverLetterTemplateUpdateData = Partial<
  Pick<CoverLetterTemplate, "name" | "content" | "tone" | "isDefault">
>;
export type CoverLetterUpdateData = Partial<
  Pick<
    CoverLetter,
    | "templateId"
    | "applicationId"
    | "title"
    | "content"
    | "companyName"
    | "position"
    | "hiringManager"
    | "tone"
    | "wordCount"
  >
>;
export type CoverLetterSectionUpdateData = Partial<
  Pick<CoverLetterSection, "type" | "content" | "displayOrder">
>;

// =====================
// FEATURE-SPECIFIC TYPES
// =====================

// Template Generation
export interface GenerateFromTemplateData {
  templateId: number;
  cvId: number;
  companyName: string;
  position: string;
  hiringManager?: string;
  applicationId?: number;
  customizations?: Record<string, string>; // For template placeholders
}

// Stats/Analytics
export interface CoverLetterStats {
  totalCoverLetters: number;
}

// =====================
// RESPONSE TYPES
// =====================

// For API responses with relations
export interface CoverLetterWithRelations extends CoverLetter {
  template?: CoverLetterTemplate;
  sections?: CoverLetterSection[];
}

export interface CoverLetterTemplateWithRelations extends CoverLetterTemplate {
  coverLetters?: CoverLetter[];
}

// Paginated responses
export type PaginatedCoverLetterTemplates = {
  data: CoverLetterTemplate[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
};

export type PaginatedCoverLetters = {
  data: CoverLetter[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
};
