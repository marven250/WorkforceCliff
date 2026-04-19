import "./Error.css";
import { useRouteError, Link as RouterLink } from "react-router-dom";
import { Box, Button, Container, Typography } from "@mui/material";

export default function ErrorPage() {
  const error = useRouteError() as { statusText?: string; message?: string };
  console.error(error);

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", bgcolor: "background.default" }}>
      <Container maxWidth="sm">
        <Typography variant="h3" component="h1" gutterBottom>
          Something went wrong
        </Typography>
        <Typography color="text.secondary" paragraph>
          {error?.statusText || error?.message || "An unexpected error occurred."}
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" color="primary">
          Back to home
        </Button>
      </Container>
    </Box>
  );
}
