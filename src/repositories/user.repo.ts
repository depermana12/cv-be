import { eq, sql } from "drizzle-orm";
import { BaseRepository } from "./base.repo";
import { users } from "../db/schema/user.db";
import type { Database } from "../db";
import type {
  SafeUser,
  UserInsert,
  UserSelect,
  UserUpdate,
  UpdateUserPreferencesSafe,
  UpdateUserSubscriptionSafe,
} from "../db/types/user.type";

export interface IUserRepository {
  userExistsById(id: number): Promise<boolean>;
  isUsernameExists(username: string): Promise<boolean>;
  getByEmail(email: string): Promise<UserSelect | null>;
  createUser(user: UserInsert): Promise<SafeUser>;
  getByIdSafe(id: number): Promise<SafeUser | null>;
  getByEmailSafe(email: string): Promise<SafeUser | null>;
  updateUser(id: number, newUserData: UserUpdate): Promise<SafeUser | null>;
  updateEmail(id: number, newEmail: string): Promise<SafeUser | null>;
  updateUsername(id: number, newUsername: string): Promise<SafeUser | null>;
  updateUserPreferences(
    id: number,
    preferences: UpdateUserPreferencesSafe,
  ): Promise<SafeUser | null>;
  updateUserSubscription(
    id: number,
    subscription: UpdateUserSubscriptionSafe,
  ): Promise<SafeUser | null>;
  verifyUserEmail(id: number): Promise<SafeUser | null>;
  updateUserPassword(id: number, newPw: string): Promise<SafeUser | null>;
  deleteUser(id: number): Promise<boolean>;
}

export class UserRepository implements IUserRepository {
  private readonly table = users;
  constructor(private readonly db: Database) {}

  // =============================
  // AUTHENTICATION (returns password)
  // =============================
  /**
   * Returns full user including password for authentication purposes
   */
  async getByIdWithPassword(id: number): Promise<UserSelect | null> {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * Returns full user including password for login (by email)
   */
  async getByEmail(email: string): Promise<UserSelect | null> {
    const [rows] = await this.db
      .select()
      .from(this.table)
      .where(eq(sql`lower(${this.table.email})`, email.toLowerCase()))
      .limit(1);
    return rows ?? null;
  }

  // =============================
  // LOOKUP / CHECKING
  // =============================
  async userExistsById(id: number): Promise<boolean> {
    const user = await this.getByIdSafe(id);
    return !!user;
  }

  async isUsernameExists(username: string): Promise<boolean> {
    const [rows] = await this.db
      .select()
      .from(this.table)
      .where(eq(sql`lower(${this.table.username})`, username.toLowerCase()))
      .limit(1);
    return !!rows;
  }

  // =============================
  // SAFE DATA RETRIEVAL (no password)
  // =============================
  async getByIdSafe(id: number): Promise<SafeUser | null> {
    const [rows] = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id))
      .limit(1);
    if (!rows) return null;
    const { password, ...safeUser } = rows;
    return safeUser;
  }

  async getByEmailSafe(email: string): Promise<SafeUser | null> {
    const [rows] = await this.db
      .select()
      .from(this.table)
      .where(eq(sql`lower(${this.table.email})`, email.toLowerCase()))
      .limit(1);
    if (!rows) return null;
    const { password, ...safeUser } = rows;
    return safeUser;
  }

  // =============================
  // MUTATION / UPDATE
  // =============================
  async createUser(user: UserInsert): Promise<SafeUser> {
    const [createdRow] = await this.db
      .insert(this.table)
      .values(user)
      .returning();
    const { password, ...safeUser } = createdRow;
    return safeUser;
  }

  async updateUser(
    id: number,
    newUserData: UserUpdate,
  ): Promise<SafeUser | null> {
    const result = await this.db
      .update(this.table)
      .set(newUserData)
      .where(eq(this.table.id, id))
      .returning();
    if (!result.length) return null;
    const { password, ...safeUser } = result[0];
    return safeUser;
  }

  async updateEmail(id: number, newEmail: string): Promise<SafeUser | null> {
    const result = await this.db
      .update(this.table)
      .set({ email: newEmail, isEmailVerified: false }) // Reset email verification
      .where(eq(this.table.id, id))
      .returning();
    if (!result.length) return null;
    const { password, ...safeUser } = result[0];
    return safeUser;
  }

  async updateUsername(
    id: number,
    newUsername: string,
  ): Promise<SafeUser | null> {
    const result = await this.db
      .update(this.table)
      .set({ username: newUsername })
      .where(eq(this.table.id, id))
      .returning();
    if (!result.length) return null;
    const { password, ...safeUser } = result[0];
    return safeUser;
  }

  async verifyUserEmail(id: number): Promise<SafeUser | null> {
    const result = await this.db
      .update(this.table)
      .set({ isEmailVerified: true })
      .where(eq(this.table.id, id))
      .returning();
    if (!result.length) return null;
    const { password, ...safeUser } = result[0];
    return safeUser;
  }

  async updateUserPassword(
    id: number,
    newPw: string,
  ): Promise<SafeUser | null> {
    const result = await this.db
      .update(this.table)
      .set({ password: newPw })
      .where(eq(this.table.id, id))
      .returning();
    if (!result.length) return null;
    const { password, ...safeUser } = result[0];
    return safeUser;
  }

  async updateUserPreferences(
    id: number,
    preferences: UpdateUserPreferencesSafe,
  ): Promise<SafeUser | null> {
    const result = await this.db
      .update(this.table)
      .set(preferences)
      .where(eq(this.table.id, id))
      .returning();
    if (!result.length) return null;
    const { password, ...safeUser } = result[0];
    return safeUser;
  }

  async updateUserSubscription(
    id: number,
    subscription: UpdateUserSubscriptionSafe,
  ): Promise<SafeUser | null> {
    const result = await this.db
      .update(this.table)
      .set(subscription)
      .where(eq(this.table.id, id))
      .returning();
    if (!result.length) return null;
    const { password, ...safeUser } = result[0];
    return safeUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.db
      .delete(this.table)
      .where(eq(this.table.id, id))
      .returning();
    return result.length > 0;
  }
}
