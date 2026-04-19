import type { ReactElement } from "react";
import { Box, CircularProgress } from "@mui/material";
import { Navigate } from "react-router-dom";
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

  if (!token) {
    return <Navigate to="/sign-in" replace />;
  }

  if (loading && !user) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={240}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
