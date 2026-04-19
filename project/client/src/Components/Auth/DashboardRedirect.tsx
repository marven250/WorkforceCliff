import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { postAuthHomePath } from "../../lib/postAuthHome";
import { getStoredTenantSlug } from "../../lib/tenantSession";

/** Resolves legacy `/dashboard` to the tenant workspace when a tenant was chosen for this session. */
export default function DashboardRedirect() {
  const { user } = useAuth();
  const slug = getStoredTenantSlug();
  if (slug) {
    return <Navigate to={`/org/${slug}/dashboard`} replace />;
  }
  if (user) {
    return <Navigate to={postAuthHomePath(user)} replace />;
  }
  return <Navigate to="/sign-in" replace />;
}

