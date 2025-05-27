import { CvChildService } from "./cvChild.service";
import { ProfileRepository } from "../repositories/profile.repo";
import type {
  ProfileSelect,
  ProfileInsert,
  ProfileUpdate,
  ProfileQueryOptions,
} from "../db/types/profile.type";

export class ProfileService extends CvChildService<
  ProfileSelect,
  ProfileInsert,
  ProfileUpdate
> {
  constructor(private readonly profileRepository: ProfileRepository) {
    super(profileRepository);
  }

  async createProfile(
    cvId: number,
    profileData: Omit<ProfileInsert, "cvId">,
  ): Promise<ProfileSelect> {
    return this.createForCv(cvId, { ...profileData, cvId });
  }

  async getProfile(cvId: number, profileId: number): Promise<ProfileSelect> {
    return this.findByCvId(cvId, profileId);
  }

  async getAllProfiles(
    cvId: number,
    options?: ProfileQueryOptions,
  ): Promise<ProfileSelect[]> {
    return this.profileRepository.getAllProfiles(cvId, options);
  }

  async updateProfile(
    cvId: number,
    profileId: number,
    newProfileData: Omit<ProfileUpdate, "cvId">,
  ): Promise<ProfileSelect> {
    return this.updateForCv(cvId, profileId, newProfileData);
  }

  async deleteProfile(cvId: number, profileId: number): Promise<boolean> {
    return this.deleteFromCv(cvId, profileId);
  }
}
