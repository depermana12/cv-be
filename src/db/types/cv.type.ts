import { cv } from "../schema/cv.db";

export type CvSelect = typeof cv.$inferSelect;
export type CvInsert = typeof cv.$inferInsert;
export type CvUpdate = Partial<Omit<CvInsert, "id" | "userId">>;
