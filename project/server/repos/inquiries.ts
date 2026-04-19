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

export async function listEmployerInquiries(): Promise<EmployerInquiryRowDb[]> {
  const rows = await db.all<EmployerInquiryRowDb>(
    `SELECT id, organization_legal_name, contact_first_name, contact_last_name, email, phone, state,
            approximate_employees, message, created_at
     FROM employer_inquiries ORDER BY id DESC`,
  );
  return rows as unknown as EmployerInquiryRowDb[];
}

export async function listEducationProviderInquiries(): Promise<EducationProviderInquiryRowDb[]> {
  const rows = await db.all<EducationProviderInquiryRowDb>(
    `SELECT id, institution_name, contact_name, email, phone, state, website, programs_summary, message, created_at
     FROM education_provider_inquiries ORDER BY id DESC`,
  );
  return rows as unknown as EducationProviderInquiryRowDb[];
}
