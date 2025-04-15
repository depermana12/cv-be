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
    try {
      return await db.select().from(personalBasic);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async getById(id: number) {
    try {
      const [basic] = await db
        .select()
        .from(personalBasic)
        .where(eq(personalBasic.id, id));

      if (!basic) {
        throw new HTTPException(404, {
          message: "invalid education id not found",
        });
      }

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
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async create(data: PersonalInsert) {
    try {
      const insertedBasicData = await db
        .insert(personalBasic)
        .values(data.basic)
        .$returningId();
      const personalId = insertedBasicData[0].id;

      await db
        .insert(personalLocation)
        .values({ ...data.location, personalId });

      if (data.socials.length > 0) {
        await db.insert(personalSocial).values(
          data.socials.map((social) => ({
            ...social,
            personalId,
          })),
        );
      }

      return this.getById(personalId);
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async update(personalId: number, data: PersonalUpdate) {
    try {
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
    } catch (e: unknown) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }

  async delete(personalId: number) {
    try {
      await db
        .delete(personalSocial)
        .where(eq(personalSocial.personalId, personalId));
      await db
        .delete(personalLocation)
        .where(eq(personalLocation.personalId, personalId));
      await db.delete(personalBasic).where(eq(personalBasic.id, personalId));
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : String(e));
    }
  }
}
