import { HTTPException } from "hono/http-exception";
import { eq } from "drizzle-orm";

import { db } from "../db/index";
import {
  personalBasic,
  personalLocation,
  personalSocial,
} from "../db/schema/personal.db";
import type { PersonalInsert, PersonalUpdate } from "../db/schema/personal.db";

export class PersonalRepository {
  async getAll() {
    return await db.select().from(personalBasic);
  }

  async getById(id: number) {
    const [basic] = await db
      .select()
      .from(personalBasic)
      .where(eq(personalBasic.id, id));

    if (!basic) return null;

    const [location] = await db
      .select()
      .from(personalLocation)
      .where(eq(personalLocation.personalId, id));

    const [socials] = await db
      .select()
      .from(personalSocial)
      .where(eq(personalSocial.personalId, id));

    return {
      ...basic,
      location,
      socials,
    };
  }

  async create(data: PersonalInsert) {
    const insertedBasicData = await db
      .insert(personalBasic)
      .values(data.basic)
      .$returningId();
    const personalId = insertedBasicData[0].id;

    await db.insert(personalLocation).values({ ...data.location, personalId });

    if (data.socials.length > 0) {
      await db.insert(personalSocial).values(
        data.socials.map((social) => ({
          ...social,
          personalId,
        })),
      );
    }

    return this.getById(personalId);
  }

  async update(personalId: number, data: PersonalUpdate) {
    if (data.basic) {
      await db
        .update(personalBasic)
        .set(data.basic)
        .where(eq(personalBasic.id, personalId));
    }
    if (data.location) {
      await db
        .update(personalLocation)
        .set(data.location)
        .where(eq(personalLocation.personalId, personalId));
    }
    if (data.socials) {
      await db
        .delete(personalSocial)
        .where(eq(personalSocial.personalId, personalId));

      if (data.socials.length > 0) {
        await db
          .insert(personalSocial)
          .values(data.socials.map((social) => ({ ...social, personalId })));
      }
    }

    return this.getById(personalId);
  }

  async delete(personalId: number) {
    await db
      .delete(personalSocial)
      .where(eq(personalSocial.personalId, personalId));
    await db
      .delete(personalLocation)
      .where(eq(personalLocation.personalId, personalId));
    await db.delete(personalBasic).where(eq(personalBasic.id, personalId));
  }
}
