import { eq } from "drizzle-orm";

import {
  basicRepository,
  locationRepository,
  socialRepository,
} from "../services/instance.repo";

import {
  basicTable,
  locationTable,
  socialTable,
} from "../db/schema/personal.db";

import type {
  BasicBase,
  BasicInsert,
  BasicUpdate,
  LocationBase,
  LocationInsert,
  LocationUpdate,
  PersonalInsert,
  PersonalUpdate,
  SocialBase,
  SocialInsert,
  SocialUpdate,
} from "../db/schema/personal.db";
import type { BaseRepository } from "./base.repo";

interface BasicRepo
  extends BaseRepository<
    typeof basicTable,
    BasicBase,
    BasicInsert,
    BasicUpdate
  > {}
interface LocationRepo
  extends BaseRepository<
    typeof locationTable,
    LocationBase,
    LocationInsert,
    LocationUpdate
  > {
  getByPersonalId(personalId: number): Promise<LocationBase>;
  updateByPersonalId(
    personalId: number,
    data: LocationUpdate,
  ): Promise<LocationBase>;
  deleteByPersonalId(personalId: number): Promise<void>;
}
interface SocialRepo
  extends BaseRepository<
    typeof socialTable,
    SocialBase,
    SocialInsert,
    SocialUpdate
  > {
  getByPersonalId(personalId: number): Promise<SocialBase>;
  replaceAllForPersonalId(
    personalId: number,
    socials: SocialInsert[],
  ): Promise<void>;
  deleteByPersonalId(personalId: number): Promise<void>;
}

export class PersonalRepository {
  constructor(
    private readonly basicRepository: BasicRepo,
    private readonly locationRepository: LocationRepo,
    private readonly socialRepository: SocialRepo,
  ) {}

  async getAll() {
    const basics = await this.basicRepository.getAll();
    if (!basics) return [];

    return Promise.all(
      basics.map(async (basic) => {
        const location = await this.locationRepository.getByPersonalId(
          basic.id,
        );
        const social = await this.socialRepository.getByPersonalId(basic.id);
        return { ...basic, location, social };
      }),
    );
  }

  async getById(id: number) {
    const basic = await this.basicRepository.getById(id);
    if (!basic) return null;

    const location = await this.locationRepository.getByPersonalId(id);
    const socials = await this.socialRepository.getByPersonalId(id);

    return {
      ...basic,
      location,
      socials,
    };
  }

  async create(data: PersonalInsert) {
    const insertedBasic = await this.basicRepository.create(data.basic);
    if (!insertedBasic) throw new Error("failed to insert basic personal data");

    const personalId = insertedBasic.id;

    await this.locationRepository.create({ ...data.location, personalId });

    if (data.socials.length > 0) {
      await Promise.all(
        data.socials.map((social) =>
          this.socialRepository.create({ ...social, personalId }),
        ),
      );
    }
    return this.getById(personalId);
  }

  async update(id: number, data: PersonalUpdate) {
    if (data.basic) {
      await this.basicRepository.update(id, data.basic);
    }
    if (data.location) {
      await this.locationRepository.updateByPersonalId(id, data.location);
    }
    if (data.socials) {
      await this.socialRepository.replaceAllForPersonalId(
        id,
        data.socials.map((social) => ({ ...social, personalId: id })),
      );
    }

    return this.getById(id);
  }

  async delete(id: number) {
    await socialRepository.deleteByPersonalId(id);
    await locationRepository.deleteByPersonalId(id);
    await basicRepository.delete(id);
  }
}
