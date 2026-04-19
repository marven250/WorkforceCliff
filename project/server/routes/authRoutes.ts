import { Router, type Request, type Response } from "express";
import type { LoginBody, RegisterLearnerBody } from "../../shared/Auth";
import { getTenantBySlug } from "../../shared/tenants";
import { hashPassword, verifyPassword } from "../auth/password";
import { signAccessToken } from "../auth/tokens";
import { authenticate, type AuthedRequest } from "../middleware/auth";
import { createLearnerAccount, findAccountByEmail, findAccountById } from "../repos/authAccounts";

const router = Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/register", async (req: Request, res: Response) => {
  const body = req.body as RegisterLearnerBody;
  if (
    !body?.email ||
    !body?.password ||
    !body?.firstName ||
    !body?.lastName ||
    !body?.phone ||
    !body?.state ||
    !body?.employerTenantSlug?.trim()
  ) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }
  const employerTenant = getTenantBySlug(body.employerTenantSlug.trim());
  if (!employerTenant) {
    res.status(400).json({ error: "Unknown employer" });
    return;
  }
  if (!emailRegex.test(body.email)) {
    res.status(400).json({ error: "Invalid email" });
    return;
  }
  if (body.password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  const existing = await findAccountByEmail(body.email);
  if (existing) {
    res.status(409).json({ error: "An account already exists with this email" });
    return;
  }
  try {
    const passwordHash = await hashPassword(body.password);
    const user = await createLearnerAccount({
      email: body.email.trim(),
      passwordHash,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      phone: body.phone.trim(),
      state: body.state.trim(),
      employerName: employerTenant.name,
      employerTenantSlug: employerTenant.slug,
    });
    const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const body = req.body as LoginBody;
  if (!body?.email || !body?.password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  const row = await findAccountByEmail(body.email.trim());
  if (!row) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const ok = await verifyPassword(body.password, row.password_hash);
  if (!ok) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }
  const user = await findAccountById(row.id);
  if (!user) {
    res.status(500).json({ error: "Account lookup failed" });
    return;
  }
  if (body.tenantPortal === true) {
    if (user.role !== "learner" && user.role !== "employer") {
      res.status(403).json({
        error:
          "This employer portal sign-in is only for learners and employer administrators. Education providers and platform staff should use the appropriate sign-in page.",
      });
      return;
    }
  }
  const token = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  res.json({ token, user });
});

router.get("/me", authenticate, async (req: Request, res: Response) => {
  const u = (req as AuthedRequest).auth!;
  const fresh = await findAccountById(u.id);
  if (!fresh) {
    res.status(401).json({ error: "Account not found" });
    return;
  }
  res.json({ user: fresh });
});

export default router;
