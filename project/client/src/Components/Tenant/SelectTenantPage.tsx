import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Container,
  InputAdornment,
  Link,
  List,
  ListItemButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { filterTenantsByQuery } from "../../../../shared/tenants";

export default function SelectTenantPage() {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => filterTenantsByQuery(query), [query]);

  return (
    <Box component="article" sx={{ bgcolor: "grey.100", py: { xs: 6, md: 10 } }}>
      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Find your employer
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Search for your organization, then continue to your company&apos;s Workforce Cliff sign-in
          and account options.
        </Typography>
        <TextField
          fullWidth
          placeholder="Search employers"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 2, bgcolor: "background.paper" }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        {query.trim() ? (
          <Paper variant="outlined">
            <List disablePadding>
              {filtered.map((t) => (
                <ListItemButton key={t.slug} component={RouterLink} to={`/org/${t.slug}`}>
                  <Typography variant="body1">{t.name}</Typography>
                </ListItemButton>
              ))}
              {filtered.length === 0 ? (
                <Box sx={{ p: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    No matches. Try the full legal name of your employer or parent company, or{" "}
                    <Link component={RouterLink} to="/contact-us" fontWeight={600}>
                      contact us
                    </Link>{" "}
                    for help.
                  </Typography>
                </Box>
              ) : null}
            </List>
          </Paper>
        ) : null}
      </Container>
    </Box>
  );
}
