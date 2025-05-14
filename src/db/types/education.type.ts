import type { educations } from "../schema/education.db";

export type EducationSelect = typeof educations.$inferSelect;
export type EducationInsert = Omit<
  typeof educations.$inferInsert,
  "personalId"
>;
export type EducationUpdate = Omit<EducationInsert, "personalId">;
