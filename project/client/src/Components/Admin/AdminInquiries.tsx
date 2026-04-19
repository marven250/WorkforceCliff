import {
  Box,
  Button,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  claimEducationProviderInquiry,
  claimEmployerInquiry,
  completeEducationProviderInquiry,
  completeEmployerInquiry,
  fetchAdminInquiries,
} from "../../services/api";
import { formatPhoneUsNational } from "../../utils/utils";

type EmployerRow = {
  id: number;
  organizationLegalName: string;
  contactFirstName: string;
  contactLastName: string;
  email: string;
  phone: string;
  state: string;
  approximateEmployees: string | null;
  message: string | null;
  createdAt: string;
  claimedByUserId: number | null;
  claimedAt: string | null;
  completedAt: string | null;
  claimedByName: string | null;
  claimedByEmail: string | null;
};

type ProviderRow = {
  id: number;
  institutionName: string;
  contactName: string;
  email: string;
  phone: string;
  state: string;
  website: string | null;
  programsSummary: string | null;
  message: string | null;
  createdAt: string;
  claimedByUserId: number | null;
  claimedAt: string | null;
  completedAt: string | null;
  claimedByName: string | null;
  claimedByEmail: string | null;
};

type Props = {
  archived?: boolean;
};

export default function AdminInquiries({ archived = false }: Props) {
  const { user } = useAuth();
  const isArchive = archived;

  const [employers, setEmployers] = useState<EmployerRow[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await fetchAdminInquiries(isArchive ? "archived" : "active");
    setEmployers(data.employerInquiries as EmployerRow[]);
    setProviders(data.educationProviderInquiries as ProviderRow[]);
  }, [isArchive]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
        if (cancelled) return;
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const runAction = async (key: string, fn: () => Promise<void>) => {
    setBusyId(key);
    setError(null);
    try {
      await fn();
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const claimLabel = (row: { claimedByUserId: number | null; claimedByName: string | null }) => {
    if (row.claimedByUserId == null) return "Unclaimed";
    if (user && row.claimedByUserId === user.id) return "You";
    return row.claimedByName || `Admin #${row.claimedByUserId}`;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        {isArchive ? "Archived B2B inquiries" : "B2B inquiries"}
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        {isArchive
          ? "Completed inquiries are kept here for reference."
          : "Claim an inquiry to work it exclusively. When you are done, mark it complete to move it to Archives."}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        <Button
          component={RouterLink}
          to="/admin/inquiries"
          variant={!isArchive ? "contained" : "outlined"}
          color="secondary"
          size="small"
        >
          Open inquiries
        </Button>
        <Button
          component={RouterLink}
          to="/admin/inquiries/archive"
          variant={isArchive ? "contained" : "outlined"}
          color="secondary"
          size="small"
        >
          Archives
        </Button>
      </Box>
      {error ? (
        <Typography color="error" paragraph>
          {error}
        </Typography>
      ) : null}
      <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
        Employer organizations
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Employees</TableCell>
              <TableCell>Created</TableCell>
              {isArchive ? <TableCell>Completed</TableCell> : null}
              <TableCell>Claimed by</TableCell>
              {!isArchive ? <TableCell align="right">Actions</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {employers.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.organizationLegalName}</TableCell>
                <TableCell>{formatPhoneUsNational(r.phone) ?? "—"}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.state}</TableCell>
                <TableCell>{r.approximateEmployees ?? "—"}</TableCell>
                <TableCell>{r.createdAt}</TableCell>
                {isArchive ? <TableCell>{r.completedAt ?? "—"}</TableCell> : null}
                <TableCell>{claimLabel(r)}</TableCell>
                {!isArchive ? (
                  <TableCell align="right">
                    {r.claimedByUserId == null ? (
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={busyId !== null}
                        onClick={() =>
                          void runAction(`e-claim-${r.id}`, () => claimEmployerInquiry(r.id))
                        }
                      >
                        {busyId === `e-claim-${r.id}` ? "…" : "Claim"}
                      </Button>
                    ) : user && r.claimedByUserId === user.id ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        disabled={busyId !== null}
                        onClick={() =>
                          void runAction(`e-done-${r.id}`, () => completeEmployerInquiry(r.id))
                        }
                      >
                        {busyId === `e-done-${r.id}` ? "…" : "Mark complete"}
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Locked
                      </Typography>
                    )}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
            {employers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isArchive ? 8 : 8}>
                  <Typography variant="body2" color="text.secondary">
                    {isArchive ? "No archived employer inquiries." : "No open employer inquiries."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Education providers
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Institution</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Website</TableCell>
              <TableCell>Created</TableCell>
              {isArchive ? <TableCell>Completed</TableCell> : null}
              <TableCell>Claimed by</TableCell>
              {!isArchive ? <TableCell align="right">Actions</TableCell> : null}
            </TableRow>
          </TableHead>
          <TableBody>
            {providers.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.institutionName}</TableCell>
                <TableCell>{formatPhoneUsNational(r.phone) ?? "—"}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.state}</TableCell>
                <TableCell>{r.website ?? "—"}</TableCell>
                <TableCell>{r.createdAt}</TableCell>
                {isArchive ? <TableCell>{r.completedAt ?? "—"}</TableCell> : null}
                <TableCell>{claimLabel(r)}</TableCell>
                {!isArchive ? (
                  <TableCell align="right">
                    {r.claimedByUserId == null ? (
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={busyId !== null}
                        onClick={() =>
                          void runAction(`p-claim-${r.id}`, () => claimEducationProviderInquiry(r.id))
                        }
                      >
                        {busyId === `p-claim-${r.id}` ? "…" : "Claim"}
                      </Button>
                    ) : user && r.claimedByUserId === user.id ? (
                      <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        disabled={busyId !== null}
                        onClick={() =>
                          void runAction(`p-done-${r.id}`, () => completeEducationProviderInquiry(r.id))
                        }
                      >
                        {busyId === `p-done-${r.id}` ? "…" : "Mark complete"}
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Locked
                      </Typography>
                    )}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
            {providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isArchive ? 8 : 8}>
                  <Typography variant="body2" color="text.secondary">
                    {isArchive ? "No archived provider inquiries." : "No open provider inquiries."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
