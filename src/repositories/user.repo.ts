import {
  users,
  type UserInsert,
  type UserSelect,
  type UserUpdate,
} from "../db/schema/user.db";

import { db } from "../db";
import { eq, getTableColumns } from "drizzle-orm";
import { DataBaseError } from "../errors/database.error";

export class UserRepository {
  private readonly db = db;
  constructor(db = {}, private readonly table = users) {
    this.table = users;
  }
  async getAll(): Promise<UserSelect[]> {
    return this.db.select().from(this.table);
  }
  async getById(id: number): Promise<UserSelect | null> {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.id, id));
    return rows[0] ?? null;
  }
  async getByEmail(email: string): Promise<UserSelect | null> {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq(this.table.email, email));
    return rows[0] ?? null;
  }

  async create(data: UserInsert): Promise<Omit<UserSelect, "password">> {
    const [insertedRow] = await this.db
      .insert(this.table)
      .values(data)
      .$returningId();

    if (!insertedRow.id) {
      throw new DataBaseError("Insert did not return an created ID.");
    }

    const createdUser = await this.getById(insertedRow.id);
    if (!createdUser) {
      throw new DataBaseError("Failed to retrieve created user record.");
    }
    const { password, ...rest } = createdUser;
    return { ...rest };
  }
  async update(id: number, newData: UserUpdate): Promise<UserSelect> {
    await this.db.update(this.table).set(newData).where(eq(this.table.id, id));
    const row = await this.getById(id);
    if (!row) {
      throw new DataBaseError("failed to retrieve updated user record");
    }
    return row;
  }
  async delete(id: number): Promise<void> {
    await this.db.delete(this.table).where(eq(this.table.id, id));
  }
}
