import { Navigate, Outlet, useParams } from "react-router-dom";
import { getTenantBySlug, type WorkforceTenant } from "../../../../shared/tenants.ts";

export type TenantOutletContext = { tenant: WorkforceTenant };

export default function TenantLayout() {
  const { tenantSlug } = useParams();
  const tenant = getTenantBySlug(tenantSlug);
  if (!tenant) {
    return <Navigate to="/sign-in" replace />;
  }
  return <Outlet context={{ tenant }} />;
}
