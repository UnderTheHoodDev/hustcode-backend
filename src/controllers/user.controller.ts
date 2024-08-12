import Elysia from "elysia";
import authMiddleware from "../middlewares/auth.middleware";
import UserService from "../services/user.service";

const apiOptions = {
  detail: {
    tags: ["User"],
  },
};
const userController = new Elysia({ prefix: "/api/user" })
  .use(authMiddleware)
  .get(
    "/",
    async ({ set }) => {
      set.status = "OK";
      const user = await UserService.getUser();
      return user;
    },
    apiOptions
  )
  .get("/:id", ({ params }) => `Hello User ${params.id}`, apiOptions);

export default userController;
