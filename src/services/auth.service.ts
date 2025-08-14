import type { ITokenService } from "./token.service";
import type { IUserRepository } from "../repositories/user.repo";
import type {
  AuthTokens,
  AuthUserLogin,
  AuthUserRegister,
  AuthUserSafe,
} from "../db/types/auth.type";
import type { UserPayload } from "../lib/types";
import { ValidationError } from "../errors/validation.error";
import { NotFoundError } from "../errors/not-found.error";

export interface IAuthService {
  registerUser(
    userRegistration: AuthUserRegister,
  ): Promise<AuthUserSafe & AuthTokens>;
  userLogin(loginInput: AuthUserLogin): Promise<AuthUserSafe & AuthTokens>;
  getByEmail(email: string): Promise<AuthUserSafe>;
  isEmailVerified(id: number): Promise<{ verified: boolean }>;
  verifyUserEmail(id: number): Promise<boolean>;
  createResetPasswordToken(payload: UserPayload): Promise<string>;
  validateDecodeResetPasswordToken(token: string): Promise<UserPayload>;
  createEmailVerificationToken(payload: UserPayload): Promise<string>;
  validateEmailVerificationToken(token: string): Promise<UserPayload>;
  validateRefreshToken(refreshToken: string): Promise<UserPayload>;
  generateAuthTokens(user: UserPayload): Promise<AuthTokens>;
  changeUserPassword(id: number, newPassword: string): Promise<void>;
  isUsernameAvailable(username: string): Promise<{ available: boolean }>;
}

export class AuthService implements IAuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

  // =============================
  // USER REGISTRATION & LOGIN
  // =============================

  async registerUser(
    userRegistration: AuthUserRegister,
  ): Promise<AuthUserSafe & AuthTokens> {
    const emailExist = await this.userRepository.getByEmailSafe(
      userRegistration.email.toLowerCase(),
    );
    if (emailExist) {
      throw new ValidationError("email already registered");
    }

    const hashedPassword = await this.hashPassword(userRegistration.password);

    const createdUser = await this.userRepository.createUser({
      ...userRegistration,
      password: hashedPassword,
    });

    if (!createdUser || !createdUser.id) {
      throw new ValidationError("failed to create user");
    }

    const payload: UserPayload = {
      id: createdUser.id.toString(),
      email: createdUser.email,
      isEmailVerified: createdUser.isEmailVerified ?? false,
    };

    const { accessToken, refreshToken } =
      await this.tokenService.generateAuthTokens(payload);

    return { ...createdUser, accessToken, refreshToken };
  }

  async userLogin(
    loginInput: AuthUserLogin,
  ): Promise<AuthUserSafe & AuthTokens> {
    const user = await this.userRepository.getByEmail(
      loginInput.email.toLowerCase(),
    );
    if (
      !user ||
      !(await Bun.password.verify(loginInput.password, user.password))
    ) {
      throw new ValidationError("invalid email or password");
    }

    const { password, ...userSafe } = user;

    const payload: UserPayload = {
      id: user.id.toString(),
      email: user.email,
      isEmailVerified: user.isEmailVerified ?? false,
    };

    const { accessToken, refreshToken } =
      await this.tokenService.generateAuthTokens(payload);

    return { ...userSafe, accessToken, refreshToken };
  }

  // =============================
  // PASSWORD UTILITIES
  // =============================

  private async hashPassword(password: string): Promise<string> {
    try {
      return await Bun.password.hash(password);
    } catch (error) {
      throw new ValidationError("Failed to process password");
    }
  }

  // =============================
  // USER LOOKUP & EMAIL VERIFICATION
  // =============================

  async getByEmail(email: string): Promise<AuthUserSafe> {
    const user = await this.userRepository.getByEmail(email.toLowerCase());
    if (!user) {
      throw new NotFoundError("user record not found");
    }
    const { password, ...userSafe } = user;

    return userSafe;
  }

  async isEmailVerified(id: number): Promise<{ verified: boolean }> {
    const user = await this.userRepository.getByIdSafe(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return { verified: user.isEmailVerified || false };
  }

  async verifyUserEmail(id: number): Promise<boolean> {
    const result = await this.userRepository.verifyUserEmail(id);
    return !!result;
  }

  // =============================
  // TOKEN MANAGEMENT
  // =============================

  async createResetPasswordToken(payload: UserPayload): Promise<string> {
    return this.tokenService.createResetPasswordToken(payload);
  }

  async validateDecodeResetPasswordToken(token: string): Promise<UserPayload> {
    return this.tokenService.validateResetPasswordToken(token);
  }

  async createEmailVerificationToken(payload: UserPayload): Promise<string> {
    return this.tokenService.createEmailVerificationToken(payload);
  }

  async validateEmailVerificationToken(token: string): Promise<UserPayload> {
    const payload = await this.tokenService.validateEmailVerificationToken(
      token,
    );

    return {
      ...payload,
      isEmailVerified: true,
    };
  }

  async validateRefreshToken(refreshToken: string): Promise<UserPayload> {
    return this.tokenService.validateRefreshToken(refreshToken);
  }

  async generateAuthTokens(user: UserPayload): Promise<AuthTokens> {
    return this.tokenService.generateAuthTokens(user);
  }

  // =============================
  // PASSWORD MANAGEMENT
  // =============================

  async changeUserPassword(userId: number, newPassword: string): Promise<void> {
    const userExists = await this.userRepository.userExistsById(userId);
    if (!userExists) {
      throw new NotFoundError("User not found");
    }

    const hashedNewPassword = await this.hashPassword(newPassword);
    const updated = await this.userRepository.updateUserPassword(
      userId,
      hashedNewPassword,
    );

    if (!updated) {
      throw new ValidationError("Failed to update user password");
    }
  }

  // =============================
  // USERNAME AVAILABILITY
  // =============================

  async isUsernameAvailable(username: string): Promise<{ available: boolean }> {
    // 100ms artificial delay to prevent timing attacks
    // debounce in frontend
    const startTime = Date.now();
    const exists = await this.userRepository.isUsernameExists(
      username.toLowerCase(),
    );
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime < 100) {
      await new Promise((resolve) => setTimeout(resolve, 100 - elapsedTime));
    }

    return {
      available: !exists,
    };
  }
}
