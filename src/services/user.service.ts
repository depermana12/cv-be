import { NotFoundError } from "../errors/not-found.error";
import { ValidationError } from "../errors/validation.error";
import type { IUserRepository } from "../repositories/user.repo";

import type { AuthUserSafe, UserStats } from "../db/types/auth.type";
import type { UpdateUserProfileSafe } from "../db/types/user.type";
import type { CvService } from "./cv.service";
import type { IJobApplicationService } from "./jobApplication.service";

export interface IUserService {
  getUserByIdSafe(id: number): Promise<AuthUserSafe>;
  getUserByEmail(email: string): Promise<AuthUserSafe>;
  getUserByEmailSafe(email: string): Promise<AuthUserSafe>;
  updateUserProfile(
    id: number,
    newUserData: UpdateUserProfileSafe,
  ): Promise<AuthUserSafe>;
  updateUserEmail(id: number, newEmail: string): Promise<AuthUserSafe>;
  updateUserUsername(id: number, newUsername: string): Promise<AuthUserSafe>;
  isUserEmailVerified(id: number): Promise<{ verified: boolean }>;
  isUsernameExists(username: string): Promise<boolean>;
  getUserStats(id: number): Promise<UserStats>;
}
export class UserService implements IUserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cvService: CvService,
    private readonly jobApplicationService: IJobApplicationService,
  ) {}

  // =============================
  // USER DATA RETRIEVAL
  // =============================

  async getUserByIdSafe(id: number) {
    const user = await this.userRepository.getByIdSafe(id);
    if (!user) {
      throw new NotFoundError("user record not found");
    }
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.getByEmail(email.toLowerCase());
    if (!user) {
      throw new NotFoundError("user record not found");
    }
    const { password, ...userObjWithoutPassword } = user;

    return userObjWithoutPassword;
  }

  async getUserByEmailSafe(email: string) {
    const user = await this.userRepository.getByEmailSafe(email.toLowerCase());
    if (!user) {
      throw new NotFoundError("user record not found");
    }

    return user;
  }

  // =============================
  // USER PROFILE MANAGEMENT
  // =============================

  async updateUserProfile(id: number, newUserData: UpdateUserProfileSafe) {
    const updatedUser = await this.userRepository.updateUser(id, newUserData);
    if (!updatedUser) {
      throw new NotFoundError("user record not found");
    }

    return this.getUserByIdSafe(id);
  }

  async updateUserEmail(id: number, newEmail: string) {
    const updatedUser = await this.userRepository.updateEmail(
      id,
      newEmail.toLowerCase(),
    );
    if (!updatedUser) {
      throw new NotFoundError("user record not found");
    }
    return updatedUser;
  }

  async updateUserUsername(id: number, newUsername: string) {
    const usernameExists = await this.isUsernameExists(
      newUsername.toLowerCase(),
    );
    if (usernameExists) {
      throw new ValidationError("username already taken");
    }

    const updatedUser = await this.userRepository.updateUsername(
      id,
      newUsername.toLowerCase(),
    );
    if (!updatedUser) {
      throw new NotFoundError("user record not found");
    }
    return updatedUser;
  }

  // =============================
  // USER VALIDATION & STATUS
  // =============================

  async isUserEmailVerified(id: number) {
    const user = await this.getUserByIdSafe(id);
    return { verified: user.isEmailVerified || false };
  }

  async isUsernameExists(username: string) {
    const user = await this.userRepository.isUsernameExists(
      username.toLowerCase(),
    );
    return !!user;
  }

  // =============================
  // USER STATISTICS & ANALYTICS
  // =============================

  async getUserStats(id: number) {
    const user = await this.getUserByIdSafe(id);
    const accountAge = this.calculateAccountAge(user.createdAt);
    const isEmailVerified = await this.isUserEmailVerified(id);
    const cvCount = await this.getUserCvCount(id);
    const totalJobApplications = await this.getUserJobApplicationsCount(id);

    return {
      user,
      accountAge,
      isEmailVerified: isEmailVerified.verified,
      cvCreated: cvCount,
      totalJobApplications,
    };
  }

  // =============================
  // PRIVATE UTILITY METHODS
  // =============================

  /**
   * Converts a milliseconds timestamp to the age of the user account in days.
   * @param createdAt - The date when the user account was created. If null, returns 0.
   * @returns The age of the user account in days.
   */
  private calculateAccountAge(createdAt: Date | null): number {
    if (!createdAt) {
      return 0;
    }
    const now = new Date();
    const accountInMilliseconds = now.getTime() - new Date(createdAt).getTime();
    const accountAgeInDays = Math.floor(
      accountInMilliseconds / (1000 * 60 * 60 * 24),
    );
    return accountAgeInDays;
  }

  private async getUserCvCount(id: number): Promise<number> {
    const user = await this.getUserByIdSafe(id);
    const result = await this.cvService.getAllCvs(user.id, {
      limit: 1,
      offset: 0,
    });
    return result.total;
  }

  private async getUserJobApplicationsCount(id: number): Promise<number> {
    const result = await this.jobApplicationService.getAllJobApplications(id, {
      limit: 1,
      offset: 0,
    });
    return result.total;
  }
}
