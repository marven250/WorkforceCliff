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
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStoredTenantSlug } from "../../lib/tenantSession";
import { loginRequest } from "../../services/api";

export default function AdminSignIn() {
  const { applySession, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    if (user.role === "platform_admin") {
      navigate("/admin/inquiries", { replace: true });
      return;
    }
    const slug = getStoredTenantSlug();
    navigate(slug ? `/org/${slug}/dashboard` : "/dashboard", { replace: true });
  }, [user, navigate]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Platform admin sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          For Workforce Cliff platform operators. Learners and employer users should use{" "}
          <Link component={RouterLink} to="/sign-in">
            Sign in
          </Link>{" "}
          to select their organization first.
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
              const res = await loginRequest({ email, password });
              if (res.user.role !== "platform_admin") {
                setError("This page is for platform administrators. Use Sign in to select your employer.");
                return;
              }
              applySession(res);
              navigate("/admin/inquiries", { replace: true });
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
          Platform admin sample account (password <strong>Password123!</strong>):{" "}
          <code>admin.demo@workforcecliff.local</code>
        </Typography>
      </Paper>
    </Container>
  );
}
