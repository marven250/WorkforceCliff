import { Box, CircularProgress } from "@mui/material";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { postAuthHomePath } from "../../lib/postAuthHome";
import LandingPage from "./LandingPage";

/** Marketing home at `/` — not shown to signed-in users. */
export default function RootLandingRoute() {
  const { user, loading, token } = useAuth();

  if (loading && token) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user) {
    return <Navigate to={postAuthHomePath(user)} replace />;
  }

  return <LandingPage />;
}
