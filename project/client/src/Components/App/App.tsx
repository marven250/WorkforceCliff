import "./App.css";
import { NavLink } from "react-router-dom";
import { AppBar, Container, Toolbar, Typography } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <>
      <header>
        <AppBar position="static">
          <Toolbar id="header">
            <NavLink to="/" className="nav-link">
              <Typography variant="h3" component="h1" color="white">
                Great Site
              </Typography>
            </NavLink>
            <div>
              <NavLink
                className="nav-link"
                style={({ isActive }) => ({
                  color: isActive ? "#E1BF50" : "white",
                })}
                to="/contacts"
                color="inherit"
              >
                Contacts
              </NavLink>
              <NavLink
                className="nav-link"
                style={({ isActive }) => ({
                  color: isActive ? "#E1BF50" : "white",
                })}
                to="/providers"
                color="inherit"
              >
                Providers
              </NavLink>
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
