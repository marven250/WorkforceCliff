import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import fs from "fs";
import bcrypt from "bcryptjs";

const legacyMigrations: string[] = [
  "CREATE TABLE providers (id int, name varchar(255), PRIMARY KEY (id));",
  'INSERT INTO providers (id, name) VALUES (1, "Strayer University");',
  'INSERT INTO providers (id, name) VALUES (2, "Capella University");',
  'INSERT INTO providers (id, name) VALUES (3, "Torrens University Australia");',

  "CREATE TABLE users (id int, name varchar(255), email varchar(100), PRIMARY KEY (id));",
  'INSERT INTO users (id, name, email) VALUES (1, "Charlie Monsoon", "Charlie@gmail.com");',
  'INSERT INTO users (id, name, email) VALUES (2, "Joseph Lee", "Joseph123@gmail.com");',
  'INSERT INTO users (id, name, email) VALUES (3, "Janet Grace", "Jgrace465@gmail.com");',

  "CREATE TABLE provider_integrations (id int, provider_id int, integration_type varchar(30) CHECK (integration_type IN ('none', 'redirect', 'sso')) DEFAULT 'none', redirect_url varchar(100), is_enabled BOOLEAN NOT NULL DEFAULT 0, PRIMARY KEY (id), FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE);",
  'INSERT INTO provider_integrations (id, provider_id, integration_type, redirect_url, is_enabled) VALUES (1, 1, "redirect", "https://www.strayer.edu/", true);',
  'INSERT INTO provider_integrations (id, provider_id, integration_type, redirect_url, is_enabled) VALUES (2, 2, "redirect", "https://www.capella.edu/", true);',
  'INSERT INTO provider_integrations (id, provider_id, integration_type, redirect_url, is_enabled) VALUES (3, 3, "redirect", "https://www.torrens.edu.au/", false);',

  "CREATE TABLE eligibility_submissions (id int, user_id int, provider_id int, status varchar(15) CHECK (status IN ('pending', 'eligible', 'ineligible')) DEFAULT 'pending', PRIMARY KEY (id),  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE);",
  'INSERT INTO eligibility_submissions (id, user_id, provider_id, status) VALUES (1, 1, 1, "pending");',
  'INSERT INTO eligibility_submissions (id, user_id, provider_id, status) VALUES (2, 2, 2, "eligible");',
  'INSERT INTO eligibility_submissions (id, user_id, provider_id, status) VALUES (3, 3, 3, "ineligible");',
  'INSERT INTO eligibility_submissions (id, user_id, provider_id, status) VALUES (4, 1, 3, "eligible");',
  'INSERT INTO eligibility_submissions (id, user_id, provider_id, status) VALUES (5, 1, 2, "ineligible");',
];

async function applyAuthAndInquirySchema(database: Database<sqlite3.Database, sqlite3.Statement>) {
  const stmts = [
    `CREATE TABLE IF NOT EXISTS auth_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('learner','employer','education_provider','platform_admin')),
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      organization_name TEXT,
      employer_tenant_slug TEXT,
      phone TEXT,
      state TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS employer_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      organization_legal_name TEXT NOT NULL,
      contact_first_name TEXT NOT NULL,
      contact_last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      state TEXT NOT NULL,
      approximate_employees TEXT,
      message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );`,
    `CREATE TABLE IF NOT EXISTS education_provider_inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      institution_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      state TEXT NOT NULL,
      website TEXT,
      programs_summary TEXT,
      message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );`,
  ];
  for (const s of stmts) {
    await database.exec(s);
  }
}

async function migrateAuthAccountsEmployerTenantSlug(database: Database<sqlite3.Database, sqlite3.Statement>) {
  const cols = (await database.all(`PRAGMA table_info(auth_accounts)`)) as Array<{ name: string }>;
  if (cols.some((c: { name: string }) => c.name === "employer_tenant_slug")) return;
  await database.exec(`ALTER TABLE auth_accounts ADD COLUMN employer_tenant_slug TEXT`);
}

async function seedDemoAuthAccounts(database: Database<sqlite3.Database, sqlite3.Statement>) {
  const password = "Password123!";
  const hash = await bcrypt.hash(password, 10);
  const seeds: Array<{
    email: string;
    role: "employer" | "education_provider" | "platform_admin";
    first: string;
    last: string;
    org: string | null;
    phone: string;
    state: string;
  }> = [
    {
      email: "employer.demo@workforcecliff.local",
      role: "employer",
      first: "Morgan",
      last: "Reyes",
      org: "Summit Hospitality Group",
      phone: "5550100",
      state: "NV",
    },
    {
      email: "partner.demo@workforcecliff.local",
      role: "education_provider",
      first: "Dr. Sam",
      last: "Okonkwo",
      org: "Ridgeline College of Health Professions",
      phone: "5550101",
      state: "TX",
    },
    {
      email: "admin.demo@workforcecliff.local",
      role: "platform_admin",
      first: "Platform",
      last: "Admin",
      org: "Workforce Cliff",
      phone: "5550199",
      state: "DC",
    },
  ];
  for (const s of seeds) {
    await database.run(
      `INSERT OR IGNORE INTO auth_accounts (email, password_hash, role, first_name, last_name, organization_name, phone, state)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      s.email,
      hash,
      s.role,
      s.first,
      s.last,
      s.org,
      s.phone,
      s.state,
    );
  }
}

export const runDBMigrations = async (database: Database<sqlite3.Database, sqlite3.Statement>): Promise<Boolean> => {
  for (const stmt of legacyMigrations) {
    try {
      await database.run(stmt);
    } catch (err: unknown) {
      if (err instanceof Error) console.error(err.message);
    }
  }
  return true;
};

export let db: Database<sqlite3.Database, sqlite3.Statement>;

export const databaseReady: Promise<void> = (async () => {
  const dbFilePath = "./db/assessment.db";
  const existedBefore = fs.existsSync(dbFilePath);

  db = await open({
    filename: dbFilePath,
    driver: sqlite3.Database,
  });

  if (!existedBefore) {
    await runDBMigrations(db);
  }

  await applyAuthAndInquirySchema(db);
  await migrateAuthAccountsEmployerTenantSlug(db);
  await seedDemoAuthAccounts(db);
})();
