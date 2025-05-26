import { CvChildRepository } from "./cvChild.repo";
import { location } from "../db/schema/location.db";
import type {
  LocationInsert,
  LocationQueryOptions,
  LocationSelect,
  LocationUpdate,
} from "../db/types/location.type";
import { getDb } from "../db";
import { and, asc, desc, eq, like, sql } from "drizzle-orm";

const db = await getDb();
export class LocationRepository extends CvChildRepository<
  typeof location,
  LocationInsert,
  LocationSelect,
  LocationUpdate
> {
  constructor() {
    super(location, db);
  }

  async getAllLocations(
    cvId: number,
    search?: LocationQueryOptions,
  ): Promise<LocationSelect[]> {
    const whereClause = [eq(location.cvId, cvId)];

    if (search?.search) {
      const searchTerm = `%${search.search.toLowerCase()}%`;
      whereClause.push(like(sql`lower(${location.address})`, searchTerm));
    }

    return this.db.query.location.findMany({
      where: and(...whereClause),
      orderBy: search?.sortBy
        ? [
            search.sortOrder === "desc"
              ? desc(location[search.sortBy])
              : asc(location[search.sortBy]),
          ]
        : [],
    });
  }
}
