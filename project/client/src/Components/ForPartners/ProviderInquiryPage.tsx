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
import { submitEducationProviderInquiry } from "../../services/api";
import { usStates } from "../../constants/states";

export default function ProviderInquiryPage() {
  const [institutionName, setInstitutionName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [website, setWebsite] = useState("");
  const [programsSummary, setProgramsSummary] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <Box>
      <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Typography variant="overline" sx={{ opacity: 0.9 }}>
            For education providers
          </Typography>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Partner with Workforce Cliff
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400, maxWidth: 720 }}>
            Colleges, universities, and training organizations can reach out to discuss catalog
            alignment, learner referrals, and employer-sponsored pathways—mirroring Workforce Edge
            partnership workflows.
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
                  const res = await submitEducationProviderInquiry({
                    institutionName,
                    contactName,
                    email,
                    phone,
                    state,
                    website: website || undefined,
                    programsSummary: programsSummary || undefined,
                    message: message || undefined,
                  });
                  setDone(res.message);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Submit failed");
                }
              }}
            >
              <TextField
                label="Institution name"
                value={institutionName}
                onChange={(ev) => setInstitutionName(ev.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Primary contact name"
                value={contactName}
                onChange={(ev) => setContactName(ev.target.value)}
                required
                fullWidth
              />
              <TextField label="Email" type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} required fullWidth />
              <TextField label="Phone" value={phone} onChange={(ev) => setPhone(ev.target.value)} required fullWidth />
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
              <TextField label="Website" value={website} onChange={(ev) => setWebsite(ev.target.value)} fullWidth />
              <TextField
                label="Programs you want to highlight"
                value={programsSummary}
                onChange={(ev) => setProgramsSummary(ev.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
              <TextField
                label="Message"
                value={message}
                onChange={(ev) => setMessage(ev.target.value)}
                multiline
                minRows={3}
                fullWidth
              />
              <Button type="submit" variant="contained" color="secondary" size="large">
                Submit partnership inquiry
              </Button>
            </Stack>
          ) : null}
        </Paper>
      </Container>
    </Box>
  );
}
