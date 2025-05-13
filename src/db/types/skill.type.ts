import type { skills } from "../schema";

export type SkillSelect = typeof skills.$inferSelect;
export type SkillInsert = Omit<typeof skills.$inferInsert, "personalId">;
