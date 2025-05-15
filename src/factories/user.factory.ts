import { getDb } from "../db/index";
import { UserRepository } from "../repositories/user.repo";
import { UserService } from "../services/user.service";

export const createUserService = async () => {
  const db = await getDb();
  const userRepository = new UserRepository(db);
  const userService = new UserService(userRepository);
  return userService;
};
