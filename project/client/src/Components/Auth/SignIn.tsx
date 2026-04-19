import {
  Alert,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { setStoredTenantSlug } from "../../lib/tenantSession";
import { getTenantBySlug } from "../../../../shared/tenants";

export default function SignIn() {
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const tenant = getTenantBySlug(tenantSlug);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && tenantSlug) {
      setStoredTenantSlug(tenantSlug);
      navigate(`/org/${tenantSlug}/dashboard`, { replace: true });
    }
  }, [user, navigate, tenantSlug]);

  if (!tenant || !tenantSlug) {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {tenant.name} · Workforce Cliff. New to Workforce Cliff? Learners can{" "}
          <Link component={RouterLink} to={`/org/${tenantSlug}/sign-up`}>
            create an account
          </Link>
          .
        </Typography>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        <Stack
          component="form"
          spacing={2}
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              await login({ email, password, tenantPortal: true });
              setStoredTenantSlug(tenantSlug);
              navigate(`/org/${tenantSlug}/dashboard`, { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Sign-in failed");
            }
          }}
        >
          <TextField
            label="Work email"
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            autoComplete="username"
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            autoComplete="current-password"
            required
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" fullWidth>
            Continue
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 3 }}>
          Only learner and employer accounts of this company can use this sign-in page.
        </Typography>
      </Paper>
    </Container>
  );
}
