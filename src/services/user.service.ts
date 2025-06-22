import { NotFoundError } from "../errors/not-found.error";
import type { IUserRepository } from "../repositories/user.repo";

import type { AuthUserSafe } from "../db/types/auth.type";
import type { UpdateUserProfileSafe } from "../db/types/user.type";
import type { CvService } from "./cv.service";

export class UserService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly cvService: CvService,
  ) {}

  async getUserByIdSafe(id: number): Promise<AuthUserSafe> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new NotFoundError("user record not found");
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<AuthUserSafe> {
    const user = await this.userRepository.getByEmail(email.toLowerCase());
    if (!user) {
      throw new NotFoundError("user record not found");
    }
    const { password, ...userObjWithoutPassword } = user;

    return userObjWithoutPassword;
  }

  async getUserByEmailSafe(email: string): Promise<AuthUserSafe> {
    const user = await this.userRepository.getByEmailSafe(email.toLowerCase());
    if (!user) {
      throw new NotFoundError("user record not found");
    }

    return user;
  }

  async updateUserProfile(
    id: number,
    newUserData: UpdateUserProfileSafe,
  ): Promise<AuthUserSafe> {
    const updatedUser = await this.userRepository.updateUser(id, newUserData);
    if (!updatedUser) {
      throw new NotFoundError("user record not found");
    }

    return this.getUserByIdSafe(id);
  }
  // async updateUser(
  //   id: number,
  //   newUserData: UpdateUserProfileSafe,
  // ): Promise<AuthUserSafe> {
  //   if (newUserData.username) {
  //     const existingUser = await this.isUsernameExists(
  //       newUserData.username.toLowerCase(),
  //     );
  //     if (existingUser) {
  //       throw new ValidationError("username already taken");
  //     }
  //   }

  //   const updatedUser = await this.userRepository.updateUser(id, newUserData);
  //   if (!updatedUser) {
  //     throw new NotFoundError("user record not found");
  //   }

  //   return this.getUserByIdSafe(id);
  // }

  //----------------------------------
  // Utility methods
  //----------------------------------

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
    return this.cvService.getUserCvCount(user.id);
  }

  // TODO: Implement this method to return the count of job applications for the user.
  private async getUserJobApplicationsCount(id: number) {}

  async isUserEmailVerified(id: number): Promise<{ verified: boolean }> {
    const user = await this.getUserByIdSafe(id);
    return { verified: user.isEmailVerified || false };
  }

  async isUsernameExists(username: string): Promise<boolean> {
    const user = await this.userRepository.isUsernameExists(
      username.toLowerCase(),
    );
    return !!user;
  }

  async getUserStats(id: number): Promise<{
    user: AuthUserSafe;
    accountAge: number;
    isEmailVerified: boolean;
    cvCreated: number;
    totalJobApplications?: number;
  }> {
    const user = await this.getUserByIdSafe(id);
    const accountAge = this.calculateAccountAge(user.createdAt);
    const isEmailVerified = await this.isUserEmailVerified(id);
    const cvCount = await this.getUserCvCount(id);

    return {
      user,
      accountAge,
      isEmailVerified: isEmailVerified.verified,
      cvCreated: cvCount,
    };
  }
}
