import type { skills } from "../schema/skill.db";

export type SkillSelect = typeof skills.$inferSelect;
export type SkillInsert = typeof skills.$inferInsert;
export type SkillUpdate = Partial<Omit<SkillInsert, "id" | "cvId">>;
