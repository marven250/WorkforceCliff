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
exports.listPendingForOrganization = listPendingForOrganization;
exports.setEligibilityDecision = setEligibilityDecision;
exports.requestEligibilityForProvider = requestEligibilityForProvider;
exports.getSubmissionIdForLearnerAndProvider = getSubmissionIdForLearnerAndProvider;
exports.getLearnerAccountIdForSubmission = getLearnerAccountIdForSubmission;
const db_setup_1 = require("../db-setup");
function listPendingForOrganization(organizationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = (yield db_setup_1.db.all(`SELECT les.id, les.provider_id, p.name AS provider_name, les.learner_account_id,
            a.email AS learner_email, a.first_name AS learner_first_name, a.last_name AS learner_last_name,
            les.created_at
     FROM learner_eligibility_submissions les
     JOIN auth_accounts a ON a.id = les.learner_account_id
     JOIN providers p ON p.id = les.provider_id
     WHERE les.status = 'pending' AND a.organization_id = ?
     ORDER BY les.id ASC`, organizationId));
        return rows;
    });
}
function setEligibilityDecision(submissionId, employerOrganizationId, decision) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const row = yield db_setup_1.db.get(`SELECT les.status, learner.organization_id AS learner_org_id
     FROM learner_eligibility_submissions les
     JOIN auth_accounts learner ON learner.id = les.learner_account_id
     WHERE les.id = ?`, submissionId);
        if (!row)
            return "not_found";
        if (row.learner_org_id !== employerOrganizationId)
            return "wrong_organization";
        if (row.status !== "pending")
            return "not_pending";
        const next = decision === "approve" ? "eligible" : "ineligible";
        const r = yield db_setup_1.db.run(`UPDATE learner_eligibility_submissions
     SET status = ?, decided_at = datetime('now')
     WHERE id = ?
       AND status = 'pending'
       AND (SELECT organization_id FROM auth_accounts WHERE id = learner_eligibility_submissions.learner_account_id) = ?`, next, submissionId, employerOrganizationId);
        return ((_a = r.changes) !== null && _a !== void 0 ? _a : 0) > 0 ? "ok" : "not_pending";
    });
}
function requestEligibilityForProvider(learnerAccountId, providerId) {
    return __awaiter(this, void 0, void 0, function* () {
        const existing = yield db_setup_1.db.get(`SELECT status FROM learner_eligibility_submissions WHERE learner_account_id = ? AND provider_id = ?`, learnerAccountId, providerId);
        if (!existing) {
            yield db_setup_1.db.run(`INSERT INTO learner_eligibility_submissions (learner_account_id, provider_id, status)
       VALUES (?, ?, 'pending')`, learnerAccountId, providerId);
            return "created";
        }
        if (existing.status === "pending")
            return "already_pending";
        if (existing.status === "eligible")
            return "already_eligible";
        yield db_setup_1.db.run(`UPDATE learner_eligibility_submissions
     SET status = 'pending', decided_at = NULL, created_at = datetime('now')
     WHERE learner_account_id = ? AND provider_id = ?`, learnerAccountId, providerId);
        return "resubmitted";
    });
}
function getSubmissionIdForLearnerAndProvider(learnerAccountId, providerId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const row = yield db_setup_1.db.get(`SELECT id FROM learner_eligibility_submissions WHERE learner_account_id = ? AND provider_id = ?`, learnerAccountId, providerId);
        return (_a = row === null || row === void 0 ? void 0 : row.id) !== null && _a !== void 0 ? _a : null;
    });
}
function getLearnerAccountIdForSubmission(submissionId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const row = yield db_setup_1.db.get(`SELECT learner_account_id FROM learner_eligibility_submissions WHERE id = ?`, submissionId);
        return (_a = row === null || row === void 0 ? void 0 : row.learner_account_id) !== null && _a !== void 0 ? _a : null;
    });
}
