import type { users } from "../schema/user.db";

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = Omit<typeof users.$inferInsert, "createdAt">;
export type UserUpdate = Partial<Omit<UserInsert, "id" | "createdAt">>;

export type UpdateUserProfileSafe = Partial<
  Omit<
    UserInsert,
    | "id"
    | "username"
    | "email"
    | "isEmailVerified"
    | "password"
    | "createdAt"
    | "updatedAt"
  >
>;

export type UpdateUserPreferencesSafe = Partial<
  Pick<UserInsert, "emailNotifications" | "monthlyReports">
>;

export type UpdateUserSubscriptionSafe = Partial<
  Pick<
    UserInsert,
    "subscriptionType" | "subscriptionStatus" | "subscriptionExpiresAt"
  >
>;

export type SafeUser = Omit<UserSelect, "password">;
