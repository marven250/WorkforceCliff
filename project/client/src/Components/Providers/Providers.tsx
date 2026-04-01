import './Providers.css'
import { Link, List, ListItem, ListItemText } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { Provider } from "../../models/Provider";

export default function Providers() {
  const BASE_URL = "http://localhost:3001";

  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const response = await fetch(`${BASE_URL}/providers`);
      const data = await response.json();
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
              {provider.is_elligible? <Link component={RouterLink} to="/providerPortal" state={{ provider: provider }}>Go to provider portal</Link>: "Inelligible"}
              
            </ListItem>
          </>
        ))}
      </List>
    </>
  );
}

