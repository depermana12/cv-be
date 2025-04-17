import { eq } from "drizzle-orm";

import {
  basicRepository,
  locationRepository,
  socialRepository,
} from "../services/instance.repo";

import { db } from "../db/index";
import {
  personalBasic,
  personalLocation,
  personalSocial,
} from "../db/schema/personal.db";

import type {
  PersonalBasicInsert,
  PersonalInsert,
  PersonalUpdate,
} from "../db/schema/personal.db";

export class PersonalRepository {
  async getAll() {
    const basics = await db.select().from(personalBasic);
    return Promise.all(
      basics.map(async (basic) => {
        const location = await locationRepository.getByPersonalId(basic.id);
        const social = await socialRepository.getByPersonalId(basic.id);
        return { ...basic, location, social };
      }),
    );
  }

  async getById(id: number) {
    const basic = await basicRepository.getById(id);
    if (!basic) return null;

    const location = await locationRepository.getById(id);
    const socials = await socialRepository.getByPersonalId(id);

    return {
      ...basic,
      location,
      socials,
    };
  }

  async create(data: PersonalInsert) {
    console.log("prepare for creating");
    const insertedBasic = await basicRepository.create(data.basic);
    console.log(insertedBasic);
    if (!insertedBasic) {
      throw new Error("failed to insert basic personal data");
    }
    const personalId = insertedBasic.id;

    await locationRepository.create({ ...data.location, personalId });

    if (data.socials.length > 0) {
      await Promise.all(
        data.socials.map((social) =>
          socialRepository.create({ ...social, personalId }),
        ),
      );
    }
    return this.getById(personalId);
  }

  async update(id: number, data: PersonalUpdate) {
    if (data.basic) {
      await basicRepository.update(id, data.basic);
    }
    if (data.location) {
      await locationRepository.updateByPersonalId(id, data.location);
    }
    if (data.socials) {
      await socialRepository.replaceAllForPersonalId(
        id,
        data.socials.map((social) => ({ ...social, personalId: id })),
      );
    }

    return this.getById(id);
  }

  async delete(id: number) {
    await basicRepository.delete(id);
    await locationRepository.delete(id);
    await socialRepository.delete(id);
  }
}
