import { BaseRepository } from "./base.repo";
import { cv } from "../db/schema/cv.db";
import type { CvInsert, CvSelect, CvUpdate } from "../db/types/cv.type";
import { getDb } from "../db";

const db = await getDb();

export class Cv extends BaseRepository<
  typeof cv,
  CvInsert,
  CvSelect,
  CvUpdate
> {
  constructor() {
    super(cv, db);
  }
}
