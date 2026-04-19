import { Box, Container, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function SiteFooter() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "primary.dark",
        color: "grey.100",
        py: 6,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={3}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          flexWrap="wrap"
          useFlexGap
        >
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            © {new Date().getFullYear()} Workforce Cliff. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Link component={RouterLink} to="/privacy" color="inherit" underline="hover">
              Privacy Policy
            </Link>
            <Link component={RouterLink} to="/cookie-policy" color="inherit" underline="hover">
              Cookie Policy
            </Link>
            <Link component={RouterLink} to="/terms" color="inherit" underline="hover">
              Terms of Use
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
