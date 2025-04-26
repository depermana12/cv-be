import { userRoutes } from "../src/controllers/user.controller";
import { testClient } from "hono/testing";
import { describe, test, expect, beforeEach, mock } from "bun:test";
import { UserService } from "../src/services/user.service";
import { Hono, type Context, type Next } from "hono";
import type { Bindings } from "../src/lib/types";

const mockUserRepository = {
  getById: mock((id: number) =>
    Promise.resolve({
      id: 1,
      username: "depermana",
      email: "depermana@email.com",
      createdAt: "2025-04-25",
    }),
  ),
};

const mockJwt = () => async (c: Context, next: Next) => {
  c.set("jwtPayload", { id: "1", email: "depermana@gmail.com" });
  await next();
};

describe("user controller", () => {
  let client: ReturnType<typeof testClient<typeof userRoutes>>;

  beforeEach(() => {
    mockUserRepository.getById.mockClear();

    const userService = new UserService(mockUserRepository as any);

    const app = new Hono<Bindings>()
      .use("/users/me", mockJwt())
      .get("/users/me", async (c) => {
        const { id } = c.get("jwtPayload");
        const me = await userService.getById(Number(id));
        return c.json({
          success: true,
          message: "it's me",
          data: me,
        });
      });

    client = testClient(app);
  });

  describe("/users/me", () => {
    test("should return current user when jwt token is exist", async () => {
      const res = await client.users.me.$get();

      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({
        success: true,
        message: "it's me",
        data: {
          id: 1,
          username: "depermana",
          email: "depermana@email.com",
          createdAt: "2025-04-25",
        },
      });
      expect(mockUserRepository.getById).toHaveBeenCalledWith(1);
    });
  });
});
