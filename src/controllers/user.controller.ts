import Elysia from "elysia";
import authMiddleware from "../middlewares/auth.middleware";
import UserService from "../services/user.service";

const apiOptions = {
  detail: {
    tags: ["User"],
  },
};
const userController = new Elysia({ prefix: "/api/v1/user" })
  .use(authMiddleware)
  .get(
    "/",
    async ({ set, user }) => {
      set.status = "OK";
      // const user = await UserService.getUser();
      return user;
    },
    apiOptions
  )

export default userController;
