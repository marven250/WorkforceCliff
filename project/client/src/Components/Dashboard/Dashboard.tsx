import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { fetchPortalHome } from "../../services/api";

type PortalPayload = {
  role: string;
  title: string;
  summary: string;
  nextSteps: string[];
};

export default function Dashboard() {
  const { user } = useAuth();
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const providersPath = tenantSlug ? `/org/${tenantSlug}/providers` : "/providers";
  const [data, setData] = useState<PortalPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const json = (await fetchPortalHome()) as PortalPayload;
        if (!cancelled) setData(json);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        Welcome{user ? `, ${user.firstName}` : ""}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Signed in as <strong>{user?.email}</strong> · role <strong>{user?.role}</strong>
        {user?.role === "learner" && user.organizationName ? (
          <>
            {" "}
            · employer <strong>{user.organizationName}</strong>
          </>
        ) : null}
      </Typography>
      {error ? (
        <Typography color="error" paragraph>
          {error}
        </Typography>
      ) : null}
      {data ? (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {data.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {data.summary}
            </Typography>
            <Typography variant="subtitle2" gutterBottom>
              Suggested next steps
            </Typography>
            <List dense>
              {data.nextSteps.map((s) => (
                <ListItem key={s} disablePadding sx={{ py: 0.5 }}>
                  <ListItemText primary={s} />
                </ListItem>
              ))}
            </List>
            {user?.role === "learner" ? (
              <Box sx={{ mt: 2 }}>
                <Button component={RouterLink} to={providersPath} variant="outlined">
                  Browse education providers (demo eligibility)
                </Button>
              </Box>
            ) : null}
            {user?.role === "platform_admin" ? (
              <Box sx={{ mt: 2 }}>
                <Button component={RouterLink} to="/admin/inquiries" variant="contained" color="secondary">
                  View B2B inquiries
                </Button>
              </Box>
            ) : null}
          </CardContent>
        </Card>
      ) : !error ? (
        <Typography>Loading your workspace…</Typography>
      ) : null}
    </Container>
  );
}
