import { decode, sign, verify } from "hono/jwt";

import type { UserInsert, UserSelect } from "../db/schema/user.db";
import { UserRepository } from "../repositories/user.repo";
import { ValidationError } from "../errors/validation.error";
import { NotFoundError } from "../errors/not-found.error";

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

    const token = await sign(
      { id: createdUser.id, email: createdUser.email },
      process.env.SECRET!,
    );

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
    const token = await sign(
      { id: user.id, email: user.email },
      process.env.SECRET!,
    );

    return { ...rest, token };
  }
}
