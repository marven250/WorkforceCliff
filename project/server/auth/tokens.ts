import jwt, { type Secret } from "jsonwebtoken";
import type { AccountRole } from "../../shared/Auth";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "dev-only-change-JWT_SECRET-in-production";
const JWT_EXPIRES = (process.env.JWT_EXPIRES_IN || "7d") as jwt.SignOptions["expiresIn"];

export interface AccessTokenPayload {
  sub: number;
  email: string;
  role: AccountRole;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & {
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
