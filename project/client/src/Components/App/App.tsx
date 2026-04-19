import "./App.css";
import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { useMemo } from "react";
import { Link as RouterLink, NavLink, Outlet, useLocation } from "react-router-dom";
import SiteFooter from "../SiteFooter/SiteFooter";
import { useAuth } from "../../context/AuthContext";
import { getStoredTenantSlug } from "../../lib/tenantSession";
import { getTenantBySlug } from "../../../../shared/tenants";

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
  const tenantSlugFromPath = pathname.match(/^\/org\/([^/]+)/)?.[1];
  const tenantFromPath = useMemo(() => getTenantBySlug(tenantSlugFromPath), [tenantSlugFromPath]);
  const isTenantView = Boolean(tenantSlugFromPath && tenantFromPath);

  const dashboardPath = useMemo(() => {
    const fromPath = pathname.match(/^\/org\/([^/]+)/)?.[1];
    const slug = fromPath ?? getStoredTenantSlug();
    if (slug) return `/org/${slug}/dashboard`;
    return "/dashboard";
  }, [pathname]);

  const brandHome =
    isTenantView && tenantSlugFromPath
      ? user
        ? dashboardPath
        : `/org/${tenantSlugFromPath}`
      : "/";

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
          <NavLink to={brandHome} className="nav-link-brand">
            <Box sx={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", columnGap: 1, rowGap: 0.25 }}>
              <Typography variant="h6" component="span" sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}>
                Workforce Cliff
              </Typography>
              {isTenantView && tenantFromPath ? (
                <>
                  <Typography variant="h6" component="span" sx={{ fontWeight: 500, opacity: 0.75 }}>
                    |
                  </Typography>
                  <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
                    {tenantFromPath.name}
                  </Typography>
                </>
              ) : null}
            </Box>
          </NavLink>
          <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
            {isTenantView && tenantSlugFromPath ? (
              user ? (
                <>
                  <Button component={RouterLink} to={dashboardPath} color="inherit" size="small">
                    Dashboard
                  </Button>
                  <Button onClick={logout} color="inherit" size="small">
                    Sign out
                  </Button>
                </>
              ) : (
                <Button
                  component={RouterLink}
                  to={`/org/${tenantSlugFromPath}/sign-in`}
                  color="inherit"
                  size="small"
                >
                  Employer/learner sign in
                </Button>
              )
            ) : (
              <>
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
                    <Button component={RouterLink} to={dashboardPath} color="inherit" size="small">
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
              </>
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
