import path from "node:path";
import { promises as fs } from "node:fs";
import sqlite3 from "sqlite3";
import { open, type Database } from "sqlite";
import { hashPassword } from "./auth/password";
import { WORKFORCE_TENANTS } from "../shared/tenants";

type SqliteDb = Database<sqlite3.Database, sqlite3.Statement>;

function shouldResetDb(): boolean {
  const raw = process.env.RESET_DB?.trim();
  if (raw != null && raw !== "") {
    return raw === "1" || raw.toLowerCase() === "true";
  }
  // Option A: default to reset outside production.
  return process.env.NODE_ENV !== "production";
}

async function resetDbFile(dbFilePath: string): Promise<void> {
  await fs.mkdir(path.dirname(dbFilePath), { recursive: true });
  await fs.rm(dbFilePath, { force: true });
}

async function createSchema(db: SqliteDb): Promise<void> {
  await db.exec(`PRAGMA foreign_keys = ON`);

  await db.exec(`
    CREATE TABLE organizations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE COLLATE NOCASE,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await db.exec(`
    CREATE TABLE providers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL
    );
  `);
  await db.exec(`
    CREATE TABLE provider_integrations (
      id INTEGER PRIMARY KEY,
      provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      integration_type TEXT NOT NULL DEFAULT 'none' CHECK (integration_type IN ('none', 'redirect', 'sso')),
      redirect_url TEXT,
      is_enabled INTEGER NOT NULL DEFAULT 0
    );
  `);
  await db.exec(`
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

  await db.exec(`
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

  await db.exec(`
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
  await db.exec(`
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

  await db.exec(`
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

  await db.exec(`CREATE INDEX idx_auth_accounts_organization_id ON auth_accounts(organization_id)`);
  await db.exec(`CREATE INDEX idx_les_learner ON learner_eligibility_submissions(learner_account_id)`);
  await db.exec(`CREATE INDEX idx_les_status ON learner_eligibility_submissions(status)`);
}

async function seedOrganizations(db: SqliteDb): Promise<void> {
  for (const t of WORKFORCE_TENANTS) {
    await db.run(`INSERT INTO organizations (slug, name) VALUES (?, ?)`, t.slug, t.name);
  }
}

async function seedProvidersAndIntegrations(db: SqliteDb): Promise<void> {
  const providerSeeds: Array<[number, string]> = [
    [1, "Strayer University"],
    [2, "Capella University"],
    [3, "Torrens University Australia"],
    [4, "Sophia Learning"],
  ];
  for (const [id, name] of providerSeeds) {
    await db.run(`INSERT INTO providers (id, name) VALUES (?, ?)`, id, name);
  }

  const integrationSeeds: Array<[number, number, string, string, number]> = [
    [1, 1, "redirect", "https://www.strayer.edu/", 1],
    [2, 2, "redirect", "https://www.capella.edu/", 1],
    [3, 3, "redirect", "https://www.torrens.edu.au/", 0],
    [4, 4, "redirect", "https://www.sophia.org/", 1],
  ];
  for (const [id, providerId, integrationType, redirectUrl, isEnabled] of integrationSeeds) {
    await db.run(
      `INSERT INTO provider_integrations (id, provider_id, integration_type, redirect_url, is_enabled)
       VALUES (?, ?, ?, ?, ?)`,
      id,
      providerId,
      integrationType,
      redirectUrl,
      isEnabled,
    );
  }
}

async function seedProgramOfferings(db: SqliteDb): Promise<void> {
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
    await db.run(
      `INSERT INTO provider_program_offerings (id, provider_id, title, credential, modality, duration_summary, summary, sort_order)
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

async function seedDemoAuthAccounts(db: SqliteDb): Promise<void> {
  const password = "Password123!";
  const hash = await hashPassword(password);

  const summitSlug = "summit-hospitality-group";
  const summit = await db.get<{ id: number }>(`SELECT id FROM organizations WHERE slug = ?`, summitSlug);
  if (!summit) throw new Error(`Missing seed organization: ${summitSlug}`);
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
    await db.run(
      `INSERT INTO auth_accounts (email, password_hash, role, first_name, last_name, organization_name, organization_id, phone, state)
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
}

async function seedDemoLearnerEligibility(db: SqliteDb): Promise<void> {
  const row = await db.get<{ id: number }>(
    `SELECT id FROM auth_accounts WHERE lower(email) = lower('learner.demo@workforcecliff.local')`,
  );
  if (!row) return;
  for (const providerId of [1, 2]) {
    await db.run(
      `INSERT INTO learner_eligibility_submissions (learner_account_id, provider_id, status)
       VALUES (?, ?, 'pending')`,
      row.id,
      providerId,
    );
  }
}

export let db: SqliteDb;

export const databaseReady: Promise<void> = (async () => {
  const dbFilePath = path.resolve(process.cwd(), "db", "assessment.db");

  if (shouldResetDb()) {
    await resetDbFile(dbFilePath);
  } else {
    await fs.mkdir(path.dirname(dbFilePath), { recursive: true });
  }

  db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });

  await db.exec("BEGIN");
  try {
    await createSchema(db);
    await seedOrganizations(db);
    await seedProvidersAndIntegrations(db);
    await seedProgramOfferings(db);
    await seedDemoAuthAccounts(db);
    await seedDemoLearnerEligibility(db);
    await db.exec("COMMIT");
  } catch (e) {
    await db.exec("ROLLBACK");
    throw e;
  }
})();