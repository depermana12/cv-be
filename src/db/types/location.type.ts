import { location } from "../schema/location.db";

export type LocationSelect = typeof location.$inferSelect;
export type LocationInsert = Omit<typeof location.$inferInsert, "personalId">;
export type LocationUpdate = Omit<LocationInsert, "personalId">;
