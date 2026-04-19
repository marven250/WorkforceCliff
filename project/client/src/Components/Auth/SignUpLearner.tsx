import {
  Alert,
  Button,
  Container,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Navigate, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { usStates } from "../../constants/states";
import { setStoredTenantSlug } from "../../lib/tenantSession";
import { getTenantBySlug } from "../../../../shared/tenants";

export default function SignUpLearner() {
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const tenant = getTenantBySlug(tenantSlug);
  const { registerLearner, user } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
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
          Create your learner account
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {tenant.name} · Workforce Cliff. Track education benefits, explore programs, and connect
          learning to your career goals. Already registered?{" "}
          <Link component={RouterLink} to={`/org/${tenantSlug}/sign-in`}>
            Sign in
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
              await registerLearner({
                email,
                password,
                firstName,
                lastName,
                phone,
                state,
                employerTenantSlug: tenantSlug,
              });
              setStoredTenantSlug(tenantSlug);
              navigate(`/org/${tenantSlug}/dashboard`, { replace: true });
            } catch (err) {
              setError(err instanceof Error ? err.message : "Registration failed");
            }
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="First name"
              value={firstName}
              onChange={(ev) => setFirstName(ev.target.value)}
              required
              fullWidth
            />
            <TextField
              label="Last name"
              value={lastName}
              onChange={(ev) => setLastName(ev.target.value)}
              required
              fullWidth
            />
          </Stack>
          <TextField
            label="Personal email"
            type="email"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
            fullWidth
            autoComplete="email"
          />
          <TextField
            label="Password (min 8 characters)"
            type="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            required
            fullWidth
            autoComplete="new-password"
          />
          <TextField
            label="Mobile phone"
            value={phone}
            onChange={(ev) => setPhone(ev.target.value)}
            required
            fullWidth
            helperText="Digits only; used for learner success outreach when enabled by your program."
          />
          <FormControl fullWidth required>
            <InputLabel id="st">State</InputLabel>
            <Select labelId="st" label="State" value={state} onChange={(ev) => setState(String(ev.target.value))}>
              {usStates.map((s) => (
                <MenuItem key={s.code} value={s.code}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button type="submit" variant="contained" color="secondary" size="large" fullWidth>
            Create account
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
