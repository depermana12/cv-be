import type { profile } from "../schema/profile.db";

export type ProfileSelect = typeof profile.$inferSelect;
export type ProfileInsert = typeof profile.$inferInsert;
export type ProfileUpdate = Partial<Omit<ProfileInsert, "id">>;
