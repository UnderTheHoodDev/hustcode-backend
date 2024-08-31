import { User } from "@prisma/client";
import { ACCESS_TOKEN_EXP, REFRESH_TOKEN_EXP } from "@/configs/constant";
import transporter from "@/configs/nodemailer";
import { getExpTimestamp } from "@/lib/utils";
import { JWT } from "@/models/jwt";
import UserRepository from "@/repositories/user.repository";
import { JWTPayloadSpec } from "@elysiajs/jwt";

const AuthService = {
  async sendMagicLink({ email, token }: { email: string; token: string }) {
    const mailOptions = {
      from: "HUSTCODE",
      to: email,
      subject: `Your Magic Link`,
      text: `Your Magic Link: https://localhost:3000/auth/verify?token=${token}`,
    };

    await transporter.sendMail(mailOptions);
  },

  async verifyUserAndGetToken({ email, jwt }: { email: string; jwt: JWT }) {
    // Create user if not exists
    const user = await UserRepository.saveIfNotExists(email);
    // Update user's last login
    // Generate access token and refresh token
    const newAccessToken = await jwt.sign({
      sub: user?.id as string,
      exp: getExpTimestamp(ACCESS_TOKEN_EXP),
    });
    const newRefreshToken = await jwt.sign({
      sub: user?.id as string,
      exp: getExpTimestamp(REFRESH_TOKEN_EXP),
    });

    await UserRepository.updateRefreshToken(
      user?.id as string,
      newRefreshToken
    );

    return {
      newAccessToken,
      newRefreshToken,
    };
  },

  async getTokenAndUpdate({jwt, user, oldRefreshPayload}: {jwt: JWT, user: User, oldRefreshPayload: JWTPayloadSpec}) {
    // create new access token
    const accessJWTToken = await jwt.sign({
      sub: user.id,
      exp: getExpTimestamp(ACCESS_TOKEN_EXP),
    });

     // create new refresh token
     const refreshJWTToken = await jwt.sign({
      sub: user.id,
      exp: oldRefreshPayload.exp as number,
    });

    // set refresh token in db
    await UserRepository.updateRefreshToken(user.id, refreshJWTToken);

    return {
      accessJWTToken,
      refreshJWTToken
    }
  }
};

export default AuthService;
