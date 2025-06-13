import { eq, sql } from "drizzle-orm";
import { users } from "../db/schema/user.db";
import type { Database } from "../db";
import type { UserInsert, UserSelect, UserUpdate } from "../db/types/user.type";

export class UserRepository {
  private readonly table = users;
  constructor(private readonly db: Database) {}

  async userExistsById(id: number): Promise<boolean> {
    const [rows] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    return !!rows;
  }

  async isUsernameExists(username: string): Promise<boolean> {
    const [rows] = await this.db
      .select()
      .from(this.table)
      .where(eq(sql`lower(${this.table.username})`, username))
      .limit(1);

    return !!rows;
  }

  async createUser(user: UserInsert): Promise<{ id: number }> {
    const [createdRow] = await this.db
      .insert(this.table)
      .values(user)
      .$returningId();

    return { id: createdRow.id };
  }

  async getById(id: number): Promise<Omit<UserSelect, "password"> | null> {
    const [rows] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);

    if (!rows) return null;

    const { password, ...userWithoutPassword } = rows;
    return userWithoutPassword ?? null;
  }

  async getByEmail(email: string): Promise<UserSelect | null> {
    const [rows] = await this.db
      .select()
      .from(this.table)
      .where(eq(sql`lower(${this.table.email})`, email))
      .limit(1);

    return rows ?? null;
  }

  async getByEmailSafe(
    email: string,
  ): Promise<Omit<UserSelect, "password"> | null> {
    const [rows] = await this.db
      .select()
      .from(this.table)
      .where(eq(sql`lower(${this.table.email})`, email))
      .limit(1);

    if (!rows) return null;

    const { password, ...userWithoutPassword } = rows;
    return userWithoutPassword ?? null;
  }

  async updateUser(id: number, newUserData: UserUpdate): Promise<boolean> {
    const [updatedRow] = await this.db
      .update(this.table)
      .set(newUserData)
      .where(eq(this.table.id, id));

    return updatedRow.affectedRows > 0;
  }

  async verifyUserEmail(id: number): Promise<boolean> {
    const [updatedRow] = await this.db
      .update(this.table)
      .set({ isEmailVerified: true })
      .where(eq(this.table.id, id));

    return updatedRow.affectedRows > 0;
  }

  async updateUserPassword(id: number, newPw: string): Promise<boolean> {
    const [updatedRow] = await this.db
      .update(this.table)
      .set({ password: newPw })
      .where(eq(this.table.id, id));

    return updatedRow.affectedRows > 0;
  }

  async deleteUser(id: number): Promise<boolean> {
    const [deletedRow] = await this.db
      .delete(this.table)
      .where(eq(this.table.id, id));

    return deletedRow.affectedRows > 0;
  }
}
