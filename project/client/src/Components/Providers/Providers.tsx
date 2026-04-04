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

      //This represents the id of the currently logged in user
      const userId = '1'
      const providerData = await fetchProviders(userId);

      console.log("this is provider data", providerData)
      

      setProviders(providerData);
    };

    loadData();
  }, []);

  return (
    <>
      <List>
        {providers.map((provider: Provider) => (
          <>
          {provider.status != null? <ListItem key={provider.id}>
              <ListItemText primary={provider.name} />
              {provider.status == "eligible" ? (
                <Link
                  component={RouterLink}
                  to={provider.redirect_url}
                >
                  Go to provider portal
                </Link>
              ) : provider.status
                
              }
            </ListItem>: null}
            
          </>
        ))}
      </List>
    </>
  );
}
