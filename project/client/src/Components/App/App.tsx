import "./App.css";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, NavLink, Outlet, useLocation } from "react-router-dom";
import SiteFooter from "../SiteFooter/SiteFooter";
import { useAuth } from "../../context/AuthContext";

const navHighlightSx = (active: boolean) => ({
  color: "inherit",
  opacity: active ? 1 : 0.88,
  fontWeight: active ? 700 : 500,
  borderBottom: active ? 2 : 0,
  borderColor: "secondary.main",
  borderRadius: 0,
});

export default function App() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky" color="primary" elevation={0}>
        <Toolbar
          id="header"
          sx={{
            maxWidth: "lg",
            width: "100%",
            mx: "auto",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            py: 1,
          }}
        >
          <NavLink to="/" className="nav-link-brand">
            <Typography variant="h6" component="span" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
              Workforce Cliff
            </Typography>
          </NavLink>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
            <Button
              component={RouterLink}
              to="/for-employers"
              color="inherit"
              size="small"
              sx={navHighlightSx(pathname === "/for-employers")}
            >
              Employers
            </Button>
            <Button
              component={RouterLink}
              to="/for-partners"
              color="inherit"
              size="small"
              sx={navHighlightSx(pathname === "/for-partners")}
            >
              Education providers
            </Button>
            <Button
              component={RouterLink}
              to="/for-learners"
              color="inherit"
              size="small"
              sx={navHighlightSx(pathname === "/for-learners")}
            >
              Learners
            </Button>
            <Button component={RouterLink} to="/contact-us" variant="contained" color="secondary" size="small">
              Get started
            </Button>
            {user ? (
              <>
                <Button component={RouterLink} to="/dashboard" color="inherit" size="small">
                  Dashboard
                </Button>
                <Button onClick={logout} color="inherit" size="small">
                  Sign out
                </Button>
              </>
            ) : (
              <Button component={RouterLink} to="/sign-in" color="inherit" size="small">
                Employer/learner sign in
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>
      <SiteFooter />
    </Box>
  );
}
