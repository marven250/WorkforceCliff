import { Router, type Request, type Response } from "express";
import type { AuthedRequest } from "../middleware/auth";
import { authenticate, requireRoles } from "../middleware/auth";
import {
  claimEducationProviderInquiry,
  claimEmployerInquiry,
  completeEducationProviderInquiry,
  completeEmployerInquiry,
  listEducationProviderInquiries,
  listEmployerInquiries,
  type EducationProviderInquiryRowDb,
  type EmployerInquiryRowDb,
} from "../services/inquiries";
import { addInquirySseClient, publishInquiryEvent, publishInquiryPing } from "../services/inquiryEvents";

const router = Router();

function mapEmployer(r: EmployerInquiryRowDb) {
  return {
    id: r.id,
    organizationLegalName: r.organization_legal_name,
    contactFirstName: r.contact_first_name,
    contactLastName: r.contact_last_name,
    email: r.email,
    phone: r.phone,
    state: r.state,
    approximateEmployees: r.approximate_employees,
    message: r.message,
    createdAt: r.created_at,
    claimedByUserId: r.claimed_by_user_id,
    claimedAt: r.claimed_at,
    completedAt: r.completed_at,
    claimedByName:
      r.claimed_by_first_name != null || r.claimed_by_last_name != null
        ? `${r.claimed_by_first_name ?? ""} ${r.claimed_by_last_name ?? ""}`.trim() || null
        : null,
    claimedByEmail: r.claimed_by_email ?? null,
  };
}

function mapProvider(r: EducationProviderInquiryRowDb) {
  return {
    id: r.id,
    institutionName: r.institution_name,
    contactName: r.contact_name,
    email: r.email,
    phone: r.phone,
    state: r.state,
    website: r.website,
    programsSummary: r.programs_summary,
    message: r.message,
    createdAt: r.created_at,
    claimedByUserId: r.claimed_by_user_id,
    claimedAt: r.claimed_at,
    completedAt: r.completed_at,
    claimedByName:
      r.claimed_by_first_name != null || r.claimed_by_last_name != null
        ? `${r.claimed_by_first_name ?? ""} ${r.claimed_by_last_name ?? ""}`.trim() || null
        : null,
    claimedByEmail: r.claimed_by_email ?? null,
  };
}

router.get(
  "/inquiries",
  authenticate,
  requireRoles("platform_admin"),
  async (req: Request, res: Response) => {
    const archived = req.query.scope === "archived";
    const employers = await listEmployerInquiries(archived);
    const providers = await listEducationProviderInquiries(archived);
    res.json({
      employerInquiries: employers.map(mapEmployer),
      educationProviderInquiries: providers.map(mapProvider),
    });
  },
);

router.get(
  "/inquiries/stream",
  authenticate,
  requireRoles("platform_admin"),
  async (_req: Request, res: Response) => {
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const { remove } = addInquirySseClient(res);

    const keepAlive = setInterval(() => {
      publishInquiryPing();
    }, 25_000);

    res.on("close", () => {
      clearInterval(keepAlive);
      remove();
    });
  },
);

router.post(
  "/inquiries/employer/:id/claim",
  authenticate,
  requireRoles("platform_admin"),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ error: "Invalid inquiry id" });
      return;
    }
    const userId = (req as AuthedRequest).auth!.id;
    const outcome = await claimEmployerInquiry(id, userId);
    if (outcome === "not_found") {
      res.status(404).json({ error: "Inquiry not found" });
      return;
    }
    if (outcome === "already_completed") {
      res.status(400).json({ error: "This inquiry is already completed" });
      return;
    }
    if (outcome === "taken") {
      res.status(409).json({ error: "Another admin has already claimed this inquiry" });
      return;
    }
    if (outcome === "claimed") {
      publishInquiryEvent({ kind: "employer", action: "claimed", id });
    }
    res.json({ ok: true, status: outcome });
  },
);

router.post(
  "/inquiries/education-provider/:id/claim",
  authenticate,
  requireRoles("platform_admin"),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ error: "Invalid inquiry id" });
      return;
    }
    const userId = (req as AuthedRequest).auth!.id;
    const outcome = await claimEducationProviderInquiry(id, userId);
    if (outcome === "not_found") {
      res.status(404).json({ error: "Inquiry not found" });
      return;
    }
    if (outcome === "already_completed") {
      res.status(400).json({ error: "This inquiry is already completed" });
      return;
    }
    if (outcome === "taken") {
      res.status(409).json({ error: "Another admin has already claimed this inquiry" });
      return;
    }
    if (outcome === "claimed") {
      publishInquiryEvent({ kind: "education_provider", action: "claimed", id });
    }
    res.json({ ok: true, status: outcome });
  },
);

router.post(
  "/inquiries/employer/:id/complete",
  authenticate,
  requireRoles("platform_admin"),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ error: "Invalid inquiry id" });
      return;
    }
    const userId = (req as AuthedRequest).auth!.id;
    const outcome = await completeEmployerInquiry(id, userId);
    if (outcome === "not_found") {
      res.status(404).json({ error: "Inquiry not found" });
      return;
    }
    if (outcome === "already_completed") {
      res.status(400).json({ error: "This inquiry is already completed" });
      return;
    }
    if (outcome === "not_claimed") {
      res.status(400).json({ error: "Claim this inquiry before marking it complete" });
      return;
    }
    if (outcome === "wrong_claimer") {
      res.status(403).json({ error: "Only the admin who claimed this inquiry can mark it complete" });
      return;
    }
    publishInquiryEvent({ kind: "employer", action: "completed", id });
    res.json({ ok: true });
  },
);

router.post(
  "/inquiries/education-provider/:id/complete",
  authenticate,
  requireRoles("platform_admin"),
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ error: "Invalid inquiry id" });
      return;
    }
    const userId = (req as AuthedRequest).auth!.id;
    const outcome = await completeEducationProviderInquiry(id, userId);
    if (outcome === "not_found") {
      res.status(404).json({ error: "Inquiry not found" });
      return;
    }
    if (outcome === "already_completed") {
      res.status(400).json({ error: "This inquiry is already completed" });
      return;
    }
    if (outcome === "not_claimed") {
      res.status(400).json({ error: "Claim this inquiry before marking it complete" });
      return;
    }
    if (outcome === "wrong_claimer") {
      res.status(403).json({ error: "Only the admin who claimed this inquiry can mark it complete" });
      return;
    }
    publishInquiryEvent({ kind: "education_provider", action: "completed", id });
    res.json({ ok: true });
  },
);

export default router;
