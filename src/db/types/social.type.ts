import type { socials } from "../schema/social.db";

export type SocialSelect = typeof socials.$inferSelect;
export type SocialInsert = typeof socials.$inferInsert;
export type SocialUpdate = Partial<Omit<SocialInsert, "id" | "cvId">>;

export type SocialQueryOptions = {
  search?: string;
  sortBy?: keyof typeof socials.$inferSelect;
  sortOrder?: "asc" | "desc";
};
