import { Navigate } from "react-router-dom";
import { getStoredTenantSlug } from "../../lib/tenantSession";

export default function ProvidersRedirect() {
  const slug = getStoredTenantSlug();
  if (slug) {
    return <Navigate to={`/org/${slug}/providers`} replace />;
  }
  return <Navigate to="/sign-in" replace />;
}
