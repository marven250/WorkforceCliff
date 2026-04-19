import { Box, Button, CircularProgress, Container, Stack, Typography } from "@mui/material";
import { Link as RouterLink, Navigate, useOutletContext, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { TenantOutletContext } from "./TenantLayout";

export default function TenantHomePage() {
  const { user, loading, token } = useAuth();
  const { tenant } = useOutletContext<TenantOutletContext>();
  const { tenantSlug } = useParams();

  if (loading && token) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user && tenantSlug) {
    return <Navigate to={`/org/${tenantSlug}/dashboard`} replace />;
  }

  return (
    <Box
      component="article"
      sx={{
        bgcolor: "primary.main",
        color: "primary.contrastText",
        py: { xs: 8, md: 10 },
      }}
    >
      <Container maxWidth="md">
        <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 2 }}>
          {tenant.name}
        </Typography>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, maxWidth: 720 }}>
          Workforce Cliff
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400, maxWidth: 640, mb: 3 }}>
          Sign in or create a learner account for your organization&apos;s education benefits portal.
        </Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
          <Button
            component={RouterLink}
            to={`/org/${tenantSlug}/sign-in`}
            variant="contained"
            color="secondary"
            size="large"
          >
            Sign in
          </Button>
          <Button
            component={RouterLink}
            to={`/org/${tenantSlug}/sign-up`}
            variant="outlined"
            color="inherit"
            size="large"
            sx={{ borderColor: "rgba(255,255,255,0.6)", "&:hover": { borderColor: "rgba(255,255,255,0.9)" } }}
          >
            Create learner account
          </Button>
        </Stack>
        <Typography variant="body2" sx={{ opacity: 0.85, mt: 3 }}>
          Wrong employer?{" "}
          <Button component={RouterLink} to="/sign-in" color="inherit" size="small" sx={{ verticalAlign: "baseline" }}>
            Search again
          </Button>
        </Typography>
      </Container>
    </Box>
  );
}
