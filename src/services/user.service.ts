import { decode, sign, verify } from "hono/jwt";

import type { UserInsert, UserSelect, UserUpdate } from "../db/schema/user.db";
import { UserRepository } from "../repositories/user.repo";
import { ValidationError } from "../errors/validation.error";
import { NotFoundError } from "../errors/not-found.error";
import type { UserPayload } from "../lib/types";
import type { JWTPayload } from "hono/utils/jwt/types";

const userRepository = new UserRepository();
export class UserService {
  private readonly repo: UserRepository;
  constructor(private readonly repository = userRepository) {
    this.repo = repository;
  }

  async getById(id: number): Promise<Omit<UserSelect, "password">> {
    const user = await this.repo.getById(id);
    if (!user) {
      throw new NotFoundError("user record not found");
    }
    const { password, ...rest } = user;
    return { ...rest };
  }

  async getByEmail(email: string): Promise<Omit<UserSelect, "password">> {
    const user = await this.repo.getByEmail(email);
    if (!user) {
      throw new NotFoundError("user record not found");
    }
    const { password, ...rest } = user;
    return { ...rest };
  }

  async createToken(payload: UserPayload) {
    return sign(payload, process.env.SECRET!);
  }

  async createResetPasswordToken(payload: UserPayload) {
    const now = Math.floor(Date.now() / 1000);
    return this.createToken({
      id: payload.id,
      email: payload.email,
      exp: now + 60 * 10, // 10 minutes
      iat: now,
    });
  }
  async validateDecodeResetToken(token: string) {
    const decoded = await verify(token, process.env.SECRET!);
    if (!decoded.exp) throw new ValidationError("invalid reset token");

    const now = Math.floor(Date.now() / 1000);
    if (now > decoded.exp) throw new ValidationError("reset token expired");

    return decoded as UserPayload;
  }

  async signUp(
    userRegistration: UserInsert,
  ): Promise<Omit<UserSelect, "password"> & { token: string }> {
    const emailExist = await this.repo.getByEmail(userRegistration.email);
    if (emailExist) {
      throw new ValidationError("email already registered");
    }
    const hashedPassword = await Bun.password.hash(userRegistration.password);
    const createdUser = await this.repo.create({
      ...userRegistration,
      password: hashedPassword,
    });

    const token = await this.createToken({
      id: createdUser.id.toString(),
      email: createdUser.email,
    });
    return { ...createdUser, token };
  }

  async signIn(
    loginInput: Omit<UserInsert, "username">,
  ): Promise<Omit<UserSelect, "password"> & { token: string }> {
    const user = await this.repo.getByEmail(loginInput.email);
    if (
      !user ||
      !(await Bun.password.verify(loginInput.password, user.password))
    ) {
      throw new ValidationError("invalid email or password");
    }
    const { password, ...rest } = user;
    const token = await this.createToken({
      id: user.id.toString(),
      email: user.email,
    });

    return { ...rest, token };
  }

  async updatePassword(id: number, newPassword: string): Promise<void> {
    const user = await this.repo.getById(id);
    if (!user) {
      throw new NotFoundError("failed to update password, user not found");
    }
    const hashedPassword = await Bun.password.hash(newPassword);
    await this.repo.updatePassword(id, hashedPassword);
  }
}
