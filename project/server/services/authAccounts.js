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
exports.findAccountByEmail = findAccountByEmail;
exports.findAccountById = findAccountById;
exports.createLearnerAccount = createLearnerAccount;
exports.listPlatformAdminEmails = listPlatformAdminEmails;
const db_setup_1 = require("../db-setup");
function rowToPublic(row) {
    var _a, _b;
    return {
        id: row.id,
        email: row.email,
        role: row.role,
        firstName: row.first_name,
        lastName: row.last_name,
        organizationName: row.organization_name,
        organizationId: (_a = row.organization_id) !== null && _a !== void 0 ? _a : null,
        employerTenantSlug: (_b = row.organization_slug) !== null && _b !== void 0 ? _b : null,
        phone: row.phone,
        state: row.state,
    };
}
const accountSelect = `
  SELECT a.id, a.email, a.password_hash, a.role, a.first_name, a.last_name, a.organization_name,
         a.organization_id, o.slug AS organization_slug, a.phone, a.state
  FROM auth_accounts a
  LEFT JOIN organizations o ON o.id = a.organization_id
`;
function findAccountByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        return db_setup_1.db.get(`${accountSelect} WHERE lower(a.email) = lower(?)`, email);
    });
}
function findAccountById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const row = yield db_setup_1.db.get(`${accountSelect} WHERE a.id = ?`, id);
        return row ? rowToPublic(row) : null;
    });
}
function createLearnerAccount(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield db_setup_1.db.run(`INSERT INTO auth_accounts (email, password_hash, role, first_name, last_name, organization_name, organization_id, phone, state)
     VALUES (?, ?, 'learner', ?, ?, ?, ?, ?, ?)`, params.email, params.passwordHash, params.firstName, params.lastName, params.organizationName, params.organizationId, params.phone, params.state);
        const id = Number(result.lastID);
        const created = yield findAccountById(id);
        if (!created)
            throw new Error("Failed to read created account");
        return created;
    });
}
const emailLooksValid = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
function listPlatformAdminEmails() {
    return __awaiter(this, void 0, void 0, function* () {
        const rows = (yield db_setup_1.db.all(`SELECT email FROM auth_accounts WHERE role = 'platform_admin'`));
        const seen = new Set();
        const out = [];
        for (const r of rows) {
            const e = r.email.trim().toLowerCase();
            if (!e || !emailLooksValid(e) || seen.has(e))
                continue;
            seen.add(e);
            out.push(r.email.trim());
        }
        return out;
    });
}
