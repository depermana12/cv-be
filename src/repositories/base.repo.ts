import { eq, type InferInsertModel, type InferSelectModel } from "drizzle-orm";
import { MySqlTable, type TableConfig } from "drizzle-orm/mysql-core";

export class BaseRepository<
  TTable extends MySqlTable<TableConfig>,
  TInsert = InferInsertModel<TTable>,
  TSelect = InferSelectModel<TTable>,
  TUpdate = Partial<TInsert>,
> {
  constructor(
    protected readonly db: any,
    protected readonly table: TTable,
    protected readonly primaryKey: keyof TSelect & string,
  ) {}
  async getAll(): Promise<TSelect[]> {
    return await this.db.select().from(this.table);
  }
  async getById(id: number | string): Promise<TSelect | null> {
    const rows = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any)[this.primaryKey], id));
    return (rows[0] as TSelect) ?? null;
  }

  // the mysql insert returning is problematic
  async create(data: TInsert): Promise<TSelect> {
    const [inserted] = await this.db
      .insert(this.table)
      .values(data as any)
      .$returningId();

    if (!inserted) {
      throw new Error("insert did not return an ID.");
    }

    const id = (inserted as Record<string, any>)[this.primaryKey as string];

    const result = await this.getById(id);
    if (!result) {
      throw new Error("failed to retrieve the created record.");
    }
    return result;
  }

  async update(id: number, data: TUpdate): Promise<TSelect> {
    await this.db
      .update(this.table)
      .set(data as any)
      .where(eq((this.table as any)[this.primaryKey], id));
    const result = await this.getById(id);
    if (!result) {
      throw new Error("Failed to retrieve the updated record.");
    }
    return result;
  }

  async delete(id: number): Promise<void> {
    await this.db
      .delete(this.table)
      .where(eq((this.table as any)[this.primaryKey], id));
  }
  async exists(id: number | string): Promise<boolean> {
    const result = await this.db
      .select()
      .from(this.table)
      .where(eq((this.table as any)[this.primaryKey], id))
      .limit(1);
    return result.length > 0;
  }
}
