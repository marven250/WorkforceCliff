import { Router, type Request, type Response } from "express";
import { getProvidersForAuthLearner } from "../services/providers";
import { authenticate, requireRoles, type AuthedRequest } from "../middleware/auth";
import {
  getLearnerAccountIdForSubmission,
  getSubmissionIdForLearnerAndProvider,
  listPendingForOrganization,
  requestEligibilityForProvider,
  setEligibilityDecision,
} from "../services/learnerEligibility";
import { listProgramOfferingsWithProviders } from "../services/programOfferings";
import {
  addEmployerEligibilitySseClient,
  addLearnerEligibilitySseClient,
  publishEligibilityEvent,
  publishEligibilityPing,
} from "../services/eligibilityEvents";

const router = Router();

router.get("/home", authenticate, async (req: Request, res: Response) => {
  const u = (req as AuthedRequest).auth!;
  switch (u.role) {
    case "learner":
      res.json({
        role: u.role,
        title: "Your learning hub",
        summary:
          u.organizationName != null
            ? `You're connected to ${u.organizationName}. Track benefits, explore programs, and connect coursework to mobility opportunities.`
            : "Track benefits, explore programs, and connect your coursework to internal mobility opportunities.",
        nextSteps: [
          "Complete your learner profile",
          "Browse eligible education providers",
          "Meet with a success coach when available",
        ],
      });
      return;
    case "employer": {
      const orgId = u.organizationId;
      const pendingRows = orgId != null ? await listPendingForOrganization(orgId) : [];
      const pendingEligibility = pendingRows.map((r) => ({
        id: r.id,
        providerId: r.provider_id,
        providerName: r.provider_name,
        learnerId: r.learner_account_id,
        learnerEmail: r.learner_email,
        learnerName: `${r.learner_first_name} ${r.learner_last_name}`.trim(),
        createdAt: r.created_at,
      }));
      res.json({
        role: u.role,
        title: "Employer workspace",
        summary: `Signed in under ${u.organizationName ?? "your organization"}.`,
        nextSteps: [
          "Review utilization and completion trends",
          "Align pathways to critical job families",
          "Invite HR partners to co-manage the program",
        ],
        pendingEligibility,
      });
      return;
    }
    case "education_provider":
      res.json({
        role: u.role,
        title: "Partner workspace",
        summary: `Signed in as ${u.organizationName ?? "your institution"}. Manage catalog visibility and learner referrals.`,
        nextSteps: ["Update program offerings", "Confirm accreditation documents", "Respond to employer pathway requests"],
      });
      return;
    case "platform_admin":
      res.json({
        role: u.role,
        title: "Platform administration",
        summary: "Operational tools for Workforce Cliff.",
        nextSteps: ["Review B2B inquiries under Admin → Inquiries", "Rotate API secrets before production"],
      });
      return;
    default:
      res.status(403).json({ error: "Unknown role" });
  }
});

router.get("/learners/me/providers", authenticate, requireRoles("learner"), async (req: Request, res: Response) => {
  const u = (req as AuthedRequest).auth!;
  const providers = await getProvidersForAuthLearner(u.id);
  res.json(providers);
});

router.get(
  "/learners/eligibility/stream",
  authenticate,
  requireRoles("learner"),
  async (_req: Request, res: Response) => {
    const u = (_req as AuthedRequest).auth!;
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const remove = addLearnerEligibilitySseClient(res, u.id);
    const keepAlive = setInterval(() => publishEligibilityPing(), 25_000);
    res.on("close", () => {
      clearInterval(keepAlive);
      remove();
    });
  },
);

router.get(
  "/employer/eligibility/stream",
  authenticate,
  requireRoles("employer"),
  async (_req: Request, res: Response) => {
    const u = (_req as AuthedRequest).auth!;
    const orgId = u.organizationId;
    if (orgId == null) {
      res.status(403).json({ error: "Your employer account is not linked to an organization." });
      return;
    }
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const remove = addEmployerEligibilitySseClient(res, orgId);
    const keepAlive = setInterval(() => publishEligibilityPing(), 25_000);
    res.on("close", () => {
      clearInterval(keepAlive);
      remove();
    });
  },
);

