import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { personal } from "./personal.db";
import { relations } from "drizzle-orm";

export const location = mysqlTable("location", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => personal.id),
  address: varchar("address", { length: 255 }),
  postalCode: varchar("postal_code", { length: 5 }),
  city: varchar("city", { length: 100 }),
  countryCode: varchar("country_code", { length: 3 }),
  state: varchar("state", { length: 100 }),
});

export const locationRelations = relations(location, ({ one }) => ({
  personal: one(personal, {
    fields: [location.personalId],
    references: [personal.id],
  }),
}));
