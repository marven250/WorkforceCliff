import { Navigate } from "react-router-dom";
import { getStoredTenantSlug } from "../../lib/tenantSession";

/** Resolves legacy `/dashboard` to the tenant workspace when a tenant was chosen for this session. */
export default function DashboardRedirect() {
  const slug = getStoredTenantSlug();
  if (slug) {
    return <Navigate to={`/org/${slug}/dashboard`} replace />;
  }
  return <Navigate to="/sign-in" replace />;
}
