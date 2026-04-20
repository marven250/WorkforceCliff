import { db } from "../db-setup";

export type OrganizationRow = {
  id: number;
  slug: string;
  name: string;
};

export async function findOrganizationBySlug(slug: string): Promise<OrganizationRow | undefined> {
  return db.get<OrganizationRow>(`SELECT id, slug, name FROM organizations WHERE slug = ?`, slug.trim());
}
