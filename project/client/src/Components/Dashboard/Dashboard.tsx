import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  List,
  ListItem,
  ListItemText,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  approveEligibilitySubmission,
  fetchPortalHome,
  rejectEligibilitySubmission,
} from "../../services/api";

type PendingEligibility = {
  id: number;
  providerId: number;
  providerName: string;
  learnerId: number;
  learnerEmail: string;
  learnerName: string;
  createdAt: string;
};

type PortalPayload = {
  role: string;
  title: string;
  summary: string;
  nextSteps: string[];
  pendingEligibility?: PendingEligibility[];
};

export default function Dashboard() {
  const { user } = useAuth();
  const { tenantSlug } = useParams<{ tenantSlug?: string }>();
  const providersPath = tenantSlug ? `/org/${tenantSlug}/providers` : "/providers";
  const [data, setData] = useState<PortalPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const json = (await fetchPortalHome()) as PortalPayload;
    setData(json);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
        if (!cancelled) setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const runDecision = async (id: number, kind: "approve" | "reject") => {
    setBusyId(id);
    setError(null);
    try {
      if (kind === "approve") await approveEligibilitySubmission(id);
      else await rejectEligibilitySubmission(id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  const pending = user?.role === "employer" ? data?.pendingEligibility ?? [] : [];

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
        <>
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {data.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {data.summary}
              </Typography>
              {user?.role !== "platform_admin" && user?.role !== "learner" && user?.role !== "employer" ? (
                <>
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
                </>
              ) : null}
              {user?.role === "learner" ? (
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Button component={RouterLink} to={`${providersPath}?view=offerings`} variant="outlined">
                    Browse education providers offerings
                  </Button>
                  <Button component={RouterLink} to={providersPath} variant="outlined">
                    Browse connected providers
                  </Button>
                </Stack>
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
          {user?.role === "employer" ? (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Pending learner eligibility
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Approve or reject provider access requests from learners tied to your organization. Only submissions
                  with status <strong>pending</strong> appear here.
                </Typography>
                {!user.employerTenantSlug ? (
                  <Typography variant="body2" color="warning.main">
                    Your account is not linked to an employer tenant, so pending requests cannot be loaded.
                  </Typography>
                ) : pending.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No pending eligibility submissions.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Learner</TableCell>
                          <TableCell>Email</TableCell>
                          <TableCell>Provider</TableCell>
                          <TableCell>Requested</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {pending.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell>{row.learnerName}</TableCell>
                            <TableCell>{row.learnerEmail}</TableCell>
                            <TableCell>{row.providerName}</TableCell>
                            <TableCell>{row.createdAt}</TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                  disabled={busyId !== null}
                                  onClick={() => void runDecision(row.id, "approve")}
                                >
                                  {busyId === row.id ? "…" : "Approve"}
                                </Button>
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  disabled={busyId !== null}
                                  onClick={() => void runDecision(row.id, "reject")}
                                >
                                  Reject
                                </Button>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : !error ? (
        <Typography>Loading your workspace…</Typography>
      ) : null}
    </Container>
  );
}
