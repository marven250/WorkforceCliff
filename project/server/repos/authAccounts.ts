import type { AccountRole, PublicUser } from "../../shared/Auth";
import { db } from "../db-setup";

export interface AuthAccountRow {
  id: number;
  email: string;
  password_hash: string;
  role: AccountRole;
  first_name: string;
  last_name: string;
  organization_name: string | null;
  organization_id: number | null;
  organization_slug: string | null;
  phone: string | null;
  state: string | null;
}

function rowToPublic(row: AuthAccountRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    organizationName: row.organization_name,
    organizationId: row.organization_id ?? null,
    employerTenantSlug: row.organization_slug ?? null,
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

export async function findAccountByEmail(email: string): Promise<AuthAccountRow | undefined> {
  return db.get<AuthAccountRow>(`${accountSelect} WHERE lower(a.email) = lower(?)`, email);
}

export async function findAccountById(id: number): Promise<PublicUser | null> {
  const row = await db.get<AuthAccountRow>(`${accountSelect} WHERE a.id = ?`, id);
  return row ? rowToPublic(row) : null;
}

export async function createLearnerAccount(params: {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  state: string;
  organizationName: string;
  organizationId: number;
}): Promise<PublicUser> {
  const result = await db.run(
    `INSERT INTO auth_accounts (email, password_hash, role, first_name, last_name, organization_name, organization_id, phone, state)
     VALUES (?, ?, 'learner', ?, ?, ?, ?, ?, ?)`,
    params.email,
    params.passwordHash,
    params.firstName,
    params.lastName,
    params.organizationName,
    params.organizationId,
    params.phone,
    params.state,
  );
  const id = Number(result.lastID);
  const created = await findAccountById(id);
  if (!created) throw new Error("Failed to read created account");
  return created;
}

const emailLooksValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export async function listPlatformAdminEmails(): Promise<string[]> {
  const rows = (await db.all(`SELECT email FROM auth_accounts WHERE role = 'platform_admin'`)) as Array<{
    email: string;
  }>;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of rows) {
    const e = r.email.trim().toLowerCase();
    if (!e || !emailLooksValid(e) || seen.has(e)) continue;
    seen.add(e);
    out.push(r.email.trim());
  }
  return out;
}
