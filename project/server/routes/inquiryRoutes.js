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
const inquiryNotifications_1 = require("../mail/inquiryNotifications");
const inquiries_1 = require("../services/inquiries");
const inquiryEvents_1 = require("../services/inquiryEvents");
const rateLimiter_1 = require("../middleware/rateLimiter");
const router = (0, express_1.Router)();
router.post("/employer", rateLimiter_1.inquiryLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const b = req.body;
    if (!b.organizationLegalName ||
        !b.contactFirstName ||
        !b.contactLastName ||
        !b.email ||
        !b.phone ||
        !b.state) {
        res.status(400).json({ error: "Missing required employer inquiry fields" });
        return;
    }
    const input = {
        organizationLegalName: String(b.organizationLegalName).trim(),
        contactFirstName: String(b.contactFirstName).trim(),
        contactLastName: String(b.contactLastName).trim(),
        email: String(b.email).trim(),
        phone: String(b.phone).trim(),
        state: String(b.state).trim(),
        approximateEmployees: b.approximateEmployees ? String(b.approximateEmployees) : undefined,
        message: b.message ? String(b.message) : undefined,
    };
    try {
        const id = yield (0, inquiries_1.insertEmployerInquiry)(input);
        console.info(`[employer inquiry] id=${id} org=${input.organizationLegalName} email=${input.email}`);
        (0, inquiryEvents_1.publishInquiryEvent)({ kind: "employer", action: "created", id });
        void (0, inquiryNotifications_1.notifyAdminsEmployerInquiry)(id, input).catch((err) => console.error("[mail] employer inquiry notification failed:", err));
        res.status(201).json({ id, message: "Thank you. A Workforce Cliff representative will follow up." });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Could not save inquiry" });
    }
}));
router.post("/education-provider", rateLimiter_1.inquiryLimiter, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const b = req.body;
    if (!b.institutionName || !b.contactName || !b.email || !b.phone || !b.state) {
        res.status(400).json({ error: "Missing required education provider inquiry fields" });
        return;
    }
    const input = {
        institutionName: String(b.institutionName).trim(),
        contactName: String(b.contactName).trim(),
        email: String(b.email).trim(),
        phone: String(b.phone).trim(),
        state: String(b.state).trim(),
        website: b.website ? String(b.website) : undefined,
        programsSummary: b.programsSummary ? String(b.programsSummary) : undefined,
        message: b.message ? String(b.message) : undefined,
    };
    try {
        const id = yield (0, inquiries_1.insertEducationProviderInquiry)(input);
        console.info(`[provider inquiry] id=${id} institution=${input.institutionName} email=${input.email}`);
        (0, inquiryEvents_1.publishInquiryEvent)({ kind: "education_provider", action: "created", id });
        void (0, inquiryNotifications_1.notifyAdminsEducationProviderInquiry)(id, input).catch((err) => console.error("[mail] education provider inquiry notification failed:", err));
        res.status(201).json({ id, message: "Thank you. Our partnerships team will be in touch." });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ error: "Could not save inquiry" });
    }
}));
exports.default = router;
