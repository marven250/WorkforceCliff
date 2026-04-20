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
exports.insertEmployerInquiry = insertEmployerInquiry;
exports.insertEducationProviderInquiry = insertEducationProviderInquiry;
exports.listEmployerInquiries = listEmployerInquiries;
exports.listEducationProviderInquiries = listEducationProviderInquiries;
exports.claimEmployerInquiry = claimEmployerInquiry;
exports.claimEducationProviderInquiry = claimEducationProviderInquiry;
exports.completeEmployerInquiry = completeEmployerInquiry;
exports.completeEducationProviderInquiry = completeEducationProviderInquiry;
const db_setup_1 = require("../db-setup");
function insertEmployerInquiry(input) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const r = yield db_setup_1.db.run(`INSERT INTO employer_inquiries (
      organization_legal_name, contact_first_name, contact_last_name, email, phone, state,
      approximate_employees, message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, input.organizationLegalName, input.contactFirstName, input.contactLastName, input.email, input.phone, input.state, (_a = input.approximateEmployees) !== null && _a !== void 0 ? _a : null, (_b = input.message) !== null && _b !== void 0 ? _b : null);
        return Number(r.lastID);
    });
}
function insertEducationProviderInquiry(input) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        const r = yield db_setup_1.db.run(`INSERT INTO education_provider_inquiries (
      institution_name, contact_name, email, phone, state, website, programs_summary, message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, input.institutionName, input.contactName, input.email, input.phone, input.state, (_a = input.website) !== null && _a !== void 0 ? _a : null, (_b = input.programsSummary) !== null && _b !== void 0 ? _b : null, (_c = input.message) !== null && _c !== void 0 ? _c : null);
        return Number(r.lastID);
    });
}
const employerSelect = `
  SELECT e.id, e.organization_legal_name, e.contact_first_name, e.contact_last_name, e.email, e.phone, e.state,
         e.approximate_employees, e.message, e.created_at,
         e.claimed_by_user_id, e.claimed_at, e.completed_at,
         a.first_name AS claimed_by_first_name, a.last_name AS claimed_by_last_name, a.email AS claimed_by_email
  FROM employer_inquiries e
  LEFT JOIN auth_accounts a ON a.id = e.claimed_by_user_id`;
const providerSelect = `
  SELECT e.id, e.institution_name, e.contact_name, e.email, e.phone, e.state, e.website, e.programs_summary,
         e.message, e.created_at,
         e.claimed_by_user_id, e.claimed_at, e.completed_at,
         a.first_name AS claimed_by_first_name, a.last_name AS claimed_by_last_name, a.email AS claimed_by_email
  FROM education_provider_inquiries e
  LEFT JOIN auth_accounts a ON a.id = e.claimed_by_user_id`;
function listEmployerInquiries(archived) {
    return __awaiter(this, void 0, void 0, function* () {
        const filter = archived ? "e.completed_at IS NOT NULL" : "e.completed_at IS NULL";
        const rows = yield db_setup_1.db.all(`${employerSelect} WHERE ${filter} ORDER BY e.id DESC`);
        return rows;
    });
}
function listEducationProviderInquiries(archived) {
    return __awaiter(this, void 0, void 0, function* () {
        const filter = archived ? "e.completed_at IS NOT NULL" : "e.completed_at IS NULL";
        const rows = yield db_setup_1.db.all(`${providerSelect} WHERE ${filter} ORDER BY e.id DESC`);
        return rows;
    });
}
function claimEmployerInquiry(inquiryId, adminUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        const row = yield db_setup_1.db.get(`SELECT claimed_by_user_id, completed_at FROM employer_inquiries WHERE id = ?`, inquiryId);
        if (!row)
            return "not_found";
        if (row.completed_at)
            return "already_completed";
        if (row.claimed_by_user_id != null && row.claimed_by_user_id !== adminUserId)
            return "taken";
        if (row.claimed_by_user_id === adminUserId)
            return "already_mine";
        const r = yield db_setup_1.db.run(`UPDATE employer_inquiries
     SET claimed_by_user_id = ?, claimed_at = datetime('now')
     WHERE id = ? AND completed_at IS NULL AND claimed_by_user_id IS NULL`, adminUserId, inquiryId);
        if (r.changes === 0)
            return "taken";
        return "claimed";
    });
}
function claimEducationProviderInquiry(inquiryId, adminUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        const row = yield db_setup_1.db.get(`SELECT claimed_by_user_id, completed_at FROM education_provider_inquiries WHERE id = ?`, inquiryId);
        if (!row)
            return "not_found";
        if (row.completed_at)
            return "already_completed";
        if (row.claimed_by_user_id != null && row.claimed_by_user_id !== adminUserId)
            return "taken";
        if (row.claimed_by_user_id === adminUserId)
            return "already_mine";
        const r = yield db_setup_1.db.run(`UPDATE education_provider_inquiries
     SET claimed_by_user_id = ?, claimed_at = datetime('now')
     WHERE id = ? AND completed_at IS NULL AND claimed_by_user_id IS NULL`, adminUserId, inquiryId);
        if (r.changes === 0)
            return "taken";
        return "claimed";
    });
}
function completeEmployerInquiry(inquiryId, adminUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        const row = yield db_setup_1.db.get(`SELECT claimed_by_user_id, completed_at FROM employer_inquiries WHERE id = ?`, inquiryId);
        if (!row)
            return "not_found";
        if (row.completed_at)
            return "already_completed";
        if (row.claimed_by_user_id == null)
            return "not_claimed";
        if (row.claimed_by_user_id !== adminUserId)
            return "wrong_claimer";
        yield db_setup_1.db.run(`UPDATE employer_inquiries SET completed_at = datetime('now') WHERE id = ? AND completed_at IS NULL`, inquiryId);
        return "ok";
    });
}
function completeEducationProviderInquiry(inquiryId, adminUserId) {
    return __awaiter(this, void 0, void 0, function* () {
        const row = yield db_setup_1.db.get(`SELECT claimed_by_user_id, completed_at FROM education_provider_inquiries WHERE id = ?`, inquiryId);
        if (!row)
            return "not_found";
        if (row.completed_at)
            return "already_completed";
        if (row.claimed_by_user_id == null)
            return "not_claimed";
        if (row.claimed_by_user_id !== adminUserId)
            return "wrong_claimer";
        yield db_setup_1.db.run(`UPDATE education_provider_inquiries SET completed_at = datetime('now') WHERE id = ? AND completed_at IS NULL`, inquiryId);
        return "ok";
    });
}
