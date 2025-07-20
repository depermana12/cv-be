import type { educations } from "../schema/education.db";

export type EducationSelect = typeof educations.$inferSelect;
export type EducationInsert = typeof educations.$inferInsert;
