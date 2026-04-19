import "./Providers.css";
import {
  Box,
  Card,
  CardContent,
  Container,
  Link,
  List,
  ListItem,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Provider } from "../../../../shared/Provider.ts";
import { fetchProviders } from "../../services/api.ts";
import { useAuth } from "../../context/AuthContext";

export default function Providers() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Array<Provider>>([]);

  useEffect(() => {
    const loadData = async () => {
      const demoEligibilityUserId = "1";
      const providerData = await fetchProviders(demoEligibilityUserId);
      setProviders(providerData);
    };

    loadData();
  }, []);

  return (
    <Box>
      <Box sx={{ bgcolor: "grey.100", py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Learning provider access
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
            Signed in as <strong>{user?.email}</strong>. Eligibility rows are shown for the seeded
            demo learner profile (legacy <code>users.id = 1</code> in SQLite) so you can still click
            through integrations while auth uses the newer <code>auth_accounts</code> model.
          </Typography>
        </Container>
      </Box>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
              Your connected providers
            </Typography>
            <List disablePadding>
              {providers.map((provider: Provider) =>
                provider.status != null ? (
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
                      {provider.status === "eligible" ? (
                        <Link href={provider.redirect_url} target="_blank" rel="noopener noreferrer">
                          Open provider portal
                        </Link>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Status: {provider.status}
                        </Typography>
                      )}
                    </Stack>
                  </ListItem>
                ) : null,
              )}
            </List>
          </CardContent>
        </Card>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This list reflects sample eligibility rows for user id &quot;1&quot; from the SQLite
          database.
        </Typography>
      </Container>
    </Box>
  );
}
