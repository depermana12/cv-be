import type { softSkills } from "../schema/soft-skill.db";

export type SoftSkillSelect = typeof softSkills.$inferSelect;
export type SoftSkillInsert = typeof softSkills.$inferInsert;
export type SoftSkillUpdate = Partial<Omit<SoftSkillInsert, "id" | "cvId">>;
