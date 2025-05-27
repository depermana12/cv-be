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
