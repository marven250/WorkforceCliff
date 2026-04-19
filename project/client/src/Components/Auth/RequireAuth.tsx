import type { ReactElement } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate, useParams } from "react-router-dom";
import type { AccountRole } from "../../../../shared/Auth";
import { useAuth } from "../../context/AuthContext";

export default function RequireAuth({
  children,
  roles,
}: {
  children: ReactElement;
  roles?: AccountRole[];
}) {
  const { token, user, loading } = useAuth();
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const signInTo = tenantSlug ? `/org/${tenantSlug}/sign-in` : "/sign-in";

  if (!token) {
    return <Navigate to={signInTo} replace />;
  }

  if (loading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to={signInTo} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const fallback = tenantSlug ? `/org/${tenantSlug}/dashboard` : "/dashboard";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
