// TODO: move this to auth types
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

export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly tokenService: ITokenService,
  ) {}

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

    const user = await this.userRepository.getById(createdUser.id);
    if (!user) {
      throw new ValidationError("failed to retrieve created user");
    }

    const payload: UserPayload = {
      id: user.id.toString(),
      email: user.email,
    };

    const { accessToken, refreshToken } =
      await this.tokenService.generateAuthTokens(payload);

    return { ...user, accessToken, refreshToken };
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

    const { password, ...userWithoutPassword } = user;

    const payload: UserPayload = {
      id: user.id.toString(),
      email: user.email,
    };

    const { accessToken, refreshToken } =
      await this.tokenService.generateAuthTokens(payload);

    return { ...userWithoutPassword, accessToken, refreshToken };
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      return await Bun.password.hash(password);
    } catch (error) {
      throw new ValidationError("Failed to process password");
    }
  }

  async getByEmail(email: string): Promise<AuthUserSafe> {
    const user = await this.userRepository.getByEmail(email.toLowerCase());
    if (!user) {
      throw new NotFoundError("user record not found");
    }
    const { password, ...userObjWithoutPassword } = user;

    return userObjWithoutPassword;
  }

  async isEmailVerified(id: number): Promise<{ verified: boolean }> {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw new ValidationError("User not found");
    }

    return { verified: user.isEmailVerified || false };
  }

  async verifyUserEmail(id: number): Promise<void> {
    await this.userRepository.verifyUserEmail(id);
  }

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
    await this.verifyUserEmail(Number(payload.id));
    return payload;
  }

  async validateRefreshToken(refreshToken: string): Promise<UserPayload> {
    return this.tokenService.validateRefreshToken(refreshToken);
  }

  async generateAuthTokens(user: UserPayload): Promise<AuthTokens> {
    return this.tokenService.generateAuthTokens(user);
  }
  async changeUserPassword(id: number, newPassword: string): Promise<void> {
    const hashedNewPassword = await Bun.password.hash(newPassword);
    const userExists = await this.userRepository.userExistsById(id);
    if (!userExists) {
      throw new ValidationError("User not found");
    }
    const updated = await this.userRepository.updateUserPassword(
      id,
      hashedNewPassword,
    );
    if (!updated) {
      throw new ValidationError("Failed to update user password");
    }
  }
}
