import './App.css'
import Link from '@mui/material/Link';
import { Link as RouterLink } from "react-router-dom";
import { AppBar, Container, Toolbar, Typography } from '@mui/material'
import { Outlet } from 'react-router-dom'

export default function App() {
  return (
    <>
      <header>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h3" component="h1">Test Site</Typography>
            <Link component={RouterLink} to="/contacts" color="inherit">Contacts</Link>
            <Link component={RouterLink} to="/providers" color="inherit">Providers</Link>
          </Toolbar>
        </AppBar>
      </header>
      <Container>
        <Outlet />
        <footer></footer>
      </Container>
    </>
  )
}
