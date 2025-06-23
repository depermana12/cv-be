import type { UserSelect } from "./user.type";

export type AuthUserLogin = {
  email: string;
  password: string;
};

export type AuthUserRegister = {
  email: string;
  password: string;
  username: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type AuthUserSafe = Omit<UserSelect, "password">;

export type UserStats = {
  user: AuthUserSafe;
  accountAge: number;
  isEmailVerified: boolean;
  cvCreated: number;
  totalJobApplications?: number;
};
