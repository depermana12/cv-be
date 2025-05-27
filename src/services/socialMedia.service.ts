import { CvChildService } from "./cvChild.service";
import { SocialMediaRepository } from "../repositories/social.repo";
import type {
  SocialSelect,
  SocialInsert,
  SocialUpdate,
  SocialQueryOptions,
} from "../db/types/social.type";

export class SocialMediaService extends CvChildService<
  SocialSelect,
  SocialInsert,
  SocialUpdate
> {
  constructor(private readonly socialMediaRepository: SocialMediaRepository) {
    super(socialMediaRepository);
  }

  async createSocialMedia(
    cvId: number,
    socialData: Omit<SocialInsert, "cvId">,
  ): Promise<SocialSelect> {
    return this.createForCv(cvId, { ...socialData, cvId });
  }

  async getSocialMedia(cvId: number, socialId: number): Promise<SocialSelect> {
    return this.findByCvId(cvId, socialId);
  }

  async getAllSocialMedia(
    cvId: number,
    options?: SocialQueryOptions,
  ): Promise<SocialSelect[]> {
    return this.socialMediaRepository.getAllSocialMedia(cvId, options);
  }

  async updateSocialMedia(
    cvId: number,
    socialId: number,
    newSocialData: Omit<SocialUpdate, "cvId">,
  ): Promise<SocialSelect> {
    return this.updateForCv(cvId, socialId, newSocialData);
  }

  async deleteSocialMedia(cvId: number, socialId: number): Promise<boolean> {
    return this.deleteFromCv(cvId, socialId);
  }
}
