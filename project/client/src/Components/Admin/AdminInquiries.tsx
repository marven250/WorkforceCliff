import {
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
import { useEffect, useState } from "react";
import { fetchAdminInquiries } from "../../services/api";

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
};

export default function AdminInquiries() {
  const [employers, setEmployers] = useState<EmployerRow[]>([]);
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchAdminInquiries();
        if (cancelled) return;
        setEmployers(data.employerInquiries as EmployerRow[]);
        setProviders(data.educationProviderInquiries as ProviderRow[]);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
        B2B inquiries
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Employer and education-provider submissions captured from public forms (similar to
        Workforce Edge “contact sales / partnerships” flows).
      </Typography>
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
              <TableCell>Contact</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Employees</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employers.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.organizationLegalName}</TableCell>
                <TableCell>
                  {r.contactFirstName} {r.contactLastName}
                </TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.state}</TableCell>
                <TableCell>{r.approximateEmployees ?? "—"}</TableCell>
                <TableCell>{r.createdAt}</TableCell>
              </TableRow>
            ))}
            {employers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    No employer inquiries yet.
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
              <TableCell>Contact</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>State</TableCell>
              <TableCell>Website</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {providers.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.institutionName}</TableCell>
                <TableCell>{r.contactName}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.state}</TableCell>
                <TableCell>{r.website ?? "—"}</TableCell>
                <TableCell>{r.createdAt}</TableCell>
              </TableRow>
            ))}
            {providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" color="text.secondary">
                    No provider inquiries yet.
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
