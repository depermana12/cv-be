import type { users } from "../schema/user.db";

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = Omit<typeof users.$inferInsert, "createdAt">;
export type UserUpdate = Partial<Omit<UserInsert, "id" | "createdAt">>;

export type UpdateUserProfileSafe = Partial<
  Omit<
    UserInsert,
    "id" | "email" | "isEmailVerified" | "password" | "createdAt" | "updatedAt"
  >
>;
