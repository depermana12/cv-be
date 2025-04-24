import {
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  like,
  and,
  asc,
  desc,
  or,
  sql,
} from "drizzle-orm";
import type {
  MySqlColumn,
  MySqlSelect,
  MySqlTableWithColumns,
} from "drizzle-orm/mysql-core";
import { DataBaseError } from "../errors/database.error";

type FilterOperator =
  | "eq"
  | "ne"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "like"
  | "ilike";

interface FilterCondition<T, K extends keyof T = keyof T> {
  column: keyof T & string;
  operator: FilterOperator;
  value: T[K];
}

interface SortCondition {
  column: string;
  order: "asc" | "desc";
}

interface SearchCondition {
  columns: string[];
  term: string;
}

export interface QueryOptions {
  filter?: FilterCondition<any>[];
  sort?: SortCondition[];
  search?: SearchCondition;
}

export class QueryBuilder<T extends MySqlTableWithColumns<any>> {
  private table: T;
  private query: MySqlSelect;
  constructor(table: T, query: MySqlSelect) {
    (this.table = table), (this.query = query);
  }

  withFilters(filters: FilterCondition<any>[] = []): this {
    if (!filters || filters.length === 0) return this;

    const whereConditions = filters.map((filter) => {
      const column = this.table[filter.column] as MySqlColumn;
      if (!column)
        throw new DataBaseError(
          `column ${filter.column} does not exists in this table`,
        );

      switch (filter.operator) {
        case "eq":
          return eq(column, filter.value);
        case "ne":
          return ne(column, filter.value);
        case "gt":
          return gt(column, filter.value);
        case "gte":
          return gte(column, filter.value);
        case "lt":
          return lt(column, filter.value);
        case "lte":
          return lte(column, filter.value);
        case "like":
          return like(column, filter.value);
        case "ilike":
          return like(sql`lower(column)`, filter.value);
        default:
          throw new DataBaseError(`unsupported operator ${filter.operator}`);
      }
    });

    this.query = this.query.where(and(...whereConditions));
    return this;
  }

  withSort(sort: SortCondition[]): this {
    if (!sort || sort.length === 0) return this;

    const orderCondition = sort.map(({ column, order }) => {
      const col = this.table[column] as MySqlColumn;
      if (!col)
        throw new DataBaseError(`col ${column} does not exist in table`);
      return order === "asc" ? asc(col) : desc(col);
    });

    this.query = this.query.orderBy(...orderCondition);
    return this;
  }

  withSearch(search: SearchCondition): this {
    if (!search || !search.term || search.columns.length === 0) return this;

    const searchCondition = search.columns.map((field) => {
      const column = this.table[field] as MySqlColumn;
      if (!column)
        throw new DataBaseError(`column ${field} does not exist in table`);

      return like(column, `%${search.term}%`);
    });

    this.query = this.query.where(or(...searchCondition));
    return this;
  }

  build(options: QueryOptions): this {
    if (options.filter) {
      this.withFilters(options.filter);
    }
    if (options.sort) {
      this.withSort(options.sort);
    }
    if (options.search) {
      this.withSearch(options.search);
    }

    return this;
  }

  getQuery(): MySqlSelect {
    return this.query;
  }
}
