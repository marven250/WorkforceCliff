export type WorkforceTenant = {
  /** URL segment under `/org/:tenantSlug` */
  slug: string;
  /** Display name shown in UI */
  name: string;
};

export const WORKFORCE_TENANTS: WorkforceTenant[] = [
  { slug: "summit-hospitality-group", name: "Summit Hospitality Group" },
  { slug: "lakeside-health-system", name: "Lakeside Health System" },
  { slug: "ridgeline-health-services", name: "Ridgeline Health Services" },
  { slug: "granite-ridge-federal-credit-union", name: "Granite Ridge Federal Credit Union" },
  { slug: "northwind-logistics", name: "Northwind Logistics" },
  { slug: "harborline-financial", name: "Harborline Financial" },
];

export function getTenantBySlug(slug: string | undefined): WorkforceTenant | undefined {
  if (!slug) return undefined;
  return WORKFORCE_TENANTS.find((t) => t.slug === slug);
}

export function filterTenantsByQuery(query: string): WorkforceTenant[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return WORKFORCE_TENANTS.filter((t) => t.name.toLowerCase().includes(q));
}
