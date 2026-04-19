import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { submitEmployerInquiry } from "../../services/api";
import { usStates } from "../../constants/states";

const APPROXIMATE_EMPLOYEES_OPTIONAL = "optional";

const employeeBands = [
  { value: "1-499", label: "1 – 499" },
  { value: "500-4999", label: "500 – 4,999" },
  { value: "5000-19999", label: "5,000 – 19,999" },
  { value: "20000+", label: "20,000+" },
];

export default function EmployerInquiryPage() {
  const [organizationLegalName, setOrganizationLegalName] = useState("");
  const [contactFirstName, setContactFirstName] = useState("");
  const [contactLastName, setContactLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [approximateEmployees, setApproximateEmployees] = useState(APPROXIMATE_EMPLOYEES_OPTIONAL);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <Box>
      <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ opacity: 0.9 }}>
            For employers
          </Typography>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Talk to sales about Workforce Cliff
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400, maxWidth: 720 }}>
            Share your talent priorities and benefits landscape. Our team will follow up with how
            education benefits, pathways, and advising can align to your workforce plan.
          </Typography>
        </Container>
      </Box>
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Paper sx={{ p: 3 }}>
          {done ? <Alert severity="success">{done}</Alert> : null}
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}
          {!done ? (
            <Stack
              component="form"
              spacing={2}
              onSubmit={async (e) => {
                e.preventDefault();
                setError(null);
                try {
                  const res = await submitEmployerInquiry({
                    organizationLegalName,
                    contactFirstName,
                    contactLastName,
                    email,
                    phone,
                    state,
                    approximateEmployees:
                      approximateEmployees === APPROXIMATE_EMPLOYEES_OPTIONAL
                        ? undefined
                        : approximateEmployees,
                    message: message || undefined,
                  });
                  setDone(res.message);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Submit failed");
                }
              }}
            >
              <TextField
                label="Organization legal name"
                value={organizationLegalName}
                onChange={(ev) => setOrganizationLegalName(ev.target.value)}
                required
                fullWidth
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Contact first name"
                  value={contactFirstName}
                  onChange={(ev) => setContactFirstName(ev.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="Contact last name"
                  value={contactLastName}
                  onChange={(ev) => setContactLastName(ev.target.value)}
                  required
                  fullWidth
                />
              </Stack>
              <TextField label="Work email" type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} required fullWidth />
              <TextField label="Phone" value={phone} onChange={(ev) => setPhone(ev.target.value)} required fullWidth />
              <FormControl fullWidth required>
                <InputLabel id="st">Headquarters state</InputLabel>
                <Select labelId="st" label="Headquarters state" value={state} onChange={(ev) => setState(String(ev.target.value))}>
                  {usStates.map((s) => (
                    <MenuItem key={s.code} value={s.code}>
                      {s.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="emp">Approximate employees</InputLabel>
                <Select
                  labelId="emp"
                  label="Approximate employees"
                  value={approximateEmployees}
                  onChange={(ev) => setApproximateEmployees(String(ev.target.value))}
                >
                  <MenuItem value={APPROXIMATE_EMPLOYEES_OPTIONAL}>Optional</MenuItem>
                  {employeeBands.map((b) => (
                    <MenuItem key={b.value} value={b.value}>
                      {b.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="How can we help?"
                value={message}
                onChange={(ev) => setMessage(ev.target.value)}
                multiline
                minRows={3}
                fullWidth
              />
              <Button type="submit" variant="contained" color="secondary" size="large">
                Submit inquiry
              </Button>
            </Stack>
          ) : null}
        </Paper>
      </Container>
    </Box>
  );
}
