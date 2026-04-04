import "./Providers.css";
import { Link, List, ListItem, ListItemText } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Provider } from "../../../../shared/Provider.ts";
import { fetchProviders } from "../../services/api.ts";

export default function Providers() {
  

  const [providers, setProviders] = useState<Array<Provider>>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchProviders();

      setProviders(data);
    };

    loadData();
  }, []);

  return (
    <>
      <List>
        {providers.map((provider: Provider) => (
          <>
            <ListItem key={provider.id}>
              <ListItemText primary={provider.name} />
              {provider.is_elligible ? (
                <Link
                  component={RouterLink}
                  to="/providerPortal"
                  state={{ provider: provider }}
                >
                  Go to provider portal
                </Link>
              ) : (
                "Inelligible"
              )}
            </ListItem>
          </>
        ))}
      </List>
    </>
  );
}
