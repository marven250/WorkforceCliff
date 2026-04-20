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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseReady = exports.db = void 0;
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = require("node:fs");
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const password_1 = require("./auth/password");
const tenants_1 = require("../shared/tenants");
function shouldResetDb() {
    var _a;
    const raw = (_a = process.env.RESET_DB) === null || _a === void 0 ? void 0 : _a.trim();
    if (raw != null && raw !== "") {
        return raw === "1" || raw.toLowerCase() === "true";
    }
    // Option A: default to reset outside production.
    return process.env.NODE_ENV !== "production";
}
function resetDbFile(dbFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        yield node_fs_1.promises.mkdir(node_path_1.default.dirname(dbFilePath), { recursive: true });
        yield node_fs_1.promises.rm(dbFilePath, { force: true });
    });
}
function createSchema(db) {
    return __awaiter(this, void 0, void 0, function* () {
        yield db.exec(`PRAGMA foreign_keys = ON`);
        yield db.exec(`
    CREATE TABLE organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
        yield db.exec(`
    CREATE TABLE providers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
        yield db.exec(`
    CREATE TABLE provider_integrations (
      id INTEGER PRIMARY KEY,
      provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      integration_type TEXT NOT NULL DEFAULT 'none' CHECK (integration_type IN ('none', 'redirect', 'sso')),
      redirect_url TEXT,
      is_enabled INTEGER NOT NULL DEFAULT 0
    );
  `);
        yield db.exec(`
    CREATE TABLE provider_program_offerings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      credential TEXT,
      modality TEXT,
      duration_summary TEXT,
      summary TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);
        yield db.exec(`
    CREATE TABLE auth_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('learner','employer','education_provider','platform_admin')),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      organization_name TEXT,
      organization_id INTEGER REFERENCES organizations(id),
      phone TEXT,
      state TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
        yield db.exec(`
    CREATE TABLE employer_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_legal_name TEXT NOT NULL,
      contact_first_name TEXT NOT NULL,
      contact_last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      state TEXT NOT NULL,
      approximate_employees TEXT,
      message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      claimed_by_user_id INTEGER REFERENCES auth_accounts(id),
      claimed_at TEXT,
      completed_at TEXT
    );
  `);
        yield db.exec(`
    CREATE TABLE education_provider_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      state TEXT NOT NULL,
      website TEXT,
      programs_summary TEXT,
      message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      claimed_by_user_id INTEGER REFERENCES auth_accounts(id),
      claimed_at TEXT,
      completed_at TEXT
    );
  `);
        yield db.exec(`
    CREATE TABLE learner_eligibility_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learner_account_id INTEGER NOT NULL REFERENCES auth_accounts(id),
      provider_id INTEGER NOT NULL REFERENCES providers(id),
      status TEXT NOT NULL CHECK (status IN ('pending','eligible','ineligible')) DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      decided_at TEXT,
      UNIQUE(learner_account_id, provider_id)
    );
  `);
        yield db.exec(`CREATE INDEX idx_auth_accounts_organization_id ON auth_accounts(organization_id)`);
        yield db.exec(`CREATE INDEX idx_les_learner ON learner_eligibility_submissions(learner_account_id)`);
        yield db.exec(`CREATE INDEX idx_les_status ON learner_eligibility_submissions(status)`);
    });
}
function seedOrganizations(db) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const t of tenants_1.WORKFORCE_TENANTS) {
            yield db.run(`INSERT INTO organizations (slug, name) VALUES (?, ?)`, t.slug, t.name);
        }
    });
}
function seedProvidersAndIntegrations(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const providerSeeds = [
            [1, "Strayer University"],
            [2, "Capella University"],
            [3, "Torrens University Australia"],
            [4, "Sophia Learning"],
        ];
        for (const [id, name] of providerSeeds) {
            yield db.run(`INSERT INTO providers (id, name) VALUES (?, ?)`, id, name);
        }
        const integrationSeeds = [
            [1, 1, "redirect", "https://www.strayer.edu/", 1],
            [2, 2, "redirect", "https://www.capella.edu/", 1],
            [3, 3, "redirect", "https://www.torrens.edu.au/", 0],
            [4, 4, "redirect", "https://www.sophia.org/", 1],
        ];
        for (const [id, providerId, integrationType, redirectUrl, isEnabled] of integrationSeeds) {
            yield db.run(`INSERT INTO provider_integrations (id, provider_id, integration_type, redirect_url, is_enabled)
       VALUES (?, ?, ?, ?, ?)`, id, providerId, integrationType, redirectUrl, isEnabled);
        }
    });
}
function seedProgramOfferings(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const seeds = [
            [
                1,
                1,
                "Bachelor of Science in Business Administration",
                "Bachelor's",
                "Online",
                "120 credits",
                "Foundational business curriculum with concentrations in leadership, marketing, and operations.",
                1,
            ],
            [
                2,
                1,
                "Associate of Applied Science in Information Technology",
                "Associate",
                "Online",
                "60 credits",
                "Hands-on IT skills including networking, security fundamentals, and systems support.",
                2,
            ],
            [
                3,
                2,
                "Master of Business Administration (MBA)",
                "Master's",
                "FlexPath®",
                "45–50 credits",
                "Self-paced competency-based MBA designed for working professionals balancing career and study.",
                1,
            ],
            [
                4,
                2,
                "Bachelor of Science in Nursing (RN-to-BSN)",
                "Bachelor's",
                "Online",
                "90 quarter credits",
                "Build on RN experience with evidence-based practice, community health, and care coordination.",
                2,
            ],
            [
                5,
                3,
                "Bachelor of Nursing",
                "Bachelor's",
                "Blended",
                "3 years full-time",
                "Clinical placements with a global health curriculum and strong employer partnerships.",
                1,
            ],
            [
                6,
                3,
                "Master of Public Health",
                "Master's",
                "Online",
                "2 years",
                "Population health, epidemiology, and health promotion for graduates seeking impact at scale.",
                2,
            ],
            [
                7,
                4,
                "Introduction to Statistics",
                "ACE-recommended credit",
                "Self-paced",
                "1 course",
                "Foundational statistics for business and STEM pathways; transfer-friendly design.",
                1,
            ],
            [
                8,
                4,
                "Environmental Science",
                "ACE-recommended credit",
                "Self-paced",
                "1 course",
                "Explore sustainability, ecosystems, and human impact with applied learning checkpoints.",
                2,
            ],
        ];
        for (const [id, providerId, title, credential, modality, durationSummary, summary, sortOrder] of seeds) {
            yield db.run(`INSERT INTO provider_program_offerings (id, provider_id, title, credential, modality, duration_summary, summary, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, id, providerId, title, credential, modality, durationSummary, summary, sortOrder);
        }
    });
}
function seedDemoAuthAccounts(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const password = "Password123!";
        const hash = yield (0, password_1.hashPassword)(password);
        const summitSlug = "summit-hospitality-group";
        const summit = yield db.get(`SELECT id FROM organizations WHERE slug = ?`, summitSlug);
        if (!summit)
            throw new Error(`Missing seed organization: ${summitSlug}`);
        const summitOrgId = summit.id;
        const seeds = [
            {
                email: "employer.demo@workforcecliff.local",
                role: "employer",
                first: "Morgan",
                last: "Reyes",
                org: "Summit Hospitality Group",
                phone: "5550100",
                state: "NV",
                organizationId: summitOrgId,
            },
            {
                email: "learner.demo@workforcecliff.local",
                role: "learner",
                first: "Alex",
                last: "Rivera",
                org: "Summit Hospitality Group",
                phone: "5550200",
                state: "NV",
                organizationId: summitOrgId,
            },
            {
                email: "partner.demo@workforcecliff.local",
                role: "education_provider",
                first: "Dr. Sam",
                last: "Okonkwo",
                org: "Ridgeline College of Health Professions",
                phone: "5550101",
                state: "TX",
                organizationId: null,
            },
            {
                email: "marven.mathelier@hackbrightacademy.com",
                role: "platform_admin",
                first: "Marven",
                last: "Mathelier",
                org: "Hackbright Academy",
                phone: "5550102",
                state: "CA",
                organizationId: null,
            },
            {
                email: "admin.demo@workforcecliff.local",
                role: "platform_admin",
                first: "Platform",
                last: "Admin",
                org: "Workforce Cliff",
                phone: "5550199",
                state: "DC",
                organizationId: null,
            },
        ];
        for (const s of seeds) {
            yield db.run(`INSERT INTO auth_accounts (email, password_hash, role, first_name, last_name, organization_name, organization_id, phone, state)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, s.email, hash, s.role, s.first, s.last, s.org, s.organizationId, s.phone, s.state);
        }
    });
}
function seedDemoLearnerEligibility(db) {
    return __awaiter(this, void 0, void 0, function* () {
        const row = yield db.get(`SELECT id FROM auth_accounts WHERE lower(email) = lower('learner.demo@workforcecliff.local')`);
        if (!row)
            return;
        for (const providerId of [1, 2]) {
            yield db.run(`INSERT INTO learner_eligibility_submissions (learner_account_id, provider_id, status)
       VALUES (?, ?, 'pending')`, row.id, providerId);
        }
    });
}
exports.databaseReady = (() => __awaiter(void 0, void 0, void 0, function* () {
    const dbFilePath = node_path_1.default.resolve(process.cwd(), "db", "assessment.db");
    if (shouldResetDb()) {
        yield resetDbFile(dbFilePath);
    }
    else {
        yield node_fs_1.promises.mkdir(node_path_1.default.dirname(dbFilePath), { recursive: true });
    }
    exports.db = yield (0, sqlite_1.open)({
        filename: dbFilePath,
        driver: sqlite3_1.default.Database,
    });
    yield exports.db.exec("BEGIN");
    try {
        yield createSchema(exports.db);
        yield seedOrganizations(exports.db);
        yield seedProvidersAndIntegrations(exports.db);
        yield seedProgramOfferings(exports.db);
        yield seedDemoAuthAccounts(exports.db);
        yield seedDemoLearnerEligibility(exports.db);
        yield exports.db.exec("COMMIT");
    }
    catch (e) {
        yield exports.db.exec("ROLLBACK");
        throw e;
    }
}))();
