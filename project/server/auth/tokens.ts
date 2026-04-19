import jwt, { type Secret } from "jsonwebtoken";
import type { AccountRole } from "../../shared/Auth";

const isProd = process.env.NODE_ENV === "production";
const secretFromEnv = process.env.JWT_SECRET?.trim();

if (isProd) {
  if (!secretFromEnv || secretFromEnv.length < 32) {
    throw new Error(
      "Production requires JWT_SECRET with at least 32 characters. Generate one with: openssl rand -base64 48",
    );
  }
} else if (!secretFromEnv) {
  console.warn(
    "[auth] JWT_SECRET is not set; using a development-only default. Set JWT_SECRET before any shared or hosted environment.",
  );
}

const JWT_SECRET: Secret = secretFromEnv || "dev-only-change-JWT_SECRET-in-production";
const JWT_EXPIRES = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

const signOptions: jwt.SignOptions = {
  expiresIn: JWT_EXPIRES,
  algorithm: "HS256",
};

const verifyOptions: jwt.VerifyOptions = {
  algorithms: ["HS256"],
};

export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: AccountRole;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, signOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET, verifyOptions) as jwt.JwtPayload & {
    email?: string;
    role?: AccountRole;
  };
  const subRaw = decoded.sub;
  const sub = typeof subRaw === "number" ? subRaw : typeof subRaw === "string" ? parseInt(subRaw, 10) : NaN;
  if (!Number.isFinite(sub) || !decoded.email || !decoded.role) {
    throw new Error("Invalid token payload");
  }
  return { sub, email: decoded.email, role: decoded.role };
}
