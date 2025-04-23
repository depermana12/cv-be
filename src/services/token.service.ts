import { decode, sign, verify } from "hono/jwt";
import type { UserPayload } from "../lib/types";
import { ValidationError } from "../errors/validation.error";

export class TokenService {
  constructor(private readonly secret: string) {
    if (!secret) throw new Error("JWT secret is not defined");
  }

  private nowInSeconds(): number {
    return Math.floor(Date.now() / 1000);
  }

  async createToken(payload: UserPayload): Promise<string> {
    return sign(payload, this.secret);
  }

  async decodeToken(token: string): Promise<UserPayload> {
    const { header, payload } = decode(token);
    return payload as UserPayload;
  }

  async createResetPasswordToken(user: UserPayload): Promise<string> {
    const now = this.nowInSeconds();
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      iat: now,
      exp: now + 60 * 10,
    };
    return this.createToken(payload);
  }

  async verifyToken<T extends object>(token: string): Promise<T> {
    return (await verify(token, this.secret)) as T;
  }

  async validateResetPasswordToken(token: string): Promise<UserPayload> {
    const payload = await this.verifyToken<UserPayload>(token);

    if (!payload.exp) {
      throw new ValidationError("Reset token missing expiration");
    }

    if (this.nowInSeconds() > payload.exp) {
      throw new ValidationError("Reset token expired");
    }

    return payload;
  }
}
