import type { personal } from "../schema/personal.db";

export type PersonalSelect = typeof personal.$inferSelect;
export type PersonalInsert = typeof personal.$inferInsert;
export type PersonalUpdate = Omit<PersonalInsert, "id">;
