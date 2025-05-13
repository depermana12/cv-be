import type { socials } from "../schema/social.db";

export type SocialSelect = typeof socials.$inferSelect;
export type SocialInsert = Omit<typeof socials.$inferInsert, "personalId">;
