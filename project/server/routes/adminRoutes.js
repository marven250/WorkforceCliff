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
const auth_1 = require("../middleware/auth");
const inquiries_1 = require("../services/inquiries");
const router = (0, express_1.Router)();
function mapEmployer(r) {
    var _a, _b, _c;
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
        claimedByName: r.claimed_by_first_name != null || r.claimed_by_last_name != null
            ? `${(_a = r.claimed_by_first_name) !== null && _a !== void 0 ? _a : ""} ${(_b = r.claimed_by_last_name) !== null && _b !== void 0 ? _b : ""}`.trim() || null
            : null,
        claimedByEmail: (_c = r.claimed_by_email) !== null && _c !== void 0 ? _c : null,
    };
}
function mapProvider(r) {
    var _a, _b, _c;
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
        claimedByName: r.claimed_by_first_name != null || r.claimed_by_last_name != null
            ? `${(_a = r.claimed_by_first_name) !== null && _a !== void 0 ? _a : ""} ${(_b = r.claimed_by_last_name) !== null && _b !== void 0 ? _b : ""}`.trim() || null
            : null,
        claimedByEmail: (_c = r.claimed_by_email) !== null && _c !== void 0 ? _c : null,
    };
}
router.get("/inquiries", auth_1.authenticate, (0, auth_1.requireRoles)("platform_admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const archived = req.query.scope === "archived";
    const employers = yield (0, inquiries_1.listEmployerInquiries)(archived);
    const providers = yield (0, inquiries_1.listEducationProviderInquiries)(archived);
    res.json({
        employerInquiries: employers.map(mapEmployer),
        educationProviderInquiries: providers.map(mapProvider),
    });
}));
router.post("/inquiries/employer/:id/claim", auth_1.authenticate, (0, auth_1.requireRoles)("platform_admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
        res.status(400).json({ error: "Invalid inquiry id" });
        return;
    }
    const userId = req.auth.id;
    const outcome = yield (0, inquiries_1.claimEmployerInquiry)(id, userId);
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
    res.json({ ok: true, status: outcome });
}));
router.post("/inquiries/education-provider/:id/claim", auth_1.authenticate, (0, auth_1.requireRoles)("platform_admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
        res.status(400).json({ error: "Invalid inquiry id" });
        return;
    }
    const userId = req.auth.id;
    const outcome = yield (0, inquiries_1.claimEducationProviderInquiry)(id, userId);
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
    res.json({ ok: true, status: outcome });
}));
router.post("/inquiries/employer/:id/complete", auth_1.authenticate, (0, auth_1.requireRoles)("platform_admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
        res.status(400).json({ error: "Invalid inquiry id" });
        return;
    }
    const userId = req.auth.id;
    const outcome = yield (0, inquiries_1.completeEmployerInquiry)(id, userId);
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
    res.json({ ok: true });
}));
router.post("/inquiries/education-provider/:id/complete", auth_1.authenticate, (0, auth_1.requireRoles)("platform_admin"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
        res.status(400).json({ error: "Invalid inquiry id" });
        return;
    }
    const userId = req.auth.id;
    const outcome = yield (0, inquiries_1.completeEducationProviderInquiry)(id, userId);
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
    res.json({ ok: true });
}));
exports.default = router;
