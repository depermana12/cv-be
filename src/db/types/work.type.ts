import type { works } from "../schema/work.db";

export type WorkSelect = typeof works.$inferSelect;
export type WorkInsert = typeof works.$inferInsert;
