import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { cv } from "./cv.db";

export const location = mysqlTable("location", {
  id: int("id").primaryKey().autoincrement(),
  cvId: int("cv_id")
    .notNull()
    .references(() => cv.id, { onDelete: "cascade" }),
  address: varchar("address", { length: 255 }),
  postalCode: varchar("postal_code", { length: 5 }),
  city: varchar("city", { length: 100 }),
  countryCode: varchar("country_code", { length: 3 }),
  state: varchar("state", { length: 100 }),
});

export const locationRelations = relations(location, ({ one }) => ({
  cv: one(cv, {
    fields: [location.cvId],
    references: [cv.id],
  }),
}));
