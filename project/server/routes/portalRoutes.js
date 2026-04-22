"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const providers_1 = require("../services/providers");
const auth_1 = require("../middleware/auth");
const learnerEligibility_1 = require("../services/learnerEligibility");
const programOfferings_1 = require("../services/programOfferings");
const eligibilityEvents_1 = require("../services/eligibilityEvents");
const router = (0, express_1.Router)();
router.get("/home", auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const u = req.auth;
    switch (u.role) {
        case "learner":
            res.json({
                role: u.role,
                title: "Your learning hub",
                summary: u.organizationName != null
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
            const pendingRows = orgId != null ? yield (0, learnerEligibility_1.listPendingForOrganization)(orgId) : [];
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
                summary: `Signed in under ${(_a = u.organizationName) !== null && _a !== void 0 ? _a : "your organization"}.`,
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
                summary: `Signed in as ${(_b = u.organizationName) !== null && _b !== void 0 ? _b : "your institution"}. Manage catalog visibility and learner referrals.`,
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
}));
router.get("/learners/me/providers", auth_1.authenticate, (0, auth_1.requireRoles)("learner"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const u = req.auth;
    const providers = yield (0, providers_1.getProvidersForAuthLearner)(u.id);
    res.json(providers);
}));
router.get("/learners/eligibility/stream", auth_1.authenticate, (0, auth_1.requireRoles)("learner"), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const u = _req.auth;
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const remove = (0, eligibilityEvents_1.addLearnerEligibilitySseClient)(res, u.id);
    const keepAlive = setInterval(() => (0, eligibilityEvents_1.publishEligibilityPing)(), 25000);
    res.on("close", () => {
        clearInterval(keepAlive);
        remove();
    });
}));
router.get("/employer/eligibility/stream", auth_1.authenticate, (0, auth_1.requireRoles)("employer"), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const u = _req.auth;
    const orgId = u.organizationId;
    if (orgId == null) {
        res.status(403).json({ error: "Your employer account is not linked to an organization." });
        return;
    }
    res.status(200);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    const remove = (0, eligibilityEvents_1.addEmployerEligibilitySseClient)(res, orgId);
    const keepAlive = setInterval(() => (0, eligibilityEvents_1.publishEligibilityPing)(), 25000);
    res.on("close", () => {
        clearInterval(keepAlive);
        remove();
    });
}));
router.get("/learners/program-offerings", auth_1.authenticate, (0, auth_1.requireRoles)("learner"), (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rows = yield (0, programOfferings_1.listProgramOfferingsWithProviders)();
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
}));
router.post("/learners/eligibility-requests", auth_1.authenticate, (0, auth_1.requireRoles)("learner"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const u = req.auth;
    if (u.organizationId == null) {
        res.status(400).json({ error: "Your account is not linked to an employer. You cannot check eligibility yet." });
        return;
    }
    const providerId = Number(req.body.providerId);
    if (!Number.isFinite(providerId) || providerId <= 0) {
        res.status(400).json({ error: "Valid providerId is required" });
        return;
    }
    const outcome = yield (0, learnerEligibility_1.requestEligibilityForProvider)(u.id, providerId);
    if (outcome === "already_pending") {
        res.status(409).json({ error: "You already have a pending eligibility request for this provider." });
        return;
    }
    if (outcome === "already_eligible") {
        res.status(409).json({ error: "You are already marked eligible for this provider." });
        return;
    }
    const orgId = u.organizationId;
    const submissionId = (_a = (yield (0, learnerEligibility_1.getSubmissionIdForLearnerAndProvider)(u.id, providerId))) !== null && _a !== void 0 ? _a : undefined;
    (0, eligibilityEvents_1.publishEligibilityEvent)({
        action: outcome === "created" ? "submission_created" : "submission_resubmitted",
        organizationId: orgId,
        learnerAccountId: u.id,
        submissionId,
    });
    res.status(outcome === "created" ? 201 : 200).json({ ok: true, outcome });
}));
router.post("/employer/eligibility/:id/approve", auth_1.authenticate, (0, auth_1.requireRoles)("employer"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const u = req.auth;
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
    const result = yield (0, learnerEligibility_1.setEligibilityDecision)(id, orgId, "approve");
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
    const learnerAccountIdApprove = (_a = (yield (0, learnerEligibility_1.getLearnerAccountIdForSubmission)(id))) !== null && _a !== void 0 ? _a : 0;
    if (learnerAccountIdApprove) {
        (0, eligibilityEvents_1.publishEligibilityEvent)({
            action: "approved",
            organizationId: orgId,
            learnerAccountId: learnerAccountIdApprove,
            submissionId: id,
        });
    }
    res.json({ ok: true });
}));
router.post("/employer/eligibility/:id/reject", auth_1.authenticate, (0, auth_1.requireRoles)("employer"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const u = req.auth;
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
    const result = yield (0, learnerEligibility_1.setEligibilityDecision)(id, orgId, "reject");
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
    const learnerAccountId = (_a = (yield (0, learnerEligibility_1.getLearnerAccountIdForSubmission)(id))) !== null && _a !== void 0 ? _a : 0;
    if (learnerAccountId) {
        (0, eligibilityEvents_1.publishEligibilityEvent)({
            action: "rejected",
            organizationId: orgId,
            learnerAccountId,
            submissionId: id,
        });
    }
    res.json({ ok: true });
}));
exports.default = router;
