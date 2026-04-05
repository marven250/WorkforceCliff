import { Box, Button, Typography, Stack, Container, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const LandingPage = () => {
  return (
    <Box
      sx={{
        height: "75vh",
        display: "flex",
        marginTop: "5%",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
        color: "white",
        textAlign: "center",
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Welcome to our Great Site!
        </Typography>
        <Typography variant="h5" sx={{ mb: 6, opacity: 0.8 }}>
          Select an option below to get started.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={4}
          justifyContent="center"
          alignItems="center"
        >
          <Link
            component={RouterLink}
            to="/contacts"
            color="inherit"
            underline="none"
            sx={{
              "&:hover": {
                color: "secondary.main",
              },
            }}
          >
            <Button
              variant="contained"
              size="large"
              sx={{
                width: { xs: "100%", sm: "250px" },
                height: "100px",
                fontSize: "1.5rem",
                backgroundColor: "#fff",
                color: "#1e3a8a",
                "&:hover": { backgroundColor: "#f0f0f0" },
              }}
            >
              Contacts
            </Button>
          </Link>
          <Link
            component={RouterLink}
            to="/providers"
            color="inherit"
            underline="none"
            sx={{
              "&:hover": {
                color: "secondary.main",
              },
            }}
          >
            <Button
              variant="outlined"
              size="large"
              sx={{
                width: { xs: "100%", sm: "250px" },
                height: "100px",
                fontSize: "1.5rem",
                borderColor: "#fff",
                color: "#fff",
                borderWidth: 2,
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "#f0f0f0",
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Providers
            </Button>
          </Link>
        </Stack>
      </Container>
    </Box>
  );
};

export default LandingPage;
