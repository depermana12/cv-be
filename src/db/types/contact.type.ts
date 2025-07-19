import type { contacts } from "../schema/contact.db";

export type ContactSelect = typeof contacts.$inferSelect;
export type ContactInsert = typeof contacts.$inferInsert;
export type ContactUpdate = Omit<Partial<ContactInsert>, "id" | "cvId">;
