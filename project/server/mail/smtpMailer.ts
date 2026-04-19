import path from "node:path";
import { config as loadEnv } from "dotenv";
import nodemailer from "nodemailer";

// `__dirname` is `.../server/mail` under tsx / compiled CommonJS.
const serverRoot = path.resolve(__dirname, "..");
const projectRoot = path.resolve(__dirname, "..", "..");

// Load tracked templates first, then local `.env` (secrets override templates).
loadEnv({ path: path.join(projectRoot, ".env.example") });
loadEnv({ path: path.join(serverRoot, ".env.example") });
loadEnv({ path: path.join(serverRoot, ".env"), override: true });
loadEnv({ path: path.join(projectRoot, ".env"), override: true });

function env(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

function hasExplicitSmtp(): boolean {
  return Boolean(env("SMTP_HOST") && env("SMTP_PORT"));
}

function mailtrapCredentials(): { user: string; pass: string } | undefined {
  const user = env("MAILTRAP_USER");
  const pass = env("MAILTRAP_PASS");
  if (user && pass) return { user, pass };
  return undefined;
}

/**
 * Mail sends when MAIL_FROM is set and either:
 * - SMTP_HOST + SMTP_PORT (any SMTP provider), or
 * - MAILTRAP_USER + MAILTRAP_PASS (Mailtrap Email Testing: sandbox.smtp.mailtrap.io:2525).
 */
export function isMailConfigured(): boolean {
  if (!env("MAIL_FROM")) return false;
  if (hasExplicitSmtp()) return true;
  return Boolean(mailtrapCredentials());
}

export type SendMailInput = {
  to: string[];
  subject: string;
  text: string;
  html?: string;
};

/**
 * Sends one message. If multiple recipients, uses first as To and the rest as Bcc
 * (avoids exposing admin addresses to each other).
 */
export async function sendMail(input: SendMailInput): Promise<void> {
  if (!isMailConfigured()) {
    console.info(
      "[mail] skipped: set MAIL_FROM and either SMTP_HOST+SMTP_PORT or MAILTRAP_USER+MAILTRAP_PASS",
    );
    return;
  }
  const { to, subject, text, html } = input;
  if (to.length === 0) return;

  let host: string;
  let port: number;
  let secure: boolean;
  let auth: { user: string; pass: string } | undefined;

  if (hasExplicitSmtp()) {
    host = env("SMTP_HOST")!;
    const portStr = env("SMTP_PORT")!;
    port = Number(portStr);
    if (!Number.isFinite(port) || port <= 0) {
      console.error("[mail] invalid SMTP_PORT");
      return;
    }
    const user = env("SMTP_USER");
    const pass = env("SMTP_PASS");
    secure =
      env("SMTP_SECURE") === "true" || env("SMTP_SECURE") === "1" || port === 465;
    auth = user && pass ? { user, pass } : undefined;
  } else {
    const creds = mailtrapCredentials();
    
    if (!creds) {
      console.info(
        "[mail] skipped: set MAIL_FROM and either SMTP_HOST+SMTP_PORT or MAILTRAP_USER+MAILTRAP_PASS",
      );
      return;
    }
    host = "sandbox.smtp.mailtrap.io";
    port = 2525;
    secure = false;
    auth = creds;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth,
  });

  const from = env("MAIL_FROM")!;
  const replyTo = env("MAIL_REPLY_TO");

  const [primary, ...bccRest] = to;
  const mailOptions: nodemailer.SendMailOptions = {
    from,
    to: primary,
    bcc: bccRest.length > 0 ? bccRest : undefined,
    subject,
    text,
    html: html ?? text,
    replyTo: replyTo || undefined,
  };

  await transporter.sendMail(mailOptions);
}
