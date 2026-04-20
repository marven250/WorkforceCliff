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
const password_1 = require("../auth/password");
const tokens_1 = require("../auth/tokens");
const auth_1 = require("../middleware/auth");
const rateLimiter_1 = require("../middleware/rateLimiter");
const authAccounts_1 = require("../services/authAccounts");
const organizations_1 = require("../services/organizations");
const router = (0, express_1.Router)();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
router.post("/register", rateLimiter_1.authLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const body = req.body;
    if (!(body === null || body === void 0 ? void 0 : body.email) ||
        !(body === null || body === void 0 ? void 0 : body.password) ||
        !(body === null || body === void 0 ? void 0 : body.firstName) ||
        !(body === null || body === void 0 ? void 0 : body.lastName) ||
        !(body === null || body === void 0 ? void 0 : body.phone) ||
        !(body === null || body === void 0 ? void 0 : body.state) ||
        !((_a = body === null || body === void 0 ? void 0 : body.employerTenantSlug) === null || _a === void 0 ? void 0 : _a.trim())) {
        res.status(400).json({ error: "Missing required fields" });
        return;
    }
    const org = yield (0, organizations_1.findOrganizationBySlug)(body.employerTenantSlug.trim());
    if (!org) {
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
    const existing = yield (0, authAccounts_1.findAccountByEmail)(body.email);
    if (existing) {
        res.status(409).json({ error: "An account already exists with this email" });
        return;
    }
    try {
        const passwordHash = yield (0, password_1.hashPassword)(body.password);
        const user = yield (0, authAccounts_1.createLearnerAccount)({
            email: body.email.trim(),
            passwordHash,
            firstName: body.firstName.trim(),
            lastName: body.lastName.trim(),
            phone: body.phone.trim(),
            state: body.state.trim(),
            organizationName: org.name,
            organizationId: org.id,
        });
        const token = (0, tokens_1.signAccessToken)({ sub: user.id, email: user.email, role: user.role });
        res.status(201).json({ token, user });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Registration failed" });
    }
}));
router.post("/login", rateLimiter_1.authLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    if (!(body === null || body === void 0 ? void 0 : body.email) || !(body === null || body === void 0 ? void 0 : body.password)) {
        res.status(400).json({ error: "Email and password are required" });
        return;
    }
    const row = yield (0, authAccounts_1.findAccountByEmail)(body.email.trim());
    if (!row) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
    }
    const ok = yield (0, password_1.verifyPassword)(body.password, row.password_hash);
    if (!ok) {
        res.status(401).json({ error: "Invalid email or password" });
        return;
    }
    const user = yield (0, authAccounts_1.findAccountById)(row.id);
    if (!user) {
        res.status(500).json({ error: "Account lookup failed" });
        return;
    }
    if (body.tenantPortal === true) {
        if (user.role !== "learner" && user.role !== "employer") {
            res.status(403).json({
                error: "This employer portal sign-in is only for learners and employer administrators. Education providers and platform staff should use the appropriate sign-in page.",
            });
            return;
        }
    }
    const token = (0, tokens_1.signAccessToken)({ sub: user.id, email: user.email, role: user.role });
    res.json({ token, user });
}));
router.get("/me", auth_1.authenticate, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const u = req.auth;
    const fresh = yield (0, authAccounts_1.findAccountById)(u.id);
    if (!fresh) {
        res.status(401).json({ error: "Account not found" });
        return;
    }
    res.json({ user: fresh });
}));
exports.default = router;
