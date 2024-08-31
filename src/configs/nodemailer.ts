import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: Bun.env.MAIL_USER,
    pass: Bun.env.MAIL_PASSWORD,
  },
});

export default transporter;
