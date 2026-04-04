import "./App.css";
import Link from "@mui/material/Link";
import { Link as RouterLink } from "react-router-dom";
import { AppBar, Container, Toolbar, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <>
      <header>
        <AppBar position="static">
          <Toolbar id="header">
            <Typography variant="h3" component="h1">
              Test Site
            </Typography>
            <div>
              <Link
                sx={{
                  px: 2,
                  "&:hover": {
                    color: "secondary.main",
                  },
                }}
                component={RouterLink}
                to="/contacts"
                color="inherit"
              >
                Contacts
              </Link>
              <Link
                sx={{
                  px: 2,
                  "&:hover": {
                    color: "secondary.main",
                  },
                }}
                component={RouterLink}
                to="/providers"
                color="inherit"
              >
                Providers
              </Link>
            </div>
          </Toolbar>
        </AppBar>
      </header>
      <Container>
        <Outlet />
        <footer></footer>
      </Container>
    </>
  );
}
