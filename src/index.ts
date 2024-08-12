import cors from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";
import userController from "./controllers/user.controller";

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
  .use(userController)
  .get("/", () => "Hello Elysia")
  .listen(Bun.env.PORT || 4000);

console.log(
  `🦊 Server is running at ${app.server?.hostname}:${app.server?.port}`
);
