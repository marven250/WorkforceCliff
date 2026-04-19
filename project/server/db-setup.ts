import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { hashPassword } from "./auth/password";
import { WORKFORCE_TENANTS } from "../shared/tenants";

/** Education provider catalog + integration metadata (runs before auth tables that FK to `providers`). */
async function applyProviderCatalogSchema(database: Database<sqlite3.Database, sqlite3.Statement>) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS providers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
  await database.exec(`
    CREATE TABLE IF NOT EXISTS provider_integrations (
      id INTEGER PRIMARY KEY,
      provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      integration_type TEXT NOT NULL DEFAULT 'none' CHECK (integration_type IN ('none', 'redirect', 'sso')),
      redirect_url TEXT,
      is_enabled INTEGER NOT NULL DEFAULT 0
    );
  `);
  await database.exec(`
    CREATE TABLE IF NOT EXISTS provider_program_offerings (
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

  const providerSeeds: Array<[number, string]> = [
    [1, "Strayer University"],
    [2, "Capella University"],
    [3, "Torrens University Australia"],
    [4, "Sophia Learning"],
  ];
  for (const [id, name] of providerSeeds) {
    await database.run(`INSERT OR IGNORE INTO providers (id, name) VALUES (?, ?)`, id, name);
  }

  const integrationSeeds: Array<[number, number, string, string, number]> = [
    [1, 1, "redirect", "https://www.strayer.edu/", 1],
    [2, 2, "redirect", "https://www.capella.edu/", 1],
    [3, 3, "redirect", "https://www.torrens.edu.au/", 0],
    [4, 4, "redirect", "https://www.sophia.org/", 1],
  ];
  for (const [id, providerId, integrationType, redirectUrl, isEnabled] of integrationSeeds) {
    await database.run(
      `INSERT OR IGNORE INTO provider_integrations (id, provider_id, integration_type, redirect_url, is_enabled)
       VALUES (?, ?, ?, ?, ?)`,
      id,
      providerId,
      integrationType,
      redirectUrl,
      isEnabled,
    );
  }

  await seedProgramOfferings(database);
}

async function seedProgramOfferings(database: Database<sqlite3.Database, sqlite3.Statement>) {
  type Row = [number, number, string, string, string, string, string, number];
  const seeds: Row[] = [
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
    await database.run(
      `INSERT OR IGNORE INTO provider_program_offerings (id, provider_id, title, credential, modality, duration_summary, summary, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      providerId,
      title,
      credential,
      modality,
      durationSummary,
      summary,
      sortOrder,
    );
  }
}

/** Employer tenants as first-class rows (FK from accounts and implied by learner eligibility via learner org). */
async function applyOrganizationsSchema(database: Database<sqlite3.Database, sqlite3.Statement>) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  for (const t of WORKFORCE_TENANTS) {
    await database.run(`INSERT OR IGNORE INTO organizations (slug, name) VALUES (?, ?)`, t.slug, t.name);
  }
}

async function ensureAuthAccountsTable(database: Database<sqlite3.Database, sqlite3.Statement>) {
  const row = await database.get<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='auth_accounts'`,
  );
  if (!row) {
    await database.exec(`
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
    return;
  }
  await migrateAuthAccountsOrganizationColumn(database);
}

async function migrateAuthAccountsOrganizationColumn(database: Database<sqlite3.Database, sqlite3.Statement>) {
  let cols = (await database.all(`PRAGMA table_info(auth_accounts)`)) as Array<{ name: string }>;
  let names = new Set(cols.map((c) => c.name));
  if (!names.has("organization_id")) {
    await database.exec(
      `ALTER TABLE auth_accounts ADD COLUMN organization_id INTEGER REFERENCES organizations(id)`,
    );
    cols = (await database.all(`PRAGMA table_info(auth_accounts)`)) as Array<{ name: string }>;
    names = new Set(cols.map((c) => c.name));
  }
  if (names.has("employer_tenant_slug")) {
    await database.exec(`
      UPDATE auth_accounts
      SET organization_id = (
        SELECT o.id FROM organizations o WHERE lower(o.slug) = lower(auth_accounts.employer_tenant_slug)
      )
      WHERE employer_tenant_slug IS NOT NULL
    `);
    try {
      await database.exec(`ALTER TABLE auth_accounts DROP COLUMN employer_tenant_slug`);
    } catch (e) {
      console.warn("[db] Could not DROP COLUMN employer_tenant_slug (needs SQLite 3.35+).", e);
    }
  }
}

