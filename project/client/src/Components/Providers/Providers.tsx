import "./Providers.css";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Link,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { ProgramOffering } from "../../../../shared/ProgramOffering.ts";
import type { Provider } from "../../../../shared/Provider.ts";
import {
  API_BASE_URL,
  fetchLearnerProgramOfferings,
  fetchLearnerProviders,
  requestLearnerEligibility,
} from "../../services/api.ts";
import { useAuth } from "../../context/AuthContext";

function hasEligibilityStatus(status: string | null | undefined): status is "pending" | "eligible" | "ineligible" {
  return status === "pending" || status === "eligible" || status === "ineligible";
}

export default function Providers() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const offeringsView = searchParams.get("view") === "offerings";

  const [providers, setProviders] = useState<Array<Provider>>([]);
  const [offerings, setOfferings] = useState<ProgramOffering[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyProviderId, setBusyProviderId] = useState<number | null>(null);

  const loadProviders = useCallback(async () => {
    const providerData = await fetchLearnerProviders();
    setProviders(providerData);
  }, []);

  const loadOfferings = useCallback(async () => {
    const { offerings: rows } = await fetchLearnerProgramOfferings();
    setOfferings(rows);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadProviders();
        if (offeringsView) {
          await loadOfferings();
        }
        if (!cancelled) setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [offeringsView, loadOfferings, loadProviders]);

  useEffect(() => {
    if (user?.role !== "learner") return;
    let closed = false;
    let timer: number | null = null;
    const scheduleRefresh = () => {
      if (timer != null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (closed) return;
        void loadProviders();
        if (offeringsView) void loadOfferings();
      }, 250);
    };
    const es = new EventSource(`${API_BASE_URL}/api/portal/learners/eligibility/stream`, { withCredentials: true });
    es.addEventListener("eligibility_changed", scheduleRefresh);
    es.onerror = () => scheduleRefresh();
    return () => {
      closed = true;
      if (timer != null) window.clearTimeout(timer);
      es.close();
    };
  }, [loadOfferings, loadProviders, offeringsView, user?.role]);

  const providerById = useMemo(() => {
    const m = new Map<number, Provider>();
    for (const p of providers) {
      m.set(p.id, p);
    }
    return m;
  }, [providers]);

  const connectedProviders = useMemo(
    () => providers.filter((p) => hasEligibilityStatus(p.status)),
    [providers],
  );

  const requestEligibility = async (providerId: number) => {
    setBusyProviderId(providerId);
    setError(null);
    try {
      await requestLearnerEligibility(providerId);
      await loadProviders();
      if (offeringsView) {
        navigate(pathname, { replace: true });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusyProviderId(null);
    }
  };

  if (offeringsView) {
    return (
      <Box>
        <Box sx={{ bgcolor: "grey.100", py: 4 }}>
          <Container maxWidth="lg">
            <Typography variant="overline" color="secondary" sx={{ letterSpacing: 0.12, fontWeight: 700 }}>
              Preview programs
            </Typography>
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, mt: 0.5 }}>
              Example sample offerings
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 800, mb: 1 }}>
              Browse representative programs from education partners available in Workforce Cliff.
            </Typography>
            <Button component={RouterLink} to={pathname} variant="contained" color="secondary" sx={{ mt: 2 }}>
              Back to eligibility and providers
            </Button>
          </Container>
        </Box>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {error ? (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          ) : null}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            {offerings.map((o) => {
              const prov = providerById.get(o.providerId);
              const st = prov?.status ?? null;
              return (
                <Card key={o.id} variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1.25 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                      {o.providerName}
                    </Typography>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
                      {o.title}
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={0.75}>
                      {o.credential ? <Chip size="small" label={o.credential} variant="outlined" /> : null}
                      {o.modality ? <Chip size="small" label={o.modality} color="secondary" variant="outlined" /> : null}
                      {o.durationSummary ? <Chip size="small" label={o.durationSummary} variant="outlined" /> : null}
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {o.summary}
                    </Typography>
                    {st === "pending" ? (
                      <Button size="small" variant="outlined" disabled>
                        Pending employer review
                      </Button>
                    ) : st === "eligible" ? (
                      <Box
                        sx={{
                          mt: "auto",
                          pt: 1.5,
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label="Eligible"
                          color="success"
                          size="small"
                          sx={{
                            fontWeight: 700,
                            letterSpacing: 0.06,
                            px: 1,
                            height: 28,
                            "& .MuiChip-label": { px: 1.5 },
                          }}
                        />
                      </Box>
                    ) : st === "ineligible" ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        disabled={busyProviderId !== null}
                        onClick={() => void requestEligibility(o.providerId)}
                      >
                        {busyProviderId === o.providerId ? "…" : "Request eligibility"}
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        disabled={busyProviderId !== null}
                        onClick={() => void requestEligibility(o.providerId)}
                      >
                        {busyProviderId === o.providerId ? "…" : "Request eligibility"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </Box>
          {offerings.length === 0 && !error ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No program offerings are configured yet.
            </Typography>
          ) : null}
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ bgcolor: "grey.100", py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Learning provider access
          </Typography>
          <Button
            component={RouterLink}
            to={`${pathname}?view=offerings`}
            variant="outlined"
            color="secondary"
            sx={{ mt: 2 }}
          >
            Browse education providers offerings
          </Button>
        </Container>
      </Box>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        {error ? (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        ) : null}
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Connected providers
            </Typography>
            <List disablePadding>
              {connectedProviders.map((provider: Provider) => (
                <ListItem
                  key={provider.id}
                  sx={{
                    flexDirection: "column",
                    alignItems: "stretch",
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                    <Typography variant="body1" fontWeight={600}>
                      {provider.name}
                    </Typography>
                    {provider.status === "eligible" && provider.redirect_url ? (
                      <Link href={provider.redirect_url} target="_blank" rel="noopener noreferrer">
                        Open provider portal
                      </Link>
                    ) : provider.status === "pending" ? (
                      <Typography variant="body2" color="text.secondary">
                        Pending employer approval
                      </Typography>
                    ) : provider.status === "ineligible" ? (
                      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
                        <Typography variant="body2" color="text.secondary">
                          Not eligible
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={busyProviderId !== null}
                          onClick={() => void requestEligibility(provider.id)}
                        >
                          {busyProviderId === provider.id ? "…" : "Request again"}
                        </Button>
                      </Stack>
                    ) : null}
                  </Stack>
                </ListItem>
              ))}
              {connectedProviders.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No connected providers yet. Open sample offerings and use &quot;Request eligibility&quot; on a program
                  to add it here as pending.
                </Typography>
              ) : null}
            </List>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
