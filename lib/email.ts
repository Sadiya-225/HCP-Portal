import "server-only";
import nodemailer from "nodemailer";
import { getServerEnv } from "@/lib/env";

export async function sendPasswordResetEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}): Promise<void> {
  const env = getServerEnv();
  if (!env.PASSWORD_RESET_ENABLED) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    requireTLS: !env.SMTP_SECURE,
    tls: {
      minVersion: "TLSv1.2",
    },
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: "Reset your HCP Portal password",
    text: `A password reset was requested for your HCP Portal account.\n\nOpen the following link to choose a new password:\n${url}\n\nIf you did not request this, you can ignore this email.`,
  });
}