async function ensureEmployerInquiriesTable(database: Database<sqlite3.Database, sqlite3.Statement>) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS employer_inquiries (
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
}

async function ensureEducationProviderInquiriesTable(database: Database<sqlite3.Database, sqlite3.Statement>) {
  await database.exec(`
    CREATE TABLE IF NOT EXISTS education_provider_inquiries (
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
}

async function ensureLearnerEligibilitySubmissionsTable(database: Database<sqlite3.Database, sqlite3.Statement>) {
  const row = await database.get<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='learner_eligibility_submissions'`,
  );
  if (!row) {
    await database.exec(`
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
    return;
  }
  const cols = (await database.all(`PRAGMA table_info(learner_eligibility_submissions)`)) as Array<{ name: string }>;
  const names = new Set(cols.map((c) => c.name));
  if (!names.has("employer_tenant_slug")) {
    return;
  }
  await database.exec(`DROP TABLE IF EXISTS _les_rebuild`);
  await database.exec(`
    CREATE TABLE _les_rebuild (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      learner_account_id INTEGER NOT NULL REFERENCES auth_accounts(id),
      provider_id INTEGER NOT NULL REFERENCES providers(id),
      status TEXT NOT NULL CHECK (status IN ('pending','eligible','ineligible')) DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      decided_at TEXT,
      UNIQUE(learner_account_id, provider_id)
    );
  `);
  await database.exec(`
    INSERT INTO _les_rebuild (id, learner_account_id, provider_id, status, created_at, decided_at)
    SELECT id, learner_account_id, provider_id, status, created_at, decided_at
    FROM learner_eligibility_submissions
  `);
  await database.exec(`DROP TABLE learner_eligibility_submissions`);
  await database.exec(`ALTER TABLE _les_rebuild RENAME TO learner_eligibility_submissions`);
}

async function migrateInquiryClaimColumns(database: Database<sqlite3.Database, sqlite3.Statement>) {
  for (const table of ["employer_inquiries", "education_provider_inquiries"] as const) {
    const cols = (await database.all(`PRAGMA table_info(${table})`)) as Array<{ name: string }>;
    if (!cols.some((c) => c.name === "claimed_by_user_id")) {
      await database.exec(
        `ALTER TABLE ${table} ADD COLUMN claimed_by_user_id INTEGER REFERENCES auth_accounts(id)`,
      );
    }
    if (!cols.some((c) => c.name === "claimed_at")) {
      await database.exec(`ALTER TABLE ${table} ADD COLUMN claimed_at TEXT`);
    }
    if (!cols.some((c) => c.name === "completed_at")) {
      await database.exec(`ALTER TABLE ${table} ADD COLUMN completed_at TEXT`);
    }
  }
}

async function createAuthAndEligibilityIndexes(database: Database<sqlite3.Database, sqlite3.Statement>) {
  await database.exec(`CREATE INDEX IF NOT EXISTS idx_auth_accounts_organization_id ON auth_accounts(organization_id)`);
  await database.exec(
    `CREATE INDEX IF NOT EXISTS idx_les_learner ON learner_eligibility_submissions(learner_account_id)`,
  );
  await database.exec(`CREATE INDEX IF NOT EXISTS idx_les_status ON learner_eligibility_submissions(status)`);
}

async function seedDemoAuthAccounts(database: Database<sqlite3.Database, sqlite3.Statement>) {
  const password = "Password123!";
  const hash = await hashPassword(password);
  const summitSlug = "summit-hospitality-group";
  const summit = await database.get<{ id: number }>(`SELECT id FROM organizations WHERE slug = ?`, summitSlug);
  if (!summit) {
    throw new Error(`Demo seed requires organization slug "${summitSlug}"`);
  }
  const summitOrgId = summit.id;

  const seeds: Array<{
    email: string;
    role: "employer" | "education_provider" | "platform_admin" | "learner";
    first: string;
    last: string;
    org: string | null;
    phone: string;
    state: string;
    organizationId: number | null;
  }> = [
    {
      email: "Morgan.Reyes@summithospitalitygroup.com",
      role: "employer",
      first: "Morgan",
      last: "Reyes",
      org: "Summit Hospitality Group",
      phone: "561-444-1234",
      state: "FL",
      organizationId: summitOrgId,
    },
    {
      email: "Alex.Rivera@summithospitalitygroup.com",
      role: "learner",
      first: "Alex",
      last: "Rivera",
      org: "Summit Hospitality Group",
      phone: "508-222-3333",
      state: "MA",
      organizationId: summitOrgId,
    },
    {
      email: "Brandon.Henderson@summithospitalitygroup.com",
      role: "learner",
      first: "Brandon",
      last: "Henderson",
      org: "Summit Hospitality Group",
      phone: "614-222-4444",
      state: "OH",
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
      email: "marven.mathelier@workforcecliff.com",
      role: "platform_admin",
      first: "Marven",
      last: "Mathelier",
      org: "Workforce Cliff",
      phone: "760-222-5555",
      state: "NM",
      organizationId: null,
    },
    {
      email: "tyler.khan@workforcecliff.com",
      role: "platform_admin",
      first: "Tyler",
      last: "Khan",
      org: "Workforce Cliff",
      phone: "317-333-6666",
      state: "IN",
      organizationId: null,
    },
  ];

  for (const s of seeds) {
    await database.run(
      `INSERT OR IGNORE INTO auth_accounts (email, password_hash, role, first_name, last_name, organization_name, organization_id, phone, state)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      s.email,
      hash,
      s.role,
      s.first,
      s.last,
      s.org,
      s.organizationId,
      s.phone,
      s.state,
    );
  }
  await database.run(
    `UPDATE auth_accounts SET organization_id = ?, organization_name = COALESCE(organization_name, 'Summit Hospitality Group')
     WHERE lower(email) = lower('employer.demo@workforcecliff.local') AND organization_id IS NULL`,
    summitOrgId,
  );
  await database.run(
    `UPDATE auth_accounts SET organization_id = ?, organization_name = COALESCE(organization_name, 'Summit Hospitality Group')
     WHERE lower(email) = lower('learner.demo@workforcecliff.local') AND organization_id IS NULL`,
    summitOrgId,
  );
}

