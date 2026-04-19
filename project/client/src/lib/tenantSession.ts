const STORAGE_KEY = "workforcecliff_tenant_slug";

export function getStoredTenantSlug(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setStoredTenantSlug(slug: string): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, slug);
  } catch {
    /* ignore */
  }
}

export function clearStoredTenantSlug(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
