import { db } from "../db-setup";

export interface ProgramOfferingRowDb {
  id: number;
  provider_id: number;
  provider_name: string;
  title: string;
  credential: string | null;
  modality: string | null;
  duration_summary: string | null;
  summary: string;
}

/** All catalog offerings joined to existing providers (no orphan rows). */
export async function listProgramOfferingsWithProviders(): Promise<ProgramOfferingRowDb[]> {
  const rows = (await db.all(
    `SELECT o.id, o.provider_id, p.name AS provider_name, o.title, o.credential, o.modality, o.duration_summary, o.summary
     FROM provider_program_offerings o
     INNER JOIN providers p ON p.id = o.provider_id
     ORDER BY p.name COLLATE NOCASE, o.sort_order, o.id`,
  )) as ProgramOfferingRowDb[];
  return rows;
}
