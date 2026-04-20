import { db } from "../db-setup";
import type { EducationProviderInquiryInput, EmployerInquiryInput } from "../../shared/Inquiry";

export interface EmployerInquiryRowDb {
  id: number;
  organization_legal_name: string;
  contact_first_name: string;
  contact_last_name: string;
  email: string;
  phone: string;
  state: string;
  approximate_employees: string | null;
  message: string | null;
  created_at: string;
  claimed_by_user_id: number | null;
  claimed_at: string | null;
  completed_at: string | null;
  claimed_by_first_name?: string | null;
  claimed_by_last_name?: string | null;
  claimed_by_email?: string | null;
}

export interface EducationProviderInquiryRowDb {
  id: number;
  institution_name: string;
  contact_name: string;
  email: string;
  phone: string;
  state: string;
  website: string | null;
  programs_summary: string | null;
  message: string | null;
  created_at: string;
  claimed_by_user_id: number | null;
  claimed_at: string | null;
  completed_at: string | null;
  claimed_by_first_name?: string | null;
  claimed_by_last_name?: string | null;
  claimed_by_email?: string | null;
}

export async function insertEmployerInquiry(input: EmployerInquiryInput): Promise<number> {
  const r = await db.run(
    `INSERT INTO employer_inquiries (
      organization_legal_name, contact_first_name, contact_last_name, email, phone, state,
      approximate_employees, message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    input.organizationLegalName,
    input.contactFirstName,
    input.contactLastName,
    input.email,
    input.phone,
    input.state,
    input.approximateEmployees ?? null,
    input.message ?? null,
  );
  return Number(r.lastID);
}

export async function insertEducationProviderInquiry(input: EducationProviderInquiryInput): Promise<number> {
  const r = await db.run(
    `INSERT INTO education_provider_inquiries (
      institution_name, contact_name, email, phone, state, website, programs_summary, message
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    input.institutionName,
    input.contactName,
    input.email,
    input.phone,
    input.state,
    input.website ?? null,
    input.programsSummary ?? null,
    input.message ?? null,
  );
  return Number(r.lastID);
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

export async function listEmployerInquiries(archived: boolean): Promise<EmployerInquiryRowDb[]> {
  const filter = archived ? "e.completed_at IS NOT NULL" : "e.completed_at IS NULL";
  const rows = await db.all<EmployerInquiryRowDb>(
    `${employerSelect} WHERE ${filter} ORDER BY e.id DESC`,
  );
  return rows as unknown as EmployerInquiryRowDb[];
}

export async function listEducationProviderInquiries(archived: boolean): Promise<EducationProviderInquiryRowDb[]> {
  const filter = archived ? "e.completed_at IS NOT NULL" : "e.completed_at IS NULL";
  const rows = await db.all<EducationProviderInquiryRowDb>(
    `${providerSelect} WHERE ${filter} ORDER BY e.id DESC`,
  );
  return rows as unknown as EducationProviderInquiryRowDb[];
}

export type ClaimOutcome = "claimed" | "already_mine" | "taken" | "not_found" | "already_completed";

export async function claimEmployerInquiry(inquiryId: number, adminUserId: number): Promise<ClaimOutcome> {
  const row = await db.get<{ claimed_by_user_id: number | null; completed_at: string | null }>(
    `SELECT claimed_by_user_id, completed_at FROM employer_inquiries WHERE id = ?`,
    inquiryId,
  );
  if (!row) return "not_found";
  if (row.completed_at) return "already_completed";
  if (row.claimed_by_user_id != null && row.claimed_by_user_id !== adminUserId) return "taken";
  if (row.claimed_by_user_id === adminUserId) return "already_mine";

  const r = await db.run(
    `UPDATE employer_inquiries
     SET claimed_by_user_id = ?, claimed_at = datetime('now')
     WHERE id = ? AND completed_at IS NULL AND claimed_by_user_id IS NULL`,
    adminUserId,
    inquiryId,
  );
  if (r.changes === 0) return "taken";
  return "claimed";
}

export async function claimEducationProviderInquiry(inquiryId: number, adminUserId: number): Promise<ClaimOutcome> {
  const row = await db.get<{ claimed_by_user_id: number | null; completed_at: string | null }>(
    `SELECT claimed_by_user_id, completed_at FROM education_provider_inquiries WHERE id = ?`,
    inquiryId,
  );
  if (!row) return "not_found";
  if (row.completed_at) return "already_completed";
  if (row.claimed_by_user_id != null && row.claimed_by_user_id !== adminUserId) return "taken";
  if (row.claimed_by_user_id === adminUserId) return "already_mine";

  const r = await db.run(
    `UPDATE education_provider_inquiries
     SET claimed_by_user_id = ?, claimed_at = datetime('now')
     WHERE id = ? AND completed_at IS NULL AND claimed_by_user_id IS NULL`,
    adminUserId,
    inquiryId,
  );
  if (r.changes === 0) return "taken";
  return "claimed";
}

export type CompleteOutcome =
  | "ok"
  | "not_found"
  | "already_completed"
  | "not_claimed"
  | "wrong_claimer";

export async function completeEmployerInquiry(inquiryId: number, adminUserId: number): Promise<CompleteOutcome> {
  const row = await db.get<{
    claimed_by_user_id: number | null;
    completed_at: string | null;
  }>(`SELECT claimed_by_user_id, completed_at FROM employer_inquiries WHERE id = ?`, inquiryId);
  if (!row) return "not_found";
  if (row.completed_at) return "already_completed";
  if (row.claimed_by_user_id == null) return "not_claimed";
  if (row.claimed_by_user_id !== adminUserId) return "wrong_claimer";

  await db.run(
    `UPDATE employer_inquiries SET completed_at = datetime('now') WHERE id = ? AND completed_at IS NULL`,
    inquiryId,
  );
  return "ok";
}

export async function completeEducationProviderInquiry(
  inquiryId: number,
  adminUserId: number,
): Promise<CompleteOutcome> {
  const row = await db.get<{
    claimed_by_user_id: number | null;
    completed_at: string | null;
  }>(`SELECT claimed_by_user_id, completed_at FROM education_provider_inquiries WHERE id = ?`, inquiryId);
  if (!row) return "not_found";
  if (row.completed_at) return "already_completed";
  if (row.claimed_by_user_id == null) return "not_claimed";
  if (row.claimed_by_user_id !== adminUserId) return "wrong_claimer";

  await db.run(
    `UPDATE education_provider_inquiries SET completed_at = datetime('now') WHERE id = ? AND completed_at IS NULL`,
    inquiryId,
  );
  return "ok";
}
