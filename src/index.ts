import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import authController from "./controllers/auth.controller";
import userController from "./controllers/user.controller";
import healthCheckController from "./controllers/health.controller";

const app = new Elysia()
  .use(
    swagger({
      documentation: {
        tags: [
          { name: "User", description: "User endpoints" },
          { name: "Auth", description: "Authentication endpoints" },
        ],
      },
    })
  )
  .use(cors())
  .use(healthCheckController)
  .use(authController)
  .use(userController)
  .get("/", () => "Hello Elysia")
  .listen(Bun.env.PORT || 4000);

console.log(
  `🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
