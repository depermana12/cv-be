import { db } from "../db";
import { UserRepository } from "../repositories/user.repo";
import { UserService } from "../services/user.service";

export const createUserService = () => {
  const userRepository = new UserRepository(db);
  const userService = new UserService(userRepository);
  return userService;
};