router.get(
  "/learners/program-offerings",
  authenticate,
  requireRoles("learner"),
  async (_req: Request, res: Response) => {
    const rows = await listProgramOfferingsWithProviders();
    res.json({
      offerings: rows.map((r) => ({
        id: r.id,
        providerId: r.provider_id,
        providerName: r.provider_name,
        title: r.title,
        credential: r.credential,
        modality: r.modality,
        durationSummary: r.duration_summary,
        summary: r.summary,
      })),
    });
  },
);

router.post(
  "/learners/eligibility-requests",
  authenticate,
  requireRoles("learner"),
  async (req: Request, res: Response) => {
    const u = (req as AuthedRequest).auth!;
    if (u.organizationId == null) {
      res.status(400).json({ error: "Your account is not linked to an employer. You cannot request eligibility yet." });
      return;
    }
    const providerId = Number((req.body as { providerId?: unknown }).providerId);
    if (!Number.isFinite(providerId) || providerId <= 0) {
      res.status(400).json({ error: "Valid providerId is required" });
      return;
    }
    const outcome = await requestEligibilityForProvider(u.id, providerId);
    if (outcome === "already_pending") {
      res.status(409).json({ error: "You already have a pending eligibility request for this provider." });
      return;
    }
    if (outcome === "already_eligible") {
      res.status(409).json({ error: "You are already marked eligible for this provider." });
      return;
    }
    const orgId = u.organizationId!;
    const submissionId = (await getSubmissionIdForLearnerAndProvider(u.id, providerId)) ?? undefined;
    publishEligibilityEvent({
      action: outcome === "created" ? "submission_created" : "submission_resubmitted",
      organizationId: orgId,
      learnerAccountId: u.id,
      submissionId,
    });
    res.status(outcome === "created" ? 201 : 200).json({ ok: true, outcome });
  },
);

router.post(
  "/employer/eligibility/:id/approve",
  authenticate,
  requireRoles("employer"),
  async (req: Request, res: Response) => {
    const u = (req as AuthedRequest).auth!;
    const orgId = u.organizationId;
    if (orgId == null) {
      res.status(403).json({ error: "Your employer account is not linked to an organization." });
      return;
    }
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const result = await setEligibilityDecision(id, orgId, "approve");
    if (result === "not_found") {
      res.status(404).json({ error: "Submission not found" });
      return;
    }
    if (result === "wrong_organization") {
      res.status(403).json({ error: "This submission belongs to another employer." });
      return;
    }
    if (result === "not_pending") {
      res.status(409).json({ error: "This submission is no longer pending." });
      return;
    }
    const learnerAccountIdApprove = (await getLearnerAccountIdForSubmission(id)) ?? 0;
    if (learnerAccountIdApprove) {
      publishEligibilityEvent({
        action: "approved",
        organizationId: orgId,
        learnerAccountId: learnerAccountIdApprove,
        submissionId: id,
      });
    }
    res.json({ ok: true });
  },
);

router.post(
  "/employer/eligibility/:id/reject",
  authenticate,
  requireRoles("employer"),
  async (req: Request, res: Response) => {
    const u = (req as AuthedRequest).auth!;
    const orgId = u.organizationId;
    if (orgId == null) {
      res.status(403).json({ error: "Your employer account is not linked to an organization." });
      return;
    }
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const result = await setEligibilityDecision(id, orgId, "reject");
    if (result === "not_found") {
      res.status(404).json({ error: "Submission not found" });
      return;
    }
    if (result === "wrong_organization") {
      res.status(403).json({ error: "This submission belongs to another employer." });
      return;
    }
    if (result === "not_pending") {
      res.status(409).json({ error: "This submission is no longer pending." });
      return;
    }
    const learnerAccountId = (await getLearnerAccountIdForSubmission(id)) ?? 0;
    if (learnerAccountId) {
      publishEligibilityEvent({
        action: "rejected",
        organizationId: orgId,
        learnerAccountId,
        submissionId: id,
      });
    }
    res.json({ ok: true });
  },
);

export default router;
