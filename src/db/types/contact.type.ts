import type { contacts } from "../schema/contact.db";

export type ContactSelect = typeof contacts.$inferSelect;
export type ContactInsert = typeof contacts.$inferInsert;
export type ContactUpdate = Partial<ContactInsert>;

export type ContactQueryOptions = {
  search?: string;
  sortBy?: keyof ContactSelect;
  sortOrder?: "asc" | "desc";
};
