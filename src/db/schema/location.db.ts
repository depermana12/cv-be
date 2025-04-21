import { int, mysqlTable, varchar } from "drizzle-orm/mysql-core";
import { intro } from "./intro.db";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import type { z } from "zod";

export const location = mysqlTable("personal_location", {
  id: int("id").primaryKey().autoincrement(),
  personalId: int("personal_id")
    .notNull()
    .references(() => intro.id),
  address: varchar("address", { length: 255 }),
  postalCode: varchar("postal_code", { length: 5 }),
  city: varchar("city", { length: 100 }),
  countryCode: varchar("country_code", { length: 3 }),
  state: varchar("state", { length: 100 }),
});

export const locationSelectSchema = createSelectSchema(location);
export const locationInsertSchema = createInsertSchema(location);
export const locationUpdateSchema = createUpdateSchema(location).omit({
  personalId: true,
  id: true,
});

export type LocationSelect = z.infer<typeof locationSelectSchema>;
export type LocationInsert = z.infer<typeof locationInsertSchema>;
export type LocationUpdate = z.infer<typeof locationUpdateSchema>;
