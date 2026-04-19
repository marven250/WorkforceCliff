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
    phone: row.phone,
    state: row.state,
  };
}

export async function findAccountByEmail(email: string): Promise<AuthAccountRow | undefined> {
  return db.get<AuthAccountRow>(
    `SELECT id, email, password_hash, role, first_name, last_name, organization_name, phone, state
     FROM auth_accounts WHERE lower(email) = lower(?)`,
    email,
  );
}

export async function findAccountById(id: number): Promise<PublicUser | null> {
  const row = await db.get<AuthAccountRow>(
    `SELECT id, email, password_hash, role, first_name, last_name, organization_name, phone, state
     FROM auth_accounts WHERE id = ?`,
    id,
  );
  return row ? rowToPublic(row) : null;
}

export async function createLearnerAccount(params: {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  state: string;
}): Promise<PublicUser> {
  const result = await db.run(
    `INSERT INTO auth_accounts (email, password_hash, role, first_name, last_name, organization_name, phone, state)
     VALUES (?, ?, 'learner', ?, ?, NULL, ?, ?)`,
    params.email,
    params.passwordHash,
    params.firstName,
    params.lastName,
    params.phone,
    params.state,
  );
  const id = Number(result.lastID);
  const created = await findAccountById(id);
  if (!created) throw new Error("Failed to read created account");
  return created;
}