async function seedDemoLearnerEligibility(database: Database<sqlite3.Database, sqlite3.Statement>) {
  const row = await database.get<{ id: number }>(
    `SELECT id FROM auth_accounts WHERE lower(email) = lower('learner.demo@workforcecliff.local')`,
  );
  if (!row) return;
  for (const providerId of [1, 2]) {
    await database.run(
      `INSERT OR IGNORE INTO learner_eligibility_submissions (learner_account_id, provider_id, status)
       VALUES (?, ?, 'pending')`,
      row.id,
      providerId,
    );
  }
}

export let db: Database<sqlite3.Database, sqlite3.Statement>;

export const databaseReady: Promise<void> = (async () => {
  const dbFilePath = "./db/assessment.db";

  db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });

  await db.exec(`PRAGMA foreign_keys = ON`);

  await applyProviderCatalogSchema(db);
  await applyOrganizationsSchema(db);
  await ensureAuthAccountsTable(db);
  await ensureEmployerInquiriesTable(db);
  await ensureEducationProviderInquiriesTable(db);
  await ensureLearnerEligibilitySubmissionsTable(db);
  await migrateInquiryClaimColumns(db);
  await createAuthAndEligibilityIndexes(db);
  await seedDemoAuthAccounts(db);
  await seedDemoLearnerEligibility(db);
})();

