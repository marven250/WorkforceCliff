import type { PublicUser } from "../../../shared/Auth";
import { getStoredTenantSlug } from "./tenantSession";

/** Default signed-in home (tenant dashboard, `/dashboard` resolver, or admin inquiries). */
export function postAuthHomePath(user: PublicUser): string {
  if (user.role === "platform_admin") {
    return "/admin/inquiries";
  }
  const slug = getStoredTenantSlug();
  if (slug) {
    return `/org/${slug}/dashboard`;
  }
  return "/sign-in";
}

const GLOBAL_MARKETING_PATHS = new Set([
  "/",
  "/for-employers",
  "/for-partners",
  "/for-learners",
  "/contact-us",
  "/privacy",
  "/cookie-policy",
  "/terms",
]);

export function isGlobalMarketingPath(pathname: string): boolean {
  return GLOBAL_MARKETING_PATHS.has(pathname);
}

/** Signed-in platform admins stay under `/admin/inquiries` (including archive). */
export function isPlatformAdminWorkspacePath(pathname: string): boolean {
  return pathname === "/admin/inquiries" || pathname.startsWith("/admin/inquiries/");
}
