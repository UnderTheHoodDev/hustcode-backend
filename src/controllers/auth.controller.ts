import { jwt } from "@elysiajs/jwt";
import Elysia, { t } from "elysia";
import {
  ACCESS_TOKEN_EXP,
  JWT_NAME,
  MAGIC_LINK_EXP,
  REFRESH_TOKEN_EXP,
} from "@/configs/constant";
import { getExpTimestamp } from "@/lib/utils";
import AuthService from "@/services/auth.service";
import UserService from "@/services/user.service";

const apiOptions = {
  detail: {
    tags: ["Auth"],
  },
};
const authController = new Elysia({ prefix: "/api/v1/auth" })
  .use(
    jwt({
      name: JWT_NAME,
      secret: Bun.env.JWT_SECRET as string,
    })
  )
  .post(
    "/magic-link",
    async ({ jwt, set, body }) => {
      const token = await jwt.sign({
        email: body.email,
        exp: getExpTimestamp(MAGIC_LINK_EXP),
      });
      try {
        await AuthService.sendMagicLink({ email: body.email, token });
        set.status = "OK";
        return "Email sent with magic link";
      } catch (error) {
        set.status = "Bad Request";
        return error;
      }
    },
    {
      body: t.Object({
        email: t.String(),
      }),
      ...apiOptions,
    }
  )
  .get(
    "/verify",
    async ({ jwt, query, cookie: { accessToken, refreshToken } }) => {
      const decoded = await jwt.verify(query.token);
      if (decoded === false)
        return {
          status: false,
          message: "Your link has expired",
        };

      const { newAccessToken, newRefreshToken } =
        await AuthService.verifyUserAndGetToken({
          email: decoded.email as string,
          jwt,
        });

      // Set cookie
      accessToken.set({
        value: newAccessToken,
        httpOnly: true,
        maxAge: ACCESS_TOKEN_EXP,
        path: "/",
      });
      refreshToken.set({
        value: newRefreshToken,
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXP,
        path: "/",
      });

      return {
        status: true,
        message: "Login successfully",
      };
    },
    {
      query: t.Object({
        token: t.String(),
      }),
      ...apiOptions,
    }
  )
  .post(
    "/refresh",
    async ({ cookie: { accessToken, refreshToken }, jwt, set }) => {
      if (!refreshToken.value) {
        // handle error for refresh token is not available
        set.status = "Unauthorized";
        throw new Error("Refresh token is missing");
      }

      // get refresh token from cookie
      const jwtPayload = await jwt.verify(refreshToken.value);
      if (!jwtPayload) {
        // handle error for refresh token is tempted or incorrect
        set.status = "Forbidden";
        throw new Error("Refresh token is invalid");
      }

      // get user from refresh token
      const userId = jwtPayload.sub;

      // verify user exists or not
      const user = await UserService.getUserById(userId as string);

      if (!user) {
        // handle error for user not found from the provided refresh token
        set.status = "Forbidden";
        throw new Error("Refresh token is invalid");
      }

      const { accessJWTToken, refreshJWTToken } = await AuthService.getTokenAndUpdate({
        jwt,
        user,
        oldRefreshPayload: jwtPayload,
      })

      accessToken.set({
        value: accessJWTToken,
        httpOnly: true,
        maxAge: ACCESS_TOKEN_EXP,
        path: "/",
      });

      refreshToken.set({
        value: refreshJWTToken,
        httpOnly: true,
        maxAge: REFRESH_TOKEN_EXP,
        path: "/",
      });

      return {
        message: "Access token generated successfully",
        data: {
          accessToken: accessJWTToken,
          refreshToken: refreshJWTToken,
        },
      };
    }, apiOptions
  );

export default authController;
