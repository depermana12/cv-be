import { decode, sign, verify } from "hono/jwt";
import type { UserPayload } from "../lib/types";
import { ValidationError } from "../errors/validation.error";
import type { AuthTokens } from "../db/types/auth.type";

export interface ITokenService {
  decodeToken(token: string): Promise<UserPayload>;
  createAccessToken(user: UserPayload): Promise<string>;
  createRefreshToken(user: UserPayload, rememberMe?: boolean): Promise<string>;
  generateAuthTokens(user: UserPayload): Promise<AuthTokens>;
  createResetPasswordToken(user: UserPayload): Promise<string>;
  createEmailVerificationToken(user: UserPayload): Promise<string>;
  verifyToken<T extends object>(token: string): Promise<T>;
  validateRefreshToken(token: string): Promise<UserPayload>;
  validateResetPasswordToken(token: string): Promise<UserPayload>;
  validateEmailVerificationToken(token: string): Promise<UserPayload>;
}

export class TokenService implements ITokenService {
  private readonly accessTokenExpirationSeconds = 60 * 60 * 1; // 1 hour
  private readonly refreshTokenExpirationSeconds = 60 * 60 * 24 * 14; // 14 days
  private readonly resetTokenExpirationSeconds = 60 * 15; // 15 minutes
  private readonly emailVerificationTokenExpirationSeconds = 60 * 60 * 1; // 1 hour

  constructor(private readonly secret: string) {
    if (!secret) throw new Error("JWT secret is not defined");
  }

  // =============================
  // PRIVATE UTILITIES
  // =============================

  private nowInSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  private async createToken(payload: UserPayload): Promise<string> {
    return sign(payload, this.secret);
  }

  // =============================
  // TOKEN DECODING & VERIFICATION
  // =============================

  /**
   * Decodes a JWT token without verifying its signature.
   * Use only for non-sensitive, non-authenticated operations.
   */
  async decodeToken(token: string) {
    const { header, payload } = decode(token);
    return payload as UserPayload;
  }

  /**
   * Verifies a JWT token and returns the decoded payload.
   * @throws ValidationError if the token is invalid or expired.
   */
  async verifyToken<T extends object>(token: string) {
    return (await verify(token, this.secret)) as T;
  }

  // =============================
  // AUTH TOKEN CREATION (ACCESS & REFRESH)
  // =============================

  /**
   * Creates an access token for the user.
   * The token is valid for 1 hour.
   * @param user - The user payload to include in the token.
   * @returns A signed JWT token for access.
   */
  async createAccessToken(user: UserPayload) {
    const now = this.nowInSeconds();
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      iat: now,
      exp: now + this.accessTokenExpirationSeconds,
    };
    return this.createToken(payload);
  }

  /**
   * Creates a refresh token for the user.
   * The token is valid for 14 days by default, or 1 day if `rememberMe` is false.
   * @param user - The user payload to include in the token.
   * @param rememberMe - If true, the token will be valid for 14 days; otherwise, it will be valid for 1 day.
   * @returns A signed JWT token for refresh.
   */
  async createRefreshToken(user: UserPayload, rememberMe = false) {
    const now = this.nowInSeconds();
    const exp = rememberMe
      ? now + this.refreshTokenExpirationSeconds // 14 days
      : now + 60 * 60 * 24; // 1 day

    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      iat: now,
      exp,
    };
    return this.createToken(payload);
  }

  /**
   * Generates both access and refresh tokens for the user.
   * @param user - The user payload to include in the tokens.
   * @returns An object containing both access and refresh tokens.
   */
  async generateAuthTokens(user: UserPayload) {
    const accessToken = await this.createAccessToken(user);
    const refreshToken = await this.createRefreshToken(user);
    return { accessToken, refreshToken };
  }

  // =============================
  // SPECIAL PURPOSE TOKEN CREATION
  // =============================

  /**
   * Creates a reset password token for the user.
   * The token is valid for 15 minutes.
   * @param user - The user payload to include in the token.
   * @returns A signed JWT token for password reset.
   */
  async createResetPasswordToken(user: UserPayload) {
    const now = this.nowInSeconds();
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      iat: now,
      exp: now + this.resetTokenExpirationSeconds,
    };
    return this.createToken(payload);
  }

  /**
   * Creates an email verification token for the user.
   * The token is valid for 1 hour.
   * @param user - The user payload to include in the token.
   * @returns A signed JWT token for email verification.
   */
  async createEmailVerificationToken(user: UserPayload) {
    const now = this.nowInSeconds();
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      iat: now,
      exp: now + this.emailVerificationTokenExpirationSeconds,
    };
    return this.createToken(payload);
  }

  // =============================
  // TOKEN VALIDATION
  // =============================

  async validateRefreshToken(token: string) {
    const payload = await this.verifyToken<UserPayload>(token);

    if (!payload.exp) {
      throw new ValidationError("Refresh token missing expiration");
    }
    if (this.nowInSeconds() > payload.exp) {
      throw new ValidationError("Refresh token expired");
    }

    return payload;
  }

  /**
   * Validates a reset password token.
   * Checks if the token is valid and not expired.
   * @param token - The reset password token to validate.
   * @returns The decoded user payload if the token is valid.
   * @throws ValidationError if the token is invalid or expired.
   */
  async validateResetPasswordToken(token: string) {
    const payload = await this.verifyToken<UserPayload>(token);

    if (!payload.exp) {
      throw new ValidationError("Reset token missing expiration");
    }

    if (this.nowInSeconds() > payload.exp) {
      throw new ValidationError("Reset token expired");
    }

    return payload;
  }

  /**
   * Validates an email verification token.
   * Checks if the token is valid and not expired.
   * @param token - The email verification token to validate.
   * @returns The decoded user payload if the token is valid.
   * @throws ValidationError if the token is invalid or expired.
   */
  async validateEmailVerificationToken(token: string) {
    const payload = await this.verifyToken<UserPayload>(token);

    if (!payload.exp) {
      throw new ValidationError("Email verification token missing expiration");
    }

    if (this.nowInSeconds() > payload.exp) {
      throw new ValidationError("Email verification token expired");
    }

    return payload;
  }
}
