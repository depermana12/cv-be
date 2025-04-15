import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { db } from "../db/index";
import { MySqlTable } from "drizzle-orm/mysql-core";

export class BaseRepository<
  TTable extends MySqlTable,
  TInsert = InferInsertModel<TTable>,
  TSelect = InferSelectModel<TTable>,
  TUpdate extends Partial<TInsert> = Partial<TInsert>,
> {
  constructor(
    protected readonly table: TTable,
    protected readonly primaryKey: keyof TSelect,
  ) {}
  async getAll(): Promise<TSelect[]> {
    return (await db.select().from(this.table)) as TSelect[];
  }
  async getById(id: number | string): Promise<TSelect | undefined> {
    const result = await db
      .select()
      .from(this.table)
      .where(eq((this.table as any)[this.primaryKey], id));
    return result[0] as TSelect;
  }
  // the mysql insert returning is problematic
  async create(data: TInsert) {
    const [inserted] = await db
      .insert(this.table)
      .values(data as any)
      .$returningId();
    const id = (inserted as Record<string, any>)[this.primaryKey as string];
    return this.getById(id);
  }

  async update(id: number, data: TUpdate): Promise<TSelect | undefined> {
    await db
      .update(this.table)
      .set(data as any)
      .where(eq((this.table as any)[this.primaryKey], id));
    return this.getById(id);
  }

  async delete(id: number): Promise<void> {
    await db
      .delete(this.table)
      .where(eq((this.table as any)[this.primaryKey], id));
  }
  async exists(id: number | string): Promise<boolean> {
    const result = await this.getById(id);
    return !!result;
  }
}
