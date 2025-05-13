import type { workDescriptions, works } from "../schema/work.db";

export type WorkSelect = typeof works.$inferSelect;
export type WorkInsert = Omit<typeof works.$inferInsert, "personalId">;
export type WorkDescInsert = Omit<
  typeof workDescriptions.$inferInsert,
  "workId"
>;
