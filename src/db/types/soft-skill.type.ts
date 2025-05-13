import type { softSkills } from "../schema";

export type SoftSkillSelect = typeof softSkills.$inferSelect;
export type SoftSkillInsert = Omit<
  typeof softSkills.$inferInsert,
  "personalId"
>;
