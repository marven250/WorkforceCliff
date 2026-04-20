import type { Request, Response, NextFunction, RequestHandler } from "express";
import { verifyAccessToken } from "../auth/tokens";
import type { AccountRole, PublicUser } from "../../shared/Auth";
import { findAccountById } from "../services/authAccounts";

export interface AuthedRequest extends Request {
  auth?: PublicUser;
}

function extractBearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h || !h.startsWith("Bearer ")) return null;
  return h.slice("Bearer ".length).trim() || null;
}

export const authenticate: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const token = extractBearer(req);
  if (!token) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }
  try {
    const payload = verifyAccessToken(token);
    const account = await findAccountById(payload.sub);
    if (!account) {
      res.status(401).json({ error: "Account no longer exists" });
      return;
    }
    (req as AuthedRequest).auth = account;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

export function requireRoles(...allowed: AccountRole[]): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthedRequest).auth;
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (!allowed.includes(user.role)) {
      res.status(403).json({ error: "Forbidden for this role" });
      return;
    }
    next();
  };
}
